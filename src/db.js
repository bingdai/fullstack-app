console.log('DB.JS DATABASE_URL:', process.env.DATABASE_URL);
require('dotenv').config();

// src/db.js
const { Pool } = require('pg');
// Create a connection pool 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper for running queries with connection management
async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Book name aliases for flexibility in verse tagging
const BOOK_ALIASES = {
  // Old Testament
  'gen': 'Genesis', 'genesis': 'Genesis',
  'exo': 'Exodus', 'exodus': 'Exodus',
  'lev': 'Leviticus', 'leviticus': 'Leviticus',
  'num': 'Numbers', 'numbers': 'Numbers',
  'deut': 'Deuteronomy', 'deuteronomy': 'Deuteronomy',
  'josh': 'Joshua', 'joshua': 'Joshua',
  'judg': 'Judges', 'judges': 'Judges',
  'ruth': 'Ruth',
  '1 sam': '1 Samuel', '1 samuel': '1 Samuel', '1sam': '1 Samuel', '1samuel': '1 Samuel',
  '2 sam': '2 Samuel', '2 samuel': '2 Samuel', '2sam': '2 Samuel', '2samuel': '2 Samuel',
  '1 kings': '1 Kings', '1kings': '1 Kings',
  '2 kings': '2 Kings', '2kings': '2 Kings',
  '1 chr': '1 Chronicles', '1 chron': '1 Chronicles', '1 chronicles': '1 Chronicles',
  '2 chr': '2 Chronicles', '2 chron': '2 Chronicles', '2 chronicles': '2 Chronicles',
  'ezra': 'Ezra',
  'neh': 'Nehemiah', 'nehemiah': 'Nehemiah',
  'est': 'Esther', 'esther': 'Esther',
  'job': 'Job',
  'ps': 'Psalms', 'psalm': 'Psalms', 'psalms': 'Psalms',
  'prov': 'Proverbs', 'proverbs': 'Proverbs',
  'eccl': 'Ecclesiastes', 'ecclesiastes': 'Ecclesiastes',
  'song': 'Song of Solomon', 'song of solomon': 'Song of Solomon', 'song of songs': 'Song of Solomon',
  'isa': 'Isaiah', 'isaiah': 'Isaiah',
  'jer': 'Jeremiah', 'jeremiah': 'Jeremiah',
  'lam': 'Lamentations', 'lamentations': 'Lamentations',
  'ezek': 'Ezekiel', 'ezekiel': 'Ezekiel',
  'dan': 'Daniel', 'daniel': 'Daniel',
  'hos': 'Hosea', 'hosea': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'obad': 'Obadiah', 'obadiah': 'Obadiah',
  'jonah': 'Jonah',
  'mic': 'Micah', 'micah': 'Micah',
  'nah': 'Nahum', 'nahum': 'Nahum',
  'hab': 'Habakkuk', 'habakkuk': 'Habakkuk',
  'zeph': 'Zephaniah', 'zephaniah': 'Zephaniah',
  'hag': 'Haggai', 'haggai': 'Haggai',
  'zech': 'Zechariah', 'zechariah': 'Zechariah',
  'mal': 'Malachi', 'malachi': 'Malachi',
  // New Testament
  'matt': 'Matthew', 'matthew': 'Matthew', 'mt': 'Matthew',
  'mark': 'Mark', 'mk': 'Mark',
  'luke': 'Luke', 'lk': 'Luke',
  'john': 'John', 'jn': 'John',
  'acts': 'Acts',
  'rom': 'Romans', 'romans': 'Romans',
  '1 cor': '1 Corinthians', '1 corinthians': '1 Corinthians', '1cor': '1 Corinthians',
  '2 cor': '2 Corinthians', '2 corinthians': '2 Corinthians', '2cor': '2 Corinthians',
  'gal': 'Galatians', 'galatians': 'Galatians',
  'eph': 'Ephesians', 'ephesians': 'Ephesians',
  'phil': 'Philippians', 'philippians': 'Philippians',
  'col': 'Colossians', 'colossians': 'Colossians',
  '1 thess': '1 Thessalonians', '1 thessalonians': '1 Thessalonians', '1thess': '1 Thessalonians',
  '2 thess': '2 Thessalonians', '2 thessalonians': '2 Thessalonians', '2thess': '2 Thessalonians',
  '1 tim': '1 Timothy', '1 timothy': '1 Timothy', '1tim': '1 Timothy',
  '2 tim': '2 Timothy', '2 timothy': '2 Timothy', '2tim': '2 Timothy',
  'titus': 'Titus',
  'phlm': 'Philemon', 'philemon': 'Philemon',
  'heb': 'Hebrews', 'hebrews': 'Hebrews',
  'james': 'James', 'jas': 'James',
  '1 pet': '1 Peter', '1 peter': '1 Peter', '1pet': '1 Peter',
  '2 pet': '2 Peter', '2 peter': '2 Peter', '2pet': '2 Peter',
  '1 john': '1 John', '1john': '1 John',
  '2 john': '2 John', '2john': '2 John',
  '3 john': '3 John', '3john': '3 John',
  'jude': 'Jude',
  'rev': 'Revelation', 'revelation': 'Revelation'
};

module.exports = {
  query,
  BOOK_ALIASES
};
