// src/routes/pages.js
const express = require('express');
const path = require('path');
const router = express.Router();

// Serve book detail page
router.get('/books/:book', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/book.html'));
});

// Serve chapter page
router.get('/books/:book/:chapter', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/book.html'));
});

// Serve homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

module.exports = router;
