-- Migration 004: Create Journal schema

-- Create journal schema
CREATE SCHEMA IF NOT EXISTS journal;

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal.entries (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bible verse tags table (links journal entries to Bible verses)
CREATE TABLE IF NOT EXISTS journal.verse_tags (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES journal.entries(id) ON DELETE CASCADE,
  verse_id INTEGER NOT NULL REFERENCES bible.verses(id) ON DELETE CASCADE,
  start_offset INTEGER,  -- Position in text where tag starts
  end_offset INTEGER,    -- Position in text where tag ends
  UNIQUE(entry_id, verse_id, start_offset, end_offset)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_verse_tags_entry ON journal.verse_tags(entry_id);
CREATE INDEX IF NOT EXISTS idx_verse_tags_verse ON journal.verse_tags(verse_id);
