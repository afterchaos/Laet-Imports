const fs = require('fs');
const path = require('path');

const { Pool } = (() => {
  try {
    return require('pg');
  } catch (_) {
    return null;
  }
})();

function asNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

function log(msg) {
  console.log(msg);
}

const DATA_DIR = path.join(__dirname, 'data');

const JSON_PATHS = {
  products: path.join(DATA_DIR, 'products.json'),
  categories: path.join(DATA_DIR, 'categories.json'),
  siteContent: path.join(DATA_DIR, 'site-content.json'),
  contact: path.join(DATA_DIR, 'contact.json'),
  users: path.join(DATA_DIR, 'users.json'),
};

const defaults = {
  categories: [
    { id: 'todos', label: 'Todos', protected: true },
    { id: 'vapes', label: 'Vapes', protected: false },
    { id: 'acessorios', label: 'Acessorios', protected: false },
    { id: 'gadgets', label: 'Gadgets', protected: false },
    { id: 'fones', label: 'Fones', protected: false },
  ],
  products: [
    {
      id: 1,
      name: 'Vape Pod System Pro 5000 Puffs',
      category: 'vapes',
      categoryLabel: 'Vapes',
      price: 89.9,
      oldPrice: 129.9,
      installment: '3x de R$ 29,97 sem juros',
      badge: 'sale',
      badgeText: '-31%',
      icon: 'laptop',
      imageUrls: [],
      description: '',
    },
    {
      id: 2,
      name: 'Carregador Portatil 10000mAh',
      category: 'gadgets',
      categoryLabel: 'Gadgets',
      price: 79.9,
      oldPrice: null,
      installment: '2x de R$ 39,95 sem juros',
      badge: 'new',
      badgeText: 'Novo',
      icon: 'storage',
      imageUrls: [],
      description: '',
    },
  ],
  siteContent: {
    heroBadge: 'Vape & Tech',
    heroTitle: 'Os melhores vapes<br>e eletrônicos em um só lugar',
    heroDescription:
      'Encontre dispositivos vape premium, acessórios e gadgets com entrega rápida e garantia confiável.',
    heroBtn1: 'Ver Novidades',
    heroBtn2: 'Promoções',
    feature1Title: 'Produtos Originais',
    feature1Desc: '100% importados com nota fiscal',
    feature2Title: 'Garantia Estendida',
    feature2Desc: 'Até 2 anos de garantia',
    feature3Title: 'Entrega Rápida',
    feature3Desc: 'Para todo o Brasil',
    feature4Title: 'Parcelamento',
    feature4Desc: 'Em até 12x sem juros',
    productsSectionTitle: 'Vapes e Eletrônicos',
    productsSectionDesc:
      'Seleção premium de dispositivos, acessórios e gadgets para quem busca qualidade.',
    offerBadge: 'Oferta Especial',
    offerTitle: 'Até 40% OFF',
    offerDescription:
      'Em vapes, pods e acessórios eletrônicos. Estoque limitado — garanta o seu.',
    offerBtn: 'Aproveitar',
    newsletterTitle: 'Receba ofertas exclusivas',
    newsletterDesc:
      'Fique por dentro de lançamentos em vape e eletrônicos com descontos especiais.',
    footerDescription:
      'Sua loja de confiança para produtos de tecnologia importados.',
    footerCopyright: '&copy; 2026 LAET IMPORTS. Todos os direitos reservados.',
  },
  contact: {
    whatsapp: '',
    instagram: '',
  },
};

function ensureJsonFile(filePath, fallbackValue) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2), 'utf8');
      return fallbackValue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    // Corrupt JSON: overwrite with fallback to keep server running
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2), 'utf8');
    } catch (_) {}
    return fallbackValue;
  }
}

function readJson(filePath, fallbackValue) {
  return ensureJsonFile(filePath, fallbackValue);
}

function writeJsonAtomic(filePath, value) {
  const tmp = filePath + '.tmp';
  const json = JSON.stringify(value, null, 2);
  fs.writeFileSync(tmp, json, 'utf8');
  fs.renameSync(tmp, filePath);
}

