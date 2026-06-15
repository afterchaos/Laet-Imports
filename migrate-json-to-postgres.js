// LAET IMPORTS - migrate-json-to-postgres
// Script opcional para importar data/*.json -> PostgreSQL.
//
// Uso:
//   node migrate-json-to-postgres.js
//
// Requer as variáveis:
//   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function asNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function main() {
  const hasHost = asNonEmptyString(process.env.PGHOST);
  const hasUser = asNonEmptyString(process.env.PGUSER);
  const hasDb = asNonEmptyString(process.env.PGDATABASE);
  const hasPassword = typeof process.env.PGPASSWORD === 'string' && process.env.PGPASSWORD !== '';

  if (!hasHost || !hasUser || !hasDb || !hasPassword) {
    console.error('Missing PGHOST/PGUSER/PGPASSWORD/PGDATABASE');
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  const DATA_DIR = path.join(__dirname, 'data');
  const JSON_PATHS = {
    products: path.join(DATA_DIR, 'products.json'),
    categories: path.join(DATA_DIR, 'categories.json'),
    siteContent: path.join(DATA_DIR, 'site-content.json'),
    contact: path.join(DATA_DIR, 'contact.json'),
    users: path.join(DATA_DIR, 'users.json'),
  };

  const products = readJson(JSON_PATHS.products, []);
  const categories = readJson(JSON_PATHS.categories, []);
  const siteContent = readJson(JSON_PATHS.siteContent, {});
  const contact = readJson(JSON_PATHS.contact, {});
  const usersRaw = readJson(JSON_PATHS.users, { users: [] });
  const users = ensureArray(usersRaw.users || usersRaw);

  return pool
    .query('BEGIN')
    .then(async () => {
      // categories
      for (const c of ensureArray(categories)) {
        const id = String(c.id || '');
        if (!id) continue;
        await pool.query(
          `INSERT INTO laet_categories (id, label, protected)
           VALUES ($1,$2,$3)
           ON CONFLICT (id) DO UPDATE SET
             label=EXCLUDED.label,
             protected=EXCLUDED.protected`,
          [id, String(c.label || ''), !!c.protected]
        );
      }

      // products (+images)
      for (const p of ensureArray(products)) {
        const id = Number(p.id);
        if (!id || Number.isNaN(id)) continue;

        await pool.query(
          `INSERT INTO laet_products
            (id, name, category, category_label, price, old_price, installment, badge, badge_text, icon, description)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO UPDATE SET
             name=EXCLUDED.name,
             category=EXCLUDED.category,
             category_label=EXCLUDED.category_label,
             price=EXCLUDED.price,
             old_price=EXCLUDED.old_price,
             installment=EXCLUDED.installment,
             badge=EXCLUDED.badge,
             badge_text=EXCLUDED.badge_text,
             icon=EXCLUDED.icon,
             description=EXCLUDED.description`,
          [
            id,
            String(p.name || ''),
            String(p.category || 'todos'),
            String(p.categoryLabel || ''),
            Number(p.price ?? 0),
            p.oldPrice === null || p.oldPrice === undefined || p.oldPrice === '' ? null : Number(p.oldPrice),
            String(p.installment || ''),
            p.badge === null || p.badge === undefined || p.badge === '' ? null : String(p.badge),
            p.badgeText === null || p.badgeText === undefined || p.badgeText === '' ? null : String(p.badgeText),
            String(p.icon || ''),
            String(p.description || ''),
          ]
        );

        await pool.query('DELETE FROM laet_product_images WHERE product_id=$1', [id]);

        const imageUrls = Array.isArray(p.imageUrls) ? p.imageUrls : [];
        for (let i = 0; i < imageUrls.length; i++) {
          const url = String(imageUrls[i] || '');
          if (!url) continue;
          await pool.query(
            `INSERT INTO laet_product_images (product_id, image_path, image_order)
             VALUES ($1,$2,$3)`,
            [id, url, i]
          );
        }
      }

      // site content
      await pool.query(
        `UPDATE laet_site_content SET
          hero_badge=$1, hero_title=$2, hero_description=$3, hero_btn_1=$4, hero_btn_2=$5,
          feature_1_title=$6, feature_1_desc=$7,
          feature_2_title=$8, feature_2_desc=$9,
          feature_3_title=$10, feature_3_desc=$11,
          feature_4_title=$12, feature_4_desc=$13,
          products_section_title=$14, products_section_desc=$15,
          offer_badge=$16, offer_title=$17, offer_description=$18, offer_btn=$19,
          newsletter_title=$20, newsletter_desc=$21,
          footer_description=$22, footer_copyright=$23
         WHERE id=1`,
        [
          String(siteContent.heroBadge || ''),
          String(siteContent.heroTitle || ''),
          String(siteContent.heroDescription || ''),
          String(siteContent.heroBtn1 || ''),
          String(siteContent.heroBtn2 || ''),
          String(siteContent.feature1Title || ''),
          String(siteContent.feature1Desc || ''),
          String(siteContent.feature2Title || ''),
          String(siteContent.feature2Desc || ''),
          String(siteContent.feature3Title || ''),
          String(siteContent.feature3Desc || ''),
          String(siteContent.feature4Title || ''),
          String(siteContent.feature4Desc || ''),
          String(siteContent.productsSectionTitle || ''),
          String(siteContent.productsSectionDesc || ''),
          String(siteContent.offerBadge || ''),
          String(siteContent.offerTitle || ''),
          String(siteContent.offerDescription || ''),
          String(siteContent.offerBtn || ''),
          String(siteContent.newsletterTitle || ''),
          String(siteContent.newsletterDesc || ''),
          String(siteContent.footerDescription || ''),
          String(siteContent.footerCopyright || ''),
        ]
      );

      // contact
      await pool.query(
        'UPDATE laet_contact SET whatsapp=$1, instagram=$2 WHERE id=1',
        [String(contact.whatsapp || ''), String(contact.instagram || '')]
      );

      // users
      for (const u of users) {
        const id = Number(u.id);
        const username = String(u.username || '');
        if (!username) continue;
        const password = String(u.password || '');
        const role = String(u.role || 'editor');
        const name = String(u.name || '');

        if (id) {
          await pool.query(
            `INSERT INTO laet_users (id, username, password, role, name)
             VALUES ($1,$2,$3,$4,$5)
             ON CONFLICT (id) DO UPDATE SET
               username=EXCLUDED.username,
               password=EXCLUDED.password,
               role=EXCLUDED.role,
               name=EXCLUDED.name`,
            [id, username, password, role, name]
          );
        } else {
          // if no id present, rely on DB PK by providing generated id
          // (legacy json probably always has id)
          await pool.query(
            `INSERT INTO laet_users (username, password, role, name)
             VALUES ($1,$2,$3,$4)`,
            [username, password, role, name]
          );
        }
      }

      await pool.query('COMMIT');
      console.log('JSON migration concluída.');
    })
    .catch(async (e) => {
      try {
        await pool.query('ROLLBACK');
      } catch {}
      console.error('Erro na migração:', e);
      process.exit(1);
    })
    .finally(() => pool.end());
}

main();

