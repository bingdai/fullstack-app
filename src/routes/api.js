// src/routes/api.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET book data
router.get('/books/:book', async (req, res) => {
    const { book } = req.params;
    try {
        const bookResult = await query('SELECT * FROM bible.books WHERE short = $1', [book]);
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

module.exports = router;
