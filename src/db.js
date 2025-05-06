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

// Journal database operations
const journalDb = {
  // Create a new journal entry
  createEntry: async (title, content) => {
    const result = await query(
      'INSERT INTO journal.entries (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    return result.rows[0];
  },

  // Get a journal entry by ID
  getEntry: async (id) => {
    const result = await query('SELECT * FROM journal.entries WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Get all journal entries
  getAllEntries: async () => {
    const result = await query('SELECT * FROM journal.entries ORDER BY created_at DESC');
    return result.rows;
  },

  // Update a journal entry
  updateEntry: async (id, title, content) => {
    const result = await query(
      'UPDATE journal.entries SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    return result.rows[0];
  },

  // Delete a journal entry
  deleteEntry: async (id) => {
    await query('DELETE FROM journal.entries WHERE id = $1', [id]);
    return { success: true };
  },

  // Create a verse tag for a journal entry
  createVerseTag: async (entryId, verseId, startOffset, endOffset) => {
    const result = await query(
      'INSERT INTO journal.verse_tags (entry_id, verse_id, start_offset, end_offset) VALUES ($1, $2, $3, $4) RETURNING *',
      [entryId, verseId, startOffset, endOffset]
    );
    return result.rows[0];
  },

  // Get verse tags for a journal entry
  getEntryVerseTags: async (entryId) => {
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
        WHERE translation_id = (SELECT id FROM bible.translations WHERE code = 'ESV' LIMIT 1)
      ) vt2 ON v.id = vt2.verse_id
      WHERE vt.entry_id = $1
      ORDER BY vt.start_offset
    `, [entryId]);
    return result.rows;
  },

  // Process verse tags from content using @Book Chapter:Verse syntax
  processVerseTags: async (entryId, content, verseTags) => {
    // If verseTags are provided directly, use them
    if (Array.isArray(verseTags) && verseTags.length > 0) {
      for (const tag of verseTags) {
        try {
          // Find the verse ID
          const verseData = await journalDb.findVerseByReference(
            tag.book,
            tag.chapter,
            tag.verse
          );
          
          if (verseData && verseData.id) {
            // Create tag in database
            await journalDb.createVerseTag(
              entryId,
              verseData.id,
              tag.startOffset,
              tag.endOffset
            );
            
            // If it's a verse range, add the other verses too
            if (tag.endVerse && tag.endVerse > tag.verse) {
              for (let v = tag.verse + 1; v <= tag.endVerse; v++) {
                const rangeVerseData = await journalDb.findVerseByReference(
                  tag.book,
                  tag.chapter,
                  v
                );
                
                if (rangeVerseData && rangeVerseData.id) {
                  await journalDb.createVerseTag(
                    entryId,
                    rangeVerseData.id,
                    tag.startOffset,
                    tag.endOffset
                  );
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error processing verse tag ${tag.book} ${tag.chapter}:${tag.verse}:`, error);
        }
      }
      return;
    }
    
    // Otherwise, extract tags from content
    const regex = /@([\w\s]+)\s+(\d+):(\d+)(?:[-–](\d+))?/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      try {
        const [fullMatch, bookRaw, chapterStr, startVerseStr, endVerseStr] = match;
        
        // Normalize book name
        const bookLower = bookRaw.trim().toLowerCase();
        const normalizedBook = BOOK_ALIASES[bookLower] || bookRaw.trim();
        
        const chapter = parseInt(chapterStr);
        const startVerse = parseInt(startVerseStr);
        const endVerse = endVerseStr ? parseInt(endVerseStr) : null;
        
        // Find the verse ID
        const verseData = await journalDb.findVerseByReference(
          normalizedBook,
          chapter,
          startVerse
        );
        
        if (verseData && verseData.id) {
          // Create tag in database
          await journalDb.createVerseTag(
            entryId,
            verseData.id,
            match.index,
            match.index + fullMatch.length
          );
          
          // If it's a verse range, add the other verses too
          if (endVerse && endVerse > startVerse) {
            for (let v = startVerse + 1; v <= endVerse; v++) {
              const rangeVerseData = await journalDb.findVerseByReference(
                normalizedBook,
                chapter,
                v
              );
              
              if (rangeVerseData && rangeVerseData.id) {
                await journalDb.createVerseTag(
                  entryId,
                  rangeVerseData.id,
                  match.index,
                  match.index + fullMatch.length
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing verse tag:', error);
      }
    }
  },

  // Find Bible verse by reference (book, chapter, verse)
  findVerseByReference: async (bookName, chapterNumber, verseNumber) => {
    // Normalize book name
    const bookLower = bookName.toLowerCase();
    const normalizedBook = BOOK_ALIASES[bookLower] || bookName;
    
    const result = await query(`
      SELECT v.id
      FROM bible.verses v
      JOIN bible.chapters c ON v.chapter_id = c.id
      JOIN bible.books b ON c.book_id = b.id
      WHERE (LOWER(b.name) = LOWER($1) OR LOWER(b.short) = LOWER($1))
        AND c.number = $2 AND v.number = $3
    `, [normalizedBook, chapterNumber, verseNumber]);
    
    return result.rows[0];
  },

  // Delete a verse tag
  deleteVerseTag: async (id) => {
    await query('DELETE FROM journal.verse_tags WHERE id = $1', [id]);
    return { success: true };
  }
};

module.exports = {
  query,
  journalDb
};
