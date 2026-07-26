-- ============================================================================
--  Glossary of Social Work in Tamil  —  PostgreSQL schema
--  சமூகப்பணி கலைச்சொல் அகராதி
--  Content by S. Rengasamy. Data recovered from the original Android app v2.0.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------- categories
DROP TABLE IF EXISTS activity_log      CASCADE;
DROP TABLE IF EXISTS admin_users       CASCADE;
DROP TABLE IF EXISTS images            CASCADE;
DROP TABLE IF EXISTS term_categories   CASCADE;
DROP TABLE IF EXISTS terms             CASCADE;
DROP TABLE IF EXISTS categories        CASCADE;
DROP TABLE IF EXISTS site_settings     CASCADE;

CREATE TABLE categories (
  id          integer PRIMARY KEY,
  slug        text    NOT NULL UNIQUE,
  name        text    NOT NULL,
  name_ta     text,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

-- --------------------------------------------------------------------- terms
CREATE TABLE terms (
  id          integer PRIMARY KEY,
  slug        text    NOT NULL UNIQUE,
  en_word     text    NOT NULL,
  ta_word     text,
  en_exp      text,
  ta_exp      text,
  initial     text    NOT NULL,          -- 'A'..'Z' or '#'
  is_active   boolean NOT NULL DEFAULT true,
  updated_at  timestamptz,
  -- Bilingual full-text vector: English fields use the english stemmer,
  -- Tamil fields use 'simple' (no stemmer) so Tamil tokens stay intact.
  search tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(en_word, '')), 'A')
   || setweight(to_tsvector('simple',  coalesce(ta_word, '')), 'A')
   || setweight(to_tsvector('english', coalesce(en_exp,  '')), 'C')
   || setweight(to_tsvector('simple',  coalesce(ta_exp,  '')), 'C')
  ) STORED
);

CREATE INDEX terms_search_idx      ON terms USING gin (search);
CREATE INDEX terms_en_word_trgm    ON terms USING gin (en_word gin_trgm_ops);
CREATE INDEX terms_ta_word_trgm    ON terms USING gin (ta_word gin_trgm_ops);
CREATE INDEX terms_initial_idx     ON terms (initial, lower(en_word));
CREATE INDEX terms_sort_idx        ON terms (lower(en_word));
CREATE INDEX terms_active_idx      ON terms (is_active);

-- --------------------------------------------------------- term ↔ categories
CREATE TABLE term_categories (
  term_id     integer NOT NULL REFERENCES terms(id)      ON DELETE CASCADE,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (term_id, category_id)
);
CREATE INDEX term_categories_cat_idx ON term_categories (category_id);

-- -------------------------------------------------------------------- images
-- The original image files were served from glossary.org.in/GlossaryImages/
-- and are lost. Metadata is preserved so images can be re-attached later:
-- `file_path` stays NULL until a replacement file is uploaded.
CREATE TABLE images (
  id         integer PRIMARY KEY,
  term_id    integer NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  filename   text,
  file_path  text,
  alt_text   text,
  caption    text,
  position   integer NOT NULL DEFAULT 1,
  size_bytes integer,
  in_gallery boolean NOT NULL DEFAULT false,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz
);
CREATE INDEX images_term_idx ON images (term_id, position);
CREATE INDEX images_present_idx ON images (term_id) WHERE file_path IS NOT NULL;

-- ------------------------------------------------------------- site settings
CREATE TABLE site_settings (
  key   text PRIMARY KEY,
  value text
);

-- ------------------------------------------------------- admin (phase 2 use)
CREATE TABLE admin_users (
  id            serial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  name          text NOT NULL,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'editor',  -- 'editor' | 'admin'
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE activity_log (
  id          bigserial PRIMARY KEY,
  user_id     integer REFERENCES admin_users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity      text,
  entity_id   integer,
  detail      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_log_created_idx ON activity_log (created_at DESC);
