const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.SUPABASE_URL });

async function import3John() {
    try {
        const bookResult = await pool.query('SELECT id FROM bible.books WHERE short = $1', ['3John']);
        if (bookResult.rows.length === 0) throw new Error('Book not found');
        const bookId = bookResult.rows[0].id;
        const translationResult = await pool.query('SELECT id FROM bible.translations WHERE code = $1', ['WEB']);
        if (translationResult.rows.length === 0) throw new Error('Translation not found');
        const translationId = translationResult.rows[0].id;
        for (let chapterNum = 1; chapterNum <= 1; chapterNum++) {
            // Fetch all verses at once for single-chapter book
            const apiUrl = `https://bible-api.com/3+john+1-14`;
            const response = await axios.get(apiUrl);
            const verses = response.data.verses;
            const chapterResult = await pool.query('SELECT id FROM bible.chapters WHERE book_id = $1 AND number = $2', [bookId, chapterNum]);
            if (chapterResult.rows.length === 0) throw new Error(`Chapter ${chapterNum} not found`);
            const chapterId = chapterResult.rows[0].id;
            for (const verse of verses) {
                const verseNumber = verse.verse; // Correct: API gives actual verse number (1-14)
                await pool.query('INSERT INTO bible.verses (chapter_id, number) VALUES ($1, $2) ON CONFLICT DO NOTHING', [chapterId, verseNumber]);
                const verseResult = await pool.query('SELECT id FROM bible.verses WHERE chapter_id = $1 AND number = $2', [chapterId, verseNumber]);
                if (verseResult.rows.length === 0) throw new Error(`Verse ${verseNumber} not found in 3John chapter ${chapterNum}`);
                const verseId = verseResult.rows[0].id;
                await pool.query('INSERT INTO bible.verse_translations (verse_id, translation_id, text) VALUES ($1, $2, $3) ON CONFLICT (verse_id, translation_id) DO UPDATE SET text = EXCLUDED.text', [verseId, translationId, verse.text]);
            }
            console.log(`Imported 3John chapter ${chapterNum}`);
        }
        console.log('Import of 3John complete!');
    } catch (err) {
        console.error('Error importing 3John:', err);
    } finally {
        await pool.end();
    }
}

import3John();