function normalizeProductShape(p) {
  return {
    id: Number(p.id),
    name: String(p.name || ''),
    category: String(p.category || 'todos'),
    categoryLabel: String(p.categoryLabel || ''),
    price: Number(p.price ?? 0),
    oldPrice: p.oldPrice === null || p.oldPrice === undefined || p.oldPrice === '' ? null : Number(p.oldPrice),
    installment: String(p.installment || ''),
    badge: p.badge === undefined ? null : (p.badge === null || p.badge === '' ? null : String(p.badge)),
    badgeText: p.badgeText === undefined ? null : (p.badgeText === null || p.badgeText === '' ? null : String(p.badgeText)),
    icon: String(p.icon || ''),
    imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : [],
    description: String(p.description || ''),
  };
}

function normalizeCategoryShape(c) {
  return {
    id: String(c.id || ''),
    label: String(c.label || ''),
    protected: !!c.protected,
  };
}

function normalizeSiteContentShape(sc) {
  return {
    heroBadge: String(sc.heroBadge || ''),
    heroTitle: String(sc.heroTitle || ''),
    heroDescription: String(sc.heroDescription || ''),
    heroBtn1: String(sc.heroBtn1 || ''),
    heroBtn2: String(sc.heroBtn2 || ''),
    feature1Title: String(sc.feature1Title || ''),
    feature1Desc: String(sc.feature1Desc || ''),
    feature2Title: String(sc.feature2Title || ''),
    feature2Desc: String(sc.feature2Desc || ''),
    feature3Title: String(sc.feature3Title || ''),
    feature3Desc: String(sc.feature3Desc || ''),
    feature4Title: String(sc.feature4Title || ''),
    feature4Desc: String(sc.feature4Desc || ''),
    productsSectionTitle: String(sc.productsSectionTitle || ''),
    productsSectionDesc: String(sc.productsSectionDesc || ''),
    offerBadge: String(sc.offerBadge || ''),
    offerTitle: String(sc.offerTitle || ''),
    offerDescription: String(sc.offerDescription || ''),
    offerBtn: String(sc.offerBtn || ''),
    newsletterTitle: String(sc.newsletterTitle || ''),
    newsletterDesc: String(sc.newsletterDesc || ''),
    footerDescription: String(sc.footerDescription || ''),
    footerCopyright: String(sc.footerCopyright || ''),
  };
}

function normalizeContactShape(c) {
  return {
    whatsapp: String(c.whatsapp || ''),
    instagram: String(c.instagram || ''),
  };
}

const DATABASE_MODE = asNonEmptyString(process.env.DATABASE_MODE) || 'postgres';

let _mode = 'local';
let pool = null;

async function tryConnectPostgres() {
  if (!Pool) {
    return { ok: false, reason: 'pg module not available' };
  }

  const hasDatabaseUrl = asNonEmptyString(process.env.DATABASE_URL);
  const hasHost = asNonEmptyString(process.env.PGHOST);
  const hasUser = asNonEmptyString(process.env.PGUSER);
  const hasDb = asNonEmptyString(process.env.PGDATABASE);
  const hasPassword = typeof process.env.PGPASSWORD === 'string' && process.env.PGPASSWORD !== '';

  const connectionConfig = {
    connectionString: hasDatabaseUrl,
    host: hasDatabaseUrl ? undefined : hasHost,
    port: hasDatabaseUrl ? undefined : (process.env.PGPORT ? Number(process.env.PGPORT) : undefined),
    user: hasDatabaseUrl ? undefined : hasUser,
    database: hasDatabaseUrl ? undefined : hasDb,
    password: hasDatabaseUrl ? undefined : process.env.PGPASSWORD,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };

  // Avoid pg throwing password must be a string when password is undefined/empty
  if (!hasDatabaseUrl && !hasPassword) {
    return { ok: false, reason: 'PGPASSWORD missing/invalid' };
  }
  if (!hasDatabaseUrl && (!hasHost || !hasUser || !hasDb)) {
    return { ok: false, reason: 'PG connection params missing' };
  }

  try {
    pool = new Pool(connectionConfig);
    await pool.query('select 1 as ok');
    return { ok: true };
  } catch (e) {
    try {
      if (pool) await pool.end();
    } catch (_) {}
    pool = null;
    return { ok: false, reason: e && e.message ? e.message : String(e) };
  }
}

