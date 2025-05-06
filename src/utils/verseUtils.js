// src/utils/verseUtils.js
/**
 * Normalize a raw book name (from user input or tag) to the canonical name using BOOK_ALIASES.
 * @param {string} bookRaw - Raw book name (e.g. 'ps', 'Psalms', 'psalm')
 * @param {Object} BOOK_ALIASES - Alias map from db.js
 * @returns {string} Normalized book name (e.g. 'Psalms')
 */
function normalizeBookName(bookRaw, BOOK_ALIASES) {
  const bookLower = bookRaw.trim().toLowerCase();
  return BOOK_ALIASES[bookLower] || bookRaw.trim();
}

/**
 * Regex for matching verse tags in content (e.g. @John 3:16 or @Ps 23:1-6)
 * @type {RegExp}
 */
const VERSE_TAG_REGEX = /@([\w\s]+)\s+(\d+):(\d+)(?:[-–](\d+))?/g;

module.exports = {
  normalizeBookName,
  VERSE_TAG_REGEX
};
