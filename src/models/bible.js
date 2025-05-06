// src/models/bible.js
// All DB operations for Bible books, chapters, and verses
// No unused imports or dead code detected in this model after refactor.

const { query } = require('../db');

/**
 * Get a book by short code or name (also checks full name, not just short)
 */
async function getBookByShortOrName(normalizedBook) {
  // Try short code first
  let bookResult = await query('SELECT * FROM bible.books WHERE LOWER(short) = LOWER($1)', [normalizedBook]);
  if (bookResult.rows.length > 0) return bookResult.rows[0];
  // Try full name
  bookResult = await query('SELECT * FROM bible.books WHERE LOWER(name) = LOWER($1)', [normalizedBook]);
  return bookResult.rows[0] || null;
}

/**
 * Get all chapters for a book
 */
async function getChaptersForBook(bookId) {
  const chaptersResult = await query('SELECT * FROM bible.chapters WHERE book_id = $1 ORDER BY number', [bookId]);
  return chaptersResult.rows;
}

/**
 * Get a chapter by book and chapter number
 */
async function getChapter(bookId, chapter) {
  const chapterResult = await query('SELECT * FROM bible.chapters WHERE book_id = $1 AND number = $2', [bookId, chapter]);
  return chapterResult.rows[0] || null;
}

/**
 * Get verses with translations for a chapter
 */
async function getVersesWithTranslations(bookId, chapter) {
  const versesResult = await query(
    `SELECT v.id, v.number, vt.text, t.code as translation_code, t.name as translation_name
     FROM bible.verses v
     JOIN bible.verse_translations vt ON v.id = vt.verse_id
     JOIN bible.translations t ON vt.translation_id = t.id
     JOIN bible.chapters c ON v.chapter_id = c.id
     WHERE c.book_id = $1 AND c.number = $2
     ORDER BY v.number, t.code`,
    [bookId, chapter]
  );
  return versesResult.rows;
}

/**
 * Get all verses for a chapter (regardless of translation)
 */
async function getUniqueVersesForChapter(chapterId) {
  const uniqueVersesResult = await query(
    `SELECT id, number FROM bible.verses WHERE chapter_id = $1 ORDER BY number`,
    [chapterId]
  );
  return uniqueVersesResult.rows;
}

module.exports = {
  getBookByShortOrName,
  getChaptersForBook,
  getChapter,
  getVersesWithTranslations,
  getUniqueVersesForChapter
};
