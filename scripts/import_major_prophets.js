const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL client
const pool = new Pool({
    connectionString: process.env.SUPABASE_URL
});

const books = [
    { name: 'Isaiah', short: 'Isa', chapters: 66 },
    { name: 'Jeremiah', short: 'Jer', chapters: 52 },
    { name: 'Lamentations', short: 'Lam', chapters: 5 },
    { name: 'Ezekiel', short: 'Ezek', chapters: 48 },
    { name: 'Daniel', short: 'Dan', chapters: 12 }
];

async function importBook(book) {
    // Get the book ID
    const bookResult = await pool.query(
        'SELECT id FROM bible.books WHERE short = $1',
        [book.short]
    );
    if (bookResult.rows.length === 0) {
        throw new Error(`Book not found: ${book.short}`);
    }
    const bookId = bookResult.rows[0].id;

    // Get the translation ID for WEB
    const translationResult = await pool.query(
        'SELECT id FROM bible.translations WHERE code = $1',
        ['WEB']
    );
    if (translationResult.rows.length === 0) {
        throw new Error('Translation not found');
    }
    const translationId = translationResult.rows[0].id;

    for (let chapterNum = 1; chapterNum <= book.chapters; chapterNum++) {
        console.log(`Importing ${book.name} chapter ${chapterNum}...`);
        // Bible API expects e.g. "isaiah+1"
        const apiBook = book.name.toLowerCase().replace(/ /g, '+');
        const response = await axios.get(`https://bible-api.com/${apiBook}+${chapterNum}`);
        const verses = response.data.verses;

        // Get the chapter ID
        const chapterResult = await pool.query(
            'SELECT id FROM bible.chapters WHERE book_id = $1 AND number = $2',
            [bookId, chapterNum]
        );
        if (chapterResult.rows.length === 0) {
            throw new Error(`Chapter ${chapterNum} not found in ${book.name}`);
        }
        const chapterId = chapterResult.rows[0].id;

        // Insert each verse and its translation
        for (const verse of verses) {
            const verseNumber = verse.verse;
            // Insert the verse if it doesn't exist
            await pool.query(
                `INSERT INTO bible.verses (chapter_id, number)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [chapterId, verseNumber]
            );
            // Get the verse ID
            const verseResult = await pool.query(
                'SELECT id FROM bible.verses WHERE chapter_id = $1 AND number = $2',
                [chapterId, verseNumber]
            );
            if (verseResult.rows.length === 0) {
                throw new Error(`Verse ${verseNumber} not found in ${book.name} chapter ${chapterNum}`);
            }
            const verseId = verseResult.rows[0].id;
            // Insert the translation text
            await pool.query(
                `INSERT INTO bible.verse_translations (verse_id, translation_id, text)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (verse_id, translation_id) DO UPDATE SET text = EXCLUDED.text`,
                [verseId, translationId, verse.text]
            );
        }
    }
}

(async () => {
    try {
        for (const book of books) {
            await importBook(book);
        }
        console.log('Import complete!');
    } catch (err) {
        console.error('Error importing books:', err);
    } finally {
        await pool.end();
    }
})();
