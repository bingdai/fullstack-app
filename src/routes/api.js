// src/routes/api.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET book data
// Book code aliases for flexibility
const BOOK_ALIASES = {
    mic: 'Micah',
    micah: 'Micah',
    nah: 'Nah',
    nahum: 'Nah',
    hab: 'Hab',
    habakkuk: 'Hab',
    zeph: 'Zeph',
    zephaniah: 'Zeph',
    hag: 'Hag',
    haggai: 'Hag',
    zech: 'Zech',
    zechariah: 'Zech',
    mal: 'Mal',
    malachi: 'Mal',
    // add more aliases as needed
};

router.get('/books/:book', async (req, res) => {
    let { book } = req.params;
    book = (book || '').toLowerCase();
    const normalizedBook = BOOK_ALIASES[book] || book.charAt(0).toUpperCase() + book.slice(1);
    try {
        const bookResult = await query('SELECT * FROM bible.books WHERE LOWER(short) = LOWER($1)', [normalizedBook]);
        if (bookResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const chaptersResult = await query(
            'SELECT * FROM bible.chapters WHERE book_id = $1 ORDER BY number',
            [bookResult.rows[0].id]
        );
        res.json({ book: bookResult.rows[0], chapters: chaptersResult.rows });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET chapter content
router.get('/books/:book/:chapter', async (req, res) => {
    let { book, chapter } = req.params;
    book = (book || '').toLowerCase();
    const normalizedBook = BOOK_ALIASES[book] || book.charAt(0).toUpperCase() + book.slice(1);
    try {
        // Get book data
        const bookResult = await query('SELECT * FROM bible.books WHERE LOWER(short) = LOWER($1)', [normalizedBook]);
        if (bookResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const bookData = bookResult.rows[0];

        // Get chapter
        const chapterResult = await query(
            'SELECT * FROM bible.chapters WHERE book_id = $1 AND number = $2',
            [bookData.id, chapter]
        );
        if (chapterResult.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        const chapterData = chapterResult.rows[0];

        // Get verses with translations
        const versesResult = await query(
            `SELECT v.id, v.number, vt.text, t.code as translation_code, t.name as translation_name
             FROM bible.verses v
             JOIN bible.verse_translations vt ON v.id = vt.verse_id
             JOIN bible.translations t ON vt.translation_id = t.id
             JOIN bible.chapters c ON v.chapter_id = c.id
             WHERE c.book_id = $1 AND c.number = $2
             ORDER BY v.number, t.code`,
            [bookData.id, chapter]
        );

        // Get all verses for this chapter (regardless of translation)
        const uniqueVersesResult = await query(
            `SELECT id, number FROM bible.verses 
             WHERE chapter_id = $1 
             ORDER BY number`,
            [chapterData.id]
        );

        // Structure the response data
        const translations = {};
        const verses = uniqueVersesResult.rows.map(v => ({
            id: v.id,
            number: v.number
        }));

        // Group verses by translation
        versesResult.rows.forEach(row => {
            if (!translations[row.translation_code]) {
                translations[row.translation_code] = {
                    name: row.translation_name,
                    verses: []
                };
            }
            
            translations[row.translation_code].verses.push({
                verse_number: row.number,
                text: row.text
            });
        });

        // Log the response for debugging
        console.log('Sending chapter data with translations:', 
            Object.keys(translations).length, 
            'translations and', 
            verses.length, 
            'verses');

        res.json({
            book: bookData,
            chapter: chapterData,
            verses: verses,
            translations: translations
        });
    } catch (error) {
        console.error('Error fetching chapter:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