let initPromise = null;
function init() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Always ensure JSON files exist so server has fallback data immediately
    ensureJsonFile(JSON_PATHS.products, defaults.products);
    ensureJsonFile(JSON_PATHS.categories, defaults.categories);
    ensureJsonFile(JSON_PATHS.siteContent, defaults.siteContent);
    ensureJsonFile(JSON_PATHS.contact, defaults.contact);

    if (DATABASE_MODE === 'local') {
      log('[DATABASE] Utilizando armazenamento local JSON.');
      _mode = 'local';
      return;
    }

    const r = await tryConnectPostgres();
    if (r.ok) {
      log('[DATABASE] PostgreSQL conectado.');
      _mode = 'postgres';
      return;
    }

    log('[DATABASE] PostgreSQL indisponível.');
    log(`[DATABASE] motivo: ${r && r.reason ? r.reason : 'desconhecido'}`);
    log('[DATABASE] Utilizando armazenamento local JSON.');
    _mode = 'local';
  })();

  return initPromise;
}

function getMode() {
  return _mode;
}

// =====================
// Abstraction functions
// =====================

async function getProducts() {
  await init();

  if (_mode === 'postgres') {
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
      const url = PUBLIC_UPLOAD_DIR + '/' + path.basename(row.image_path);
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

  const arr = readJson(JSON_PATHS.products, defaults.products);
  return Array.isArray(arr) ? arr.map(normalizeProductShape) : [];
}

async function saveProducts(products) {
  await init();

  if (_mode === 'postgres') {
    // Upsert product + replace images
    const prods = Array.isArray(products) ? products : [];

    const PUBLIC_DIR = process.env.PUBLIC_UPLOAD_DIR || '/uploads';
    // We persist only the image file paths we receive (urls). For postgres we store "image_path".
    // If user passes URLs, extract basename.
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

        // Replace images
        await pool.query('DELETE FROM laet_product_images WHERE product_id=$1', [Number(p.id)]);

        const urls = Array.isArray(p.imageUrls) ? p.imageUrls : [];
        for (let i = 0; i < urls.length; i++) {
          const url = String(urls[i] || '');
          const base = path.basename(url);
          // store full path relative to FS: uploads/products/<id>/<basename>
          const imagePath = path.join(process.env.UPLOAD_DIR ? process.env.UPLOAD_DIR : path.join(__dirname, 'uploads-placeholder'), 'products', String(p.id), base);
          // If UPLOAD_DIR is set to existing uploads folder, use it; else fallback.
          const actualUploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
          const imagePath2 = path.join(actualUploadDir, 'products', String(p.id), base);

          await pool.query(`
            INSERT INTO laet_product_images (product_id, image_path, image_order)
            VALUES ($1,$2,$3)
          `, [Number(p.id), imagePath2, i]);
        }
      }

      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      throw e;
    }

    return;
  }

  const current = readJson(JSON_PATHS.products, defaults.products);
  const map = new Map((Array.isArray(current) ? current : []).map(p => [Number(p.id), p]));

  for (const raw of products || []) {
    const p = normalizeProductShape(raw);
    map.set(Number(p.id), p);
  }

  // Return to array sorted
  const out = Array.from(map.values()).sort((a, b) => Number(a.id) - Number(b.id));
  writeJsonAtomic(JSON_PATHS.products, out);
}

async function getCategories() {
  await init();
  if (_mode === 'postgres') {
    const r = await pool.query('SELECT id, label, protected FROM laet_categories ORDER BY id');
    return r.rows.map(normalizeCategoryShape);
  }
  const arr = readJson(JSON_PATHS.categories, defaults.categories);
  return Array.isArray(arr) ? arr.map(normalizeCategoryShape) : [];
}

