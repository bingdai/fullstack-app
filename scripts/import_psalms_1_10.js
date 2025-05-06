const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL client
const pool = new Pool({
    connectionString: process.env.SUPABASE_URL
});

async function importPsalms1to10() {
    try {
        // Get the book ID for Psalms
        const bookResult = await pool.query(
            'SELECT id FROM bible.books WHERE short = $1',
            ['Ps']
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

        for (let chapterNum = 1; chapterNum <= 10; chapterNum++) {
            // Fetch Psalms chapter from Bible API
            const response = await axios.get(`https://bible-api.com/psalms+${chapterNum}?translation=web`);
            const verses = response.data.verses;

            // Get the chapter ID for Psalms chapterNum
            const chapterResult = await pool.query(
                'SELECT id FROM bible.chapters WHERE book_id = $1 AND number = $2',
                [bookId, chapterNum]
            );
            if (chapterResult.rows.length === 0) {
                throw new Error(`Chapter ${chapterNum} not found`);
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
                const verseId = verseResult.rows[0].id;
                // Insert the verse translation
                await pool.query(
                    `INSERT INTO bible.verse_translations (verse_id, translation_id, text)
                     VALUES ($1, $2, $3)
                     ON CONFLICT DO NOTHING`,
                    [verseId, translationId, verse.text]
                );
            }
            console.log(`Successfully imported Psalms Chapter ${chapterNum}`);
        }
    } catch (error) {
        console.error('Error importing Psalms 1-10:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

importPsalms1to10();
