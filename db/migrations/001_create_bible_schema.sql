-- Migration 001: Create Bible schema

-- Create schema
CREATE SCHEMA IF NOT EXISTS bible;

-- 1. books
CREATE TABLE IF NOT EXISTS bible.books (
  id           SERIAL PRIMARY KEY,
  testament    VARCHAR(8) NOT NULL,
  name         TEXT NOT NULL,
  short        TEXT NOT NULL,
  sort_order   SMALLINT NOT NULL,
  UNIQUE(testament, sort_order)
);

-- 2. chapters
CREATE TABLE IF NOT EXISTS bible.chapters (
  id           SERIAL PRIMARY KEY,
  book_id      INTEGER NOT NULL REFERENCES bible.books(id) ON DELETE CASCADE,
  number       SMALLINT NOT NULL,
  verse_count  SMALLINT,
  UNIQUE(book_id, number)
);

-- 3. verses
CREATE TABLE IF NOT EXISTS bible.verses (
  id           SERIAL PRIMARY KEY,
  chapter_id   INTEGER NOT NULL REFERENCES bible.chapters(id) ON DELETE CASCADE,
  number       SMALLINT NOT NULL,
  UNIQUE(chapter_id, number)
);

-- 4. translations
CREATE TABLE IF NOT EXISTS bible.translations (
  id            SERIAL PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  language      TEXT NOT NULL,
  license       TEXT,
  source_url    TEXT
);

-- 5. verse_translations
CREATE TABLE IF NOT EXISTS bible.verse_translations (
  verse_id        INTEGER NOT NULL REFERENCES bible.verses(id) ON DELETE CASCADE,
  translation_id  INTEGER NOT NULL REFERENCES bible.translations(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  PRIMARY KEY(verse_id, translation_id)
);

-- Index for fast queries by translation
CREATE INDEX IF NOT EXISTS idx_verse_translations_translation ON bible.verse_translations(translation_id);
