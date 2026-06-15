const path = require('path');

let Pool;
try {
  ({ Pool } = require('pg'));
} catch (_) {
  Pool = null;
}

function asNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

function log(msg) {
  console.log(msg);
}

function mustPool() {
  if (!Pool) throw new Error('pg package não está disponível. Instale dependências: npm install');
  return Pool;
}

// Defaults usados para garantir integridade mínima (categorias + linha única de site/contact)
const defaults = {
  categories: [
    { id: 'todos', label: 'Todos', protected: true },
    { id: 'vapes', label: 'Vapes', protected: false },
    { id: 'acessorios', label: 'Acessorios', protected: false },
    { id: 'gadgets', label: 'Gadgets', protected: false },
    { id: 'fones', label: 'Fones', protected: false },
  ],
};

let pool = null;
let initPromise = null;

function getConnectionConfig() {
  // Obrigatório: PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE
  const hasHost = asNonEmptyString(process.env.PGHOST);
  const hasUser = asNonEmptyString(process.env.PGUSER);
  const hasDb = asNonEmptyString(process.env.PGDATABASE);
  const hasPassword = typeof process.env.PGPASSWORD === 'string';

  if (!hasHost || !hasUser || !hasDb || !hasPassword) {
    throw new Error('Missing PGHOST/PGUSER/PGPASSWORD/PGDATABASE (PGPORT é opcional)');
  }

  return {
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

async function initializeDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    mustPool();

    if (!pool) {
      pool = new Pool(getConnectionConfig());
    }

    // Conecta/verifica
    await pool.query('select 1 as ok');

    // Cria tabelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS laet_users (\r\n        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\r\n        username    TEXT NOT NULL UNIQUE,\r\n        password    TEXT NOT NULL,\r\n        role        TEXT NOT NULL DEFAULT 'editor',\r\n        name        TEXT NOT NULL DEFAULT ''\r\n      );\r\n

      CREATE TABLE IF NOT EXISTS laet_categories (
        id          TEXT PRIMARY KEY,
        label       TEXT NOT NULL DEFAULT '',
        protected   BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS laet_products (
        id                 INTEGER PRIMARY KEY,
        name               TEXT NOT NULL DEFAULT '',
        category          TEXT NOT NULL DEFAULT 'todos',
        category_label    TEXT NOT NULL DEFAULT '',
        price              NUMERIC(12,2) NOT NULL DEFAULT 0,
        old_price         NUMERIC(12,2) NULL,
        installment       TEXT NOT NULL DEFAULT '',
        badge             TEXT NULL,
        badge_text        TEXT NULL,
        icon              TEXT NOT NULL DEFAULT '',
        description       TEXT NOT NULL DEFAULT '',
        CONSTRAINT fk_products_category
          FOREIGN KEY (category)
          REFERENCES laet_categories(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS laet_product_images (
        id           BIGSERIAL PRIMARY KEY,
        product_id  INTEGER NOT NULL,
        image_path  TEXT NOT NULL,
        image_order INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT fk_product_images_product
          FOREIGN KEY (product_id)
          REFERENCES laet_products(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_laet_product_images_product_order
        ON laet_product_images(product_id, image_order, id);

      CREATE TABLE IF NOT EXISTS laet_site_content (
        id                      INTEGER PRIMARY KEY CHECK (id = 1),
        hero_badge              TEXT NOT NULL DEFAULT '',
        hero_title              TEXT NOT NULL DEFAULT '',
        hero_description        TEXT NOT NULL DEFAULT '',
        hero_btn_1              TEXT NOT NULL DEFAULT '',
        hero_btn_2              TEXT NOT NULL DEFAULT '',
        feature_1_title        TEXT NOT NULL DEFAULT '',
        feature_1_desc          TEXT NOT NULL DEFAULT '',
        feature_2_title        TEXT NOT NULL DEFAULT '',
        feature_2_desc          TEXT NOT NULL DEFAULT '',
        feature_3_title        TEXT NOT NULL DEFAULT '',
        feature_3_desc          TEXT NOT NULL DEFAULT '',
        feature_4_title        TEXT NOT NULL DEFAULT '',
        feature_4_desc          TEXT NOT NULL DEFAULT '',
        products_section_title TEXT NOT NULL DEFAULT '',
        products_section_desc  TEXT NOT NULL DEFAULT '',
        offer_badge             TEXT NOT NULL DEFAULT '',
        offer_title            TEXT NOT NULL DEFAULT '',
        offer_description      TEXT NOT NULL DEFAULT '',
        offer_btn              TEXT NOT NULL DEFAULT '',
        newsletter_title       TEXT NOT NULL DEFAULT '',
        newsletter_desc        TEXT NOT NULL DEFAULT '',
        footer_description      TEXT NOT NULL DEFAULT '',
        footer_copyright        TEXT NOT NULL DEFAULT ''
      );

      INSERT INTO laet_site_content (id) VALUES (1)
      ON CONFLICT (id) DO NOTHING;

      CREATE TABLE IF NOT EXISTS laet_contact (
        id          INTEGER PRIMARY KEY CHECK (id = 1),
        whatsapp    TEXT NOT NULL DEFAULT '',
        instagram   TEXT NOT NULL DEFAULT ''
      );

      INSERT INTO laet_contact (id) VALUES (1)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Integridade: categorias mínimas
    for (const c of defaults.categories) {
      await pool.query(
        `INSERT INTO laet_categories (id,label,protected)
         VALUES ($1,$2,$3)
         ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, protected=EXCLUDED.protected`,
        [c.id, c.label, !!c.protected]
      );
    }

  // Migração segura de PK id -> IDENTITY (evita null/400 em INSERT sem id)
    await pool.query(`
      DO $$
      BEGIN
        -- Se laet_users existir e a coluna id não for identidade, converte (preservando dados)
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema='public' AND table_name='laet_users') THEN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema='public'
              AND table_name='laet_users'
              AND column_name='id'
              AND (
                COALESCE(column_default,'') NOT ILIKE '%identity%'
                OR COALESCE(is_identity,'NO') <> 'YES'
              )
          ) THEN
            -- Remove a PK atual, se necessário
            BEGIN
              IF EXISTS (
                SELECT 1
                FROM information_schema.table_constraints tc
                WHERE tc.table_schema='public'
                  AND tc.table_name='laet_users'
                  AND tc.constraint_type='PRIMARY KEY'
              ) THEN
                EXECUTE (
                  SELECT 'ALTER TABLE public.laet_users DROP CONSTRAINT ' || quote_ident(constraint_name)
                  FROM (
                    SELECT tc.constraint_name
                    FROM information_schema.table_constraints tc
                    WHERE tc.table_schema='public'
                      AND tc.table_name='laet_users'
                      AND tc.constraint_type='PRIMARY KEY'
                  ) t
                );
              END IF;
            EXCEPTION WHEN OTHERS THEN
              -- se falhar por falta de constraint, segue
              NULL;
            END;

            -- Ajusta a coluna para IDENTITY (pode já estar como identity em alguns bancos)
            BEGIN
              EXECUTE 'ALTER TABLE public.laet_users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY';
            EXCEPTION WHEN duplicate_object OR invalid_parameter_value OR feature_not_supported OR invalid_table_definition OR others THEN
              -- Se já era identity ou não suportar a alteração, ignora
              NULL;
            END;

            -- Recria PK na coluna id
            BEGIN
              EXECUTE 'ALTER TABLE public.laet_users ADD PRIMARY KEY (id)';
            EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
          END IF;
        END IF;

        -- Ressincroniza a sequence da IDENTITY com o maior id existente
        -- (evita "duplicate key value violates unique constraint laet_users_pkey")
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema='public' AND table_name='laet_users') THEN
          PERFORM setval(
            pg_get_serial_sequence('public.laet_users','id'),
            COALESCE((SELECT MAX(id) FROM public.laet_users), 0) + 1,
            false
          );
        END IF;
      END$$;
    `);

    // Logs: tabelas/colunas/PK/FK/índices
    const schemaRows = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name IN ('laet_users','laet_categories','laet_products','laet_product_images','laet_site_content','laet_contact')
      ORDER BY table_name, ordinal_position
    `);

    console.log('[DATABASE] initializeDatabase OK');

    console.log('[DATABASE] Tabelas/colunas:');
    for (const r of schemaRows.rows) {
      console.log(`- ${r.table_name}.${r.column_name} (${r.data_type}, nullable=${r.is_nullable})`);
    }

    const pkRows = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema='public'
        AND tc.constraint_type='PRIMARY KEY'
        AND tc.table_name IN ('laet_users','laet_categories','laet_products','laet_product_images','laet_site_content','laet_contact')
      ORDER BY tc.table_name, kcu.ordinal_position
    `);

    console.log('[DATABASE] PKs:');
    for (const r of pkRows.rows) {
      console.log(`- ${r.table_name}.${r.column_name} (constraint=${r.constraint_name})`);
    }

    const fkRows = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema='public'
        AND tc.constraint_type='FOREIGN KEY'
        AND tc.table_name IN ('laet_products','laet_product_images')
      ORDER BY tc.table_name
    `);

    console.log('[DATABASE] FKs:');
    for (const r of fkRows.rows) {
      console.log(`- ${r.table_name}.${r.column_name} -> ${r.foreign_table}.${r.foreign_column} (constraint=${r.constraint_name})`);
    }

    const idxRows = await pool.query(`
      SELECT
        indexname,
        tablename,
        indexdef
      FROM pg_indexes
      WHERE schemaname='public'
        AND tablename IN ('laet_users','laet_categories','laet_products','laet_product_images','laet_site_content','laet_contact')
      ORDER BY tablename, indexname
    `);

    console.log('[DATABASE] Índices:');
    for (const r of idxRows.rows) {
      console.log(`- ${r.tablename}: ${r.indexname}`);
    }

    return true;
  })();

  return initPromise;
}

function ensureImgUrlToPath(url) {
  // O projeto original armazena image_path como caminho do arquivo no FS.
  // A API envia a URL como /uploads/.../arquivo. Então persistimos o caminho (com base no PUBLIC upload dir).
  const PUBLIC_DIR = process.env.PUBLIC_UPLOAD_DIR || '/uploads';
  if (typeof url !== 'string') return '';
  const cleaned = url.startsWith(PUBLIC_DIR) ? url.slice(PUBLIC_DIR.length) : url;
  const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
  // cleaned começa com /products/... se url era /uploads/products/...
  return path.join(UPLOAD_DIR, cleaned.replace(/^\//, ''));
}

async function getProducts() {
  await initializeDatabase();

  const { rows } = await pool.query(`
    SELECT p.*, c.label as category_label_display
    FROM laet_products p
    JOIN laet_categories c ON c.id = p.category
    ORDER BY p.id ASC
  `);

  if (!rows.length) return [];

  const ids = rows.map(r => Number(r.id));
  const img = await pool.query(`
    SELECT product_id, image_path, image_order
    FROM laet_product_images
    WHERE product_id = ANY($1)
    ORDER BY image_order ASC, id ASC
  `, [ids]);

  const PUBLIC_UPLOAD_DIR = process.env.PUBLIC_UPLOAD_DIR || '/uploads';
  const imagesMap = new Map();
  for (const row of img.rows) {
    const pid = Number(row.product_id);
    if (!imagesMap.has(pid)) imagesMap.set(pid, []);

    const base = path.basename(row.image_path);
    const rel = row.image_path.replace(new RegExp('^.*?\\' + base + '$'), '');
    // Melhor: monta URL a partir do caminho real.
    const url = PUBLIC_UPLOAD_DIR + '/' + path.relative(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads'), row.image_path).replace(/\\/g, '/');
    imagesMap.get(pid).push(url);
  }

  return rows.map(p => ({
    id: Number(p.id),
    name: p.name,
    category: p.category,
    categoryLabel: p.category_label_display,
    price: Number(p.price),
    oldPrice: p.old_price !== null ? Number(p.old_price) : null,
    installment: p.installment,
    badge: p.badge,
    badgeText: p.badge_text,
    icon: p.icon,
    description: p.description,
    imageUrls: imagesMap.get(Number(p.id)) || [],
    imageUrl: (imagesMap.get(Number(p.id)) || [])[0] || '',
  }));
}

async function saveProducts(products) {
  await initializeDatabase();

  const prods = Array.isArray(products) ? products : [];

  await pool.query('BEGIN');
  try {
    for (const p of prods) {
      const badge = p.badge || null;
      const badgeText = p.badgeText || null;

      await pool.query(`
        INSERT INTO laet_products
          (id, name, category, category_label, price, old_price, installment,
           badge, badge_text, icon, description)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          category_label = EXCLUDED.category_label,
          price = EXCLUDED.price,
          old_price = EXCLUDED.old_price,
          installment = EXCLUDED.installment,
          badge = EXCLUDED.badge,
          badge_text = EXCLUDED.badge_text,
          icon = EXCLUDED.icon,
          description = EXCLUDED.description
      `, [
        Number(p.id),
        String(p.name || ''),
        String(p.category || 'todos'),
        String(p.categoryLabel || ''),
        Number(p.price ?? 0),
        p.oldPrice === null || p.oldPrice === undefined || p.oldPrice === '' ? null : Number(p.oldPrice),
        String(p.installment || ''),
        badge,
        badgeText,
        String(p.icon || ''),
        String(p.description || ''),
      ]);

      await pool.query('DELETE FROM laet_product_images WHERE product_id=$1', [Number(p.id)]);

      const urls = Array.isArray(p.imageUrls) ? p.imageUrls : [];
      for (let i = 0; i < urls.length; i++) {
        const url = String(urls[i] || '');
        if (!url) continue;
        const imagePath = ensureImgUrlToPath(url);

        await pool.query(`
          INSERT INTO laet_product_images (product_id, image_path, image_order)
          VALUES ($1,$2,$3)
        `, [Number(p.id), imagePath, i]);
      }
    }

    await pool.query('COMMIT');
  } catch (e) {
    await pool.query('ROLLBACK');
    throw e;
  }
}

async function getCategories() {
  await initializeDatabase();
  const r = await pool.query('SELECT id, label, protected FROM laet_categories ORDER BY id');
  return r.rows.map(rw => ({
    id: String(rw.id),
    label: String(rw.label),
    protected: !!rw.protected,
  }));
}

async function saveCategories(categories) {
  await initializeDatabase();

  const cats = Array.isArray(categories) ? categories : [];

  await pool.query('BEGIN');
  try {
    for (const c of cats) {
      const id = String(c.id || '');
      if (!id) continue;

      await pool.query(`
        INSERT INTO laet_categories (id, label, protected)
        VALUES ($1,$2,$3)
        ON CONFLICT (id) DO UPDATE SET
          label=EXCLUDED.label,
          protected=EXCLUDED.protected
      `, [id, String(c.label || ''), !!c.protected]);
    }
    await pool.query('COMMIT');
  } catch (e) {
    await pool.query('ROLLBACK');
    throw e;
  }
}

async function getSiteContent() {
  await initializeDatabase();
  const r = await pool.query('SELECT * FROM laet_site_content WHERE id=1');
  const row = r.rows[0];
  if (!row) return null;

  return {
    heroBadge: row.hero_badge,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    heroBtn1: row.hero_btn_1,
    heroBtn2: row.hero_btn_2,
    feature1Title: row.feature_1_title,
    feature1Desc: row.feature_1_desc,
    feature2Title: row.feature_2_title,
    feature2Desc: row.feature_2_desc,
    feature3Title: row.feature_3_title,
    feature3Desc: row.feature_3_desc,
    feature4Title: row.feature_4_title,
    feature4Desc: row.feature_4_desc,
    productsSectionTitle: row.products_section_title,
    productsSectionDesc: row.products_section_desc,
    offerBadge: row.offer_badge,
    offerTitle: row.offer_title,
    offerDescription: row.offer_description,
    offerBtn: row.offer_btn,
    newsletterTitle: row.newsletter_title,
    newsletterDesc: row.newsletter_desc,
    footerDescription: row.footer_description,
    footerCopyright: row.footer_copyright,
  };
}

async function saveSiteContent(content) {
  await initializeDatabase();

  const sc = content || {};

  await pool.query(`
    UPDATE laet_site_content SET
      hero_badge=$1, hero_title=$2, hero_description=$3, hero_btn_1=$4, hero_btn_2=$5,
      feature_1_title=$6, feature_1_desc=$7,
      feature_2_title=$8, feature_2_desc=$9,
      feature_3_title=$10, feature_3_desc=$11,
      feature_4_title=$12, feature_4_desc=$13,
      products_section_title=$14, products_section_desc=$15,
      offer_badge=$16, offer_title=$17, offer_description=$18, offer_btn=$19,
      newsletter_title=$20, newsletter_desc=$21,
      footer_description=$22, footer_copyright=$23
    WHERE id=1
  `, [
    String(sc.heroBadge || ''),
    String(sc.heroTitle || ''),
    String(sc.heroDescription || ''),
    String(sc.heroBtn1 || ''),
    String(sc.heroBtn2 || ''),
    String(sc.feature1Title || ''),
    String(sc.feature1Desc || ''),
    String(sc.feature2Title || ''),
    String(sc.feature2Desc || ''),
    String(sc.feature3Title || ''),
    String(sc.feature3Desc || ''),
    String(sc.feature4Title || ''),
    String(sc.feature4Desc || ''),
    String(sc.productsSectionTitle || ''),
    String(sc.productsSectionDesc || ''),
    String(sc.offerBadge || ''),
    String(sc.offerTitle || ''),
    String(sc.offerDescription || ''),
    String(sc.offerBtn || ''),
    String(sc.newsletterTitle || ''),
    String(sc.newsletterDesc || ''),
    String(sc.footerDescription || ''),
    String(sc.footerCopyright || ''),
  ]);
}

async function getContact() {
  await initializeDatabase();
  const r = await pool.query('SELECT * FROM laet_contact WHERE id=1');
  const row = r.rows[0] || { whatsapp: '', instagram: '' };
  return {
    whatsapp: row.whatsapp,
    instagram: row.instagram,
  };
}

async function saveContact(contact) {
  await initializeDatabase();
  const c = contact || {};
  await pool.query('UPDATE laet_contact SET whatsapp=$1, instagram=$2 WHERE id=1', [
    String(c.whatsapp || ''),
    String(c.instagram || ''),
  ]);
}

async function getUsers() {
  await initializeDatabase();
  const r = await pool.query('SELECT id, username, password, role, name FROM laet_users ORDER BY id ASC');
  return r.rows.map(row => ({
    id: Number(row.id),
    username: String(row.username),
    password: String(row.password || ''),
    role: String(row.role || 'editor'),
    name: String(row.name || ''),
  }));
}

async function createUser(user) {
  await initializeDatabase();

  const username = String(user?.username ?? '').trim();
  const password = typeof user?.password === 'string' ? user.password : String(user?.password ?? '');
  const role = String(user?.role || 'editor');
  const name = String(user?.name || '');
  const id = user?.id !== undefined ? Number(user.id) : undefined;

  if (!username) throw new Error('username é obrigatório');
  if (!password) throw new Error('password é obrigatório');

  if (id !== undefined && !Number.isNaN(id)) {
    if (id === 1) throw new Error('Protected');

    await pool.query(`
      INSERT INTO laet_users (id, username, password, role, name)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (username) DO UPDATE SET
        password=EXCLUDED.password,
        role=EXCLUDED.role,
        name=EXCLUDED.name,
        id=EXCLUDED.id
    `, [id, username, password, role, name]);

    return id;
  }


  if (username === 'admin') {
    // mantém compatibilidade: não protege por username (protegemos id=1)
  }

  const r = await pool.query(`
    INSERT INTO laet_users (username, password, role, name)
    VALUES ($1,$2,$3,$4)
    RETURNING id
  `, [username, password, role, name]);

  const newId = Number(r.rows[0].id);
  if (newId === 1) throw new Error('Protected');
  return newId;
}

async function updateUser(id, patch, opts = {}) {
  await initializeDatabase();

  const userId = Number(id);
  if (!userId || Number.isNaN(userId)) throw new Error('id inválido');
  if (userId === 1 && opts.adminRole !== 'admin') throw new Error('Forbidden');

  const p = patch || {};
  const fields = [];
  const values = [];

  if (p.username !== undefined) {
    fields.push(`username=$${fields.length + 1}`);
    values.push(String(p.username));
  }
  if (p.password !== undefined) {
    fields.push(`password=$${fields.length + 1}`);
    values.push(String(p.password));
  }
  if (p.role !== undefined) {
    fields.push(`role=$${fields.length + 1}`);
    values.push(String(p.role));
  }
  if (p.name !== undefined) {
    fields.push(`name=$${fields.length + 1}`);
    values.push(String(p.name));
  }

  if (!fields.length) return;

  values.push(userId);
  const sql = `UPDATE laet_users SET ${fields.join(', ')} WHERE id=$${fields.length + 1}`;
  await pool.query(sql, values);
}

async function deleteUser(id) {
  await initializeDatabase();

  const userId = Number(id);
  if (userId === 1) throw new Error('Protected');

  await pool.query('DELETE FROM laet_users WHERE id=$1', [userId]);
}

module.exports = {
  initializeDatabase,

  getProducts,
  saveProducts,
  getCategories,
  saveCategories,
  getSiteContent,
  saveSiteContent,
  getContact,
  saveContact,

  getUsers,
  createUser,
  updateUser,
  deleteUser,

  // compatibilidade (server.js usa _init/_getMode no /health e requireAdmin)
  _init: initializeDatabase,
  _getMode: () => process.env.DATABASE_MODE || 'postgres',
};