// src/models/journal.js
// All DB operations for journal entries and verse tags

const { query } = require('../db');

/**
 * Create a new journal entry
 * @param {string} title
 * @param {string} content
 * @returns {Promise<Object>} The created entry
 */
async function createEntry(title, content) {
  const result = await query(
    'INSERT INTO journal.entries (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  );
  return result.rows[0];
}

/**
 * Get a journal entry by ID
 * @param {number} id
 * @returns {Promise<Object|null>} The entry or null
 */
async function getEntry(id) {
  const result = await query('SELECT * FROM journal.entries WHERE id = $1', [id]);
  return result.rows[0];
}

/**
 * Get all journal entries
 * @returns {Promise<Array>} Array of entries
 */
async function getAllEntries() {
  const result = await query('SELECT * FROM journal.entries ORDER BY created_at DESC');
  return result.rows;
}

/**
 * Update a journal entry
 * @param {number} id
 * @param {string} title
 * @param {string} content
 * @returns {Promise<Object|null>} The updated entry or null
 */
async function updateEntry(id, title, content) {
  const result = await query(
    'UPDATE journal.entries SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [title, content, id]
  );
  return result.rows[0];
}

/**
 * Delete a journal entry
 * @param {number} id
 * @returns {Promise<{success: boolean}>}
 */
async function deleteEntry(id) {
  await query('DELETE FROM journal.entries WHERE id = $1', [id]);
  return { success: true };
}

/**
 * Create a verse tag for a journal entry
 * @param {number} entryId
 * @param {number} verseId
 * @param {number} startOffset
 * @param {number} endOffset
 * @returns {Promise<Object>} The created verse tag
 */
async function createVerseTag(entryId, verseId, startOffset, endOffset) {
  const result = await query(
    'INSERT INTO journal.verse_tags (entry_id, verse_id, start_offset, end_offset) VALUES ($1, $2, $3, $4) RETURNING *',
    [entryId, verseId, startOffset, endOffset]
  );
  return result.rows[0];
}

/**
 * Get verse tags for a journal entry (fetches verse text from WEB translation)
 * @param {number} entryId
 * @returns {Promise<Array>} Array of verse tags
 */
async function getEntryVerseTags(entryId) {
  const result = await query(`
    SELECT vt.*, v.number as verse_number, c.number as chapter_number, 
           b.name as book_name, b.short as book_short,
           vt2.text as text
    FROM journal.verse_tags vt
    JOIN bible.verses v ON vt.verse_id = v.id
    JOIN bible.chapters c ON v.chapter_id = c.id
    JOIN bible.books b ON c.book_id = b.id
    LEFT JOIN (
      SELECT verse_id, text
      FROM bible.verse_translations
      WHERE translation_id = (SELECT id FROM bible.translations WHERE code = 'WEB' LIMIT 1)
    ) vt2 ON v.id = vt2.verse_id
    WHERE vt.entry_id = $1
    ORDER BY vt.start_offset
  `, [entryId]);
  return result.rows;
}

/**
 * Find Bible verse by reference (book, chapter, verse)
 * @param {string} bookName
 * @param {number} chapterNumber
 * @param {number} verseNumber
 * @returns {Promise<Object|null>} The verse row or null
 */
async function findVerseByReference(bookName, chapterNumber, verseNumber) {
  // Book name normalization is handled in controller
  const result = await query(`
    SELECT v.id
    FROM bible.verses v
    JOIN bible.chapters c ON v.chapter_id = c.id
    JOIN bible.books b ON c.book_id = b.id
    WHERE (LOWER(b.name) = LOWER($1) OR LOWER(b.short) = LOWER($1))
      AND c.number = $2 AND v.number = $3
  `, [bookName, chapterNumber, verseNumber]);
  return result.rows[0];
}

/**
 * Delete a verse tag
 * @param {number} id
 * @returns {Promise<{success: boolean}>}
 */
async function deleteVerseTag(id) {
  await query('DELETE FROM journal.verse_tags WHERE id = $1', [id]);
  return { success: true };
}

module.exports = {
  createEntry,
  getEntry,
  getAllEntries,
  updateEntry,
  deleteEntry,
  createVerseTag,
  getEntryVerseTags,
  findVerseByReference,
  deleteVerseTag
};
