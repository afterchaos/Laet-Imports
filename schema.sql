-- LAET IMPORTS - PostgreSQL schema
-- Executar como role que possui permissão de CREATE/ALTER.
--
-- Tabelas:
--   laet_users
--   laet_categories
--   laet_products
--   laet_product_images
--   laet_site_content
--   laet_contact

CREATE TABLE IF NOT EXISTS laet_users (
  id          INTEGER PRIMARY KEY,
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'editor',
  name        TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS laet_categories (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL DEFAULT '',
  protected   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS laet_products (
  id                 BIGINT PRIMARY KEY,
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
  product_id  BIGINT NOT NULL,
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

-- Garante linha única do conteúdo.
INSERT INTO laet_site_content (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS laet_contact (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  whatsapp    TEXT NOT NULL DEFAULT '',
  instagram   TEXT NOT NULL DEFAULT ''
);

INSERT INTO laet_contact (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

