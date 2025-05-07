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
 * Improved to handle more formats and edge cases:
 * - Supports both hyphen and en-dash for verse ranges
 * - Allows for more flexible whitespace
 * - Supports book names with numbers (e.g. 1 John, 2 Tim)
 * - Handles apostrophes in book names (e.g. Paul's)
 * @type {RegExp}
 */
const VERSE_TAG_REGEX = /@((?:\d\s*)?[\w\s']+)\s*(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?/g;

/**
 * Test if a string is a valid verse tag format
 * @param {string} text - Text to test
 * @returns {boolean} True if valid verse tag format
 */
function isValidVerseTag(text) {
  // Reset regex state
  VERSE_TAG_REGEX.lastIndex = 0;
  const match = VERSE_TAG_REGEX.exec(text);
  return match !== null && match[0] === text;
}

/**
 * Extract verse tags from content
 * @param {string} content - Content to extract verse tags from
 * @returns {Array<Object>} Array of verse tag objects with position and reference data
 */
function extractVerseTags(content) {
  // Reset regex state
  VERSE_TAG_REGEX.lastIndex = 0;
  const tags = [];
  let match;
  
  while ((match = VERSE_TAG_REGEX.exec(content)) !== null) {
    const [fullMatch, book, chapter, startVerse, endVerse] = match;
    
    tags.push({
      book: book.trim(),
      chapter: parseInt(chapter, 10),
      verse: parseInt(startVerse, 10),
      endVerse: endVerse ? parseInt(endVerse, 10) : null,
      matchText: fullMatch,
      startOffset: match.index,
      endOffset: match.index + fullMatch.length
    });
  }
  
  return tags;
}

module.exports = {
  normalizeBookName,
  VERSE_TAG_REGEX,
  isValidVerseTag,
  extractVerseTags
};
