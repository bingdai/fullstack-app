-- Migration 003: Add chapter_count column to bible.books and populate it

-- 1. Add the column if it doesn't exist
ALTER TABLE bible.books ADD COLUMN IF NOT EXISTS chapter_count INTEGER;

-- 2. Calculate and update chapter_count for each book
UPDATE bible.books
SET chapter_count = sub.chapter_total
FROM (
    SELECT book_id, COUNT(*) AS chapter_total
    FROM bible.chapters
    GROUP BY book_id
) AS sub
WHERE bible.books.id = sub.book_id;