async function saveCategories(categories) {
  await init();

  const cats = Array.isArray(categories) ? categories : [];

  if (_mode === 'postgres') {
    await pool.query('BEGIN');
    try {
      for (const c of cats) {
        const id = String(c.id || '');
        await pool.query(`
          INSERT INTO laet_categories (id, label, protected)
          VALUES ($1,$2,$3)
          ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, protected=EXCLUDED.protected
        `, [id, String(c.label || ''), !!c.protected]);
      }
      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      throw e;
    }
    return;
  }

  const current = readJson(JSON_PATHS.categories, defaults.categories);
  const map = new Map((Array.isArray(current) ? current : []).map(c => [String(c.id), c]));
  for (const raw of cats) {
    const c = normalizeCategoryShape(raw);
    if (!c.id) continue;
    map.set(c.id, c);
  }
  const out = Array.from(map.values()).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  writeJsonAtomic(JSON_PATHS.categories, out);
}

async function getSiteContent() {
  await init();
  if (_mode === 'postgres') {
    const r = await pool.query('SELECT * FROM laet_site_content WHERE id=1');
    const row = r.rows[0];
    if (!row) return null;
    return normalizeSiteContentShape({
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
    });
  }
  const sc = readJson(JSON_PATHS.siteContent, defaults.siteContent);
  return normalizeSiteContentShape(sc || {});
}

async function saveSiteContent(content) {
  await init();

  const sc = normalizeSiteContentShape(content || {});

  if (_mode === 'postgres') {
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
      sc.heroBadge,
      sc.heroTitle,
      sc.heroDescription,
      sc.heroBtn1,
      sc.heroBtn2,
      sc.feature1Title,
      sc.feature1Desc,
      sc.feature2Title,
      sc.feature2Desc,
      sc.feature3Title,
      sc.feature3Desc,
      sc.feature4Title,
      sc.feature4Desc,
      sc.productsSectionTitle,
      sc.productsSectionDesc,
      sc.offerBadge,
      sc.offerTitle,
      sc.offerDescription,
      sc.offerBtn,
      sc.newsletterTitle,
      sc.newsletterDesc,
      sc.footerDescription,
      sc.footerCopyright,
    ]);
    return;
  }

  writeJsonAtomic(JSON_PATHS.siteContent, sc);
}

async function getContact() {
  await init();
  if (_mode === 'postgres') {
    const r = await pool.query('SELECT * FROM laet_contact WHERE id=1');
    const row = r.rows[0] || { whatsapp: '', instagram: '' };
    return normalizeContactShape({ whatsapp: row.whatsapp, instagram: row.instagram });
  }
  const c = readJson(JSON_PATHS.contact, defaults.contact);
  return normalizeContactShape(c || {});
}

async function saveContact(contact) {
  await init();

  const c = normalizeContactShape(contact || {});

  if (_mode === 'postgres') {
    await pool.query('UPDATE laet_contact SET whatsapp=$1, instagram=$2 WHERE id=1', [c.whatsapp, c.instagram]);
    return;
  }

  writeJsonAtomic(JSON_PATHS.contact, c);
}

// =====================
// Users (Postgres)
// =====================

async function getUsers() {
  await init();

  if (_mode !== 'postgres') {
    // fallback só pra não quebrar em dev; na VPS o esperado é postgres ativo
    const raw = readJson(JSON_PATHS.users, { users: [] });
    const users = Array.isArray(raw.users) ? raw.users : [];
    return users.map(u => ({
      id: Number(u.id),
      username: String(u.username || ''),
      password: String(u.password || ''),
      role: String(u.role || 'editor'),
      name: String(u.name || ''),
    }));
  }

  const r = await pool.query(`
    SELECT id, username, password, role, name
    FROM laet_users
    ORDER BY id ASC
  `);

  return r.rows.map(row => ({
    id: Number(row.id),
    username: String(row.username),
    password: String(row.password || ''),
    role: String(row.role || 'editor'),
    name: String(row.name || ''),
  }));
}

