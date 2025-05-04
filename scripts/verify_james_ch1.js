const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL
});

async function verifyData() {
    try {
        // Get the book ID for James
        const bookResult = await pool.query(
            'SELECT id, name FROM bible.books WHERE short = $1',
            ['Jas']
        );
        const book = bookResult.rows[0];
        console.log(`Book: ${book.name} (ID: ${book.id})`);

        // Get the chapter ID for James 1
        const chapterResult = await pool.query(
            'SELECT id, number FROM bible.chapters WHERE book_id = $1 AND number = $2',
            [book.id, 1]
        );
        const chapter = chapterResult.rows[0];
        console.log(`Chapter: ${chapter.number} (ID: ${chapter.id})`);

        // Get the first 5 verses with their translations
        const versesResult = await pool.query(
            `SELECT v.number as verse_number, vt.text as verse_text
             FROM bible.verses v
             JOIN bible.verse_translations vt ON v.id = vt.verse_id
             WHERE v.chapter_id = $1
             ORDER BY v.number
             LIMIT 5`,
            [chapter.id]
        );

        console.log('\nFirst 5 verses:');
        versesResult.rows.forEach(verse => {
            console.log(`Verse ${verse.verse_number}: ${verse.verse_text}`);
        });

        // Get the total number of verses
        const totalVersesResult = await pool.query(
            'SELECT COUNT(*) as total FROM bible.verses WHERE chapter_id = $1',
            [chapter.id]
        );
        console.log(`\nTotal verses in James Chapter 1: ${totalVersesResult.rows[0].total}`);

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        await pool.end();
    }
}

verifyData();
