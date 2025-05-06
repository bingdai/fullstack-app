const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL client
const pool = new Pool({
    connectionString: process.env.SUPABASE_URL
});

async function importRomans() {
    try {
        // Get the book ID for Romans
        const bookResult = await pool.query(
            'SELECT id FROM bible.books WHERE short = $1',
            ['Rom']
        );
        if (bookResult.rows.length === 0) {
            throw new Error('Book not found');
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

        // Romans has 16 chapters
        for (let chapterNum = 1; chapterNum <= 16; chapterNum++) {
            // Fetch verses from Bible API
            const apiUrl = `https://bible-api.com/romans+${chapterNum}`;
            const response = await axios.get(apiUrl);
            const verses = response.data.verses;

            // Get the chapter ID for Romans chapterNum
            const chapterResult = await pool.query(
                'SELECT id FROM bible.chapters WHERE book_id = $1 AND number = $2',
                [bookId, chapterNum]
            );
            if (chapterResult.rows.length === 0) {
                throw new Error(`Chapter ${chapterNum} not found`);
            }
            const chapterId = chapterResult.rows[0].id;

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
                    throw new Error(`Verse ${verseNumber} not found in Romans chapter ${chapterNum}`);
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
            console.log(`Imported Romans chapter ${chapterNum}`);
        }
        console.log('Import of Romans complete!');
    } catch (err) {
        console.error('Error importing Romans:', err);
    } finally {
        await pool.end();
    }
}

importRomans();