async function createUser(user) {
  await init();

  const u = {
    id: user && user.id !== undefined ? Number(user.id) : undefined,
    username: String(user && user.username ? user.username : ''),
    password: String(user && user.password !== undefined ? user.password : ''),
    role: String(user && user.role ? user.role : 'editor'),
    name: String(user && user.name ? user.name : ''),
  };

  if (!u.username) throw new Error('username é obrigatório');

  if (_mode !== 'postgres') {
    const parsed = readJson(JSON_PATHS.users, { users: [] });
    const users = Array.isArray(parsed.users) ? parsed.users : [];

    const nextId = u.id || (users.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1);
    if (users.some(x => String(x.username) === u.username)) throw new Error('Username exists');
    if (nextId === 1) throw new Error('Protected');

    users.push({ id: nextId, username: u.username, password: u.password, role: u.role, name: u.name });
    writeJsonAtomic(JSON_PATHS.users, { users });
    return nextId;
  }

  // valida username único
  const exists = await pool.query('SELECT 1 FROM laet_users WHERE username=$1 LIMIT 1', [u.username]);
  if (exists.rows.length) throw new Error('Username exists');

  const nextId = u.id || undefined;
  if (nextId === 1) throw new Error('Protected');

  if (nextId) {
    await pool.query(`
      INSERT INTO laet_users (id, username, password, role, name)
      VALUES ($1,$2,$3,$4,$5)
    `, [nextId, u.username, u.password, u.role, u.name]);
    return nextId;
  }

  const r = await pool.query(`
    INSERT INTO laet_users (username, password, role, name)
    VALUES ($1,$2,$3,$4)
    RETURNING id
  `, [u.username, u.password, u.role, u.name]);

  return Number(r.rows[0].id);
}

async function updateUser(id, patch, opts = {}) {
  await init();
  const userId = Number(id);
  if (!userId || Number.isNaN(userId)) throw new Error('id inválido');

  if (userId === 1 && opts.adminRole !== 'admin') {
    throw new Error('Forbidden');
  }

  const p = patch || {};
  const fields = [];
  const values = [];
  let idx = 1;

  if (p.username !== undefined) {
    fields.push(`username=$${idx++}`);
    values.push(String(p.username));
  }
  if (p.password !== undefined) {
    fields.push(`password=$${idx++}`);
    values.push(String(p.password));
  }
  if (p.role !== undefined) {
    fields.push(`role=$${idx++}`);
    values.push(String(p.role));
  }
  if (p.name !== undefined) {
    fields.push(`name=$${idx++}`);
    values.push(String(p.name));
  }

  if (!fields.length) return;

  if (_mode !== 'postgres') {
    const parsed = readJson(JSON_PATHS.users, { users: [] });
    const users = Array.isArray(parsed.users) ? parsed.users : [];
    const existing = users.find(x => Number(x.id) === userId);
    if (!existing) throw new Error('Not found');

    if (p.name !== undefined) existing.name = String(p.name);
    if (p.username !== undefined) existing.username = String(p.username);
    if (p.password !== undefined) existing.password = String(p.password);
    if (p.role !== undefined) existing.role = String(p.role);

    writeJsonAtomic(JSON_PATHS.users, { users });
    return;
  }

  values.push(userId);
  await pool.query(`UPDATE laet_users SET ${fields.join(', ')} WHERE id=$${idx}`, values);
}

async function deleteUser(id, opts = {}) {
  await init();
  const userId = Number(id);

  if (userId === 1) throw new Error('Protected');

  if (_mode !== 'postgres') {
    const parsed = readJson(JSON_PATHS.users, { users: [] });
    const users = Array.isArray(parsed.users) ? parsed.users : [];
    const out = users.filter(u => Number(u.id) !== userId);
    writeJsonAtomic(JSON_PATHS.users, { users: out });
    return;
  }

  await pool.query('DELETE FROM laet_users WHERE id=$1', [userId]);
}

module.exports = {
  getProducts,
  saveProducts,
  getCategories,
  saveCategories,
  getSiteContent,
  saveSiteContent,
  getContact,
  saveContact,

  // Users (Postgres-first)
  getUsers,
  createUser,
  updateUser,
  deleteUser,

  // for debugging only
  _getMode: getMode,
  _init: init,
};

