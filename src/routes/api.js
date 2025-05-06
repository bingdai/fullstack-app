// src/routes/api.js
const express = require('express');
const router = express.Router();
const bibleModel = require('../models/bible');
const { BOOK_ALIASES } = require('../db');
const journalController = require('../controllers/journalController');

// GET book data
router.get('/books/:book', async (req, res) => {
    let { book } = req.params;
    book = (book || '').toLowerCase();
    const normalizedBook = BOOK_ALIASES[book] || book.charAt(0).toUpperCase() + book.slice(1);
    try {
        const bookData = await bibleModel.getBookByShortOrName(normalizedBook);
        if (!bookData) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const chapters = await bibleModel.getChaptersForBook(bookData.id);
        res.json({ book: bookData, chapters });
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
        const bookData = await bibleModel.getBookByShortOrName(normalizedBook);
        if (!bookData) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const chapterData = await bibleModel.getChapter(bookData.id, chapter);
        if (!chapterData) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        const versesResult = await bibleModel.getVersesWithTranslations(bookData.id, chapter);
        const uniqueVerses = await bibleModel.getUniqueVersesForChapter(chapterData.id);
        // Structure the response data
        const translations = {};
        const verses = uniqueVerses.map(v => ({
            id: v.id,
            number: v.number
        }));
        versesResult.forEach(row => {
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

// Journal API Routes
router.get('/journal', journalController.getAllEntries);
router.get('/journal/:id', journalController.getEntry);
router.post('/journal', journalController.createEntry);
router.put('/journal/:id', journalController.updateEntry);
router.delete('/journal/:id', journalController.deleteEntry);
router.post('/verses/find', journalController.findVerseByReference);

module.exports = router;
