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

// Serve journal pages
router.get('/journal', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/journal.html'));
});

router.get('/journal/new', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/journal-edit.html'));
});

router.get('/journal/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/journal-view.html'));
});

router.get('/journal/:id/edit', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/journal-edit.html'));
});

// Serve homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

module.exports = router;
