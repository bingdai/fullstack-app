const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('./config');

const app = express();
const port = process.env.PORT || 3002;
console.log('Starting server on port:', port);

// Middleware
app.use(cors());
app.use(express.json());

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database initialization
async function initializeDatabase() {
    console.log('Initializing database...');
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
    }
}

// API endpoint for book data
app.get('/api/books/:book', async (req, res) => {
    const { book } = req.params;
    try {
        console.log('Received request for book:', book);
        // Fetch book data from database
        const bookResult = await query('SELECT * FROM bible.books WHERE short = $1', [book]);
        console.log('Book query result:', bookResult.rows);
        if (bookResult.rows.length === 0) {
            console.log('Book not found:', book);
            return res.status(404).json({ error: 'Book not found' });
        }
        // Fetch chapters for the book
        const chaptersResult = await query(
            'SELECT * FROM bible.chapters WHERE book_id = $1 ORDER BY number',
            [bookResult.rows[0].id]
        );
        console.log('Chapters query result:', chaptersResult.rows);
        res.json({ book: bookResult.rows[0], chapters: chaptersResult.rows });
        console.log('Sent JSON response for book:', book);
    } catch (error) {
        console.error('Error fetching book data:', error);
        // Log error details to terminal for debugging
        console.log('DEBUG ERROR DETAILS:', error.message, error.stack);
        // Send detailed error for debugging
        res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

// Serve static files with proper caching headers
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
    }
}));

// API routes
app.get('/api/books/:book', async (req, res) => {
    const { book } = req.params;
    try {
        console.log('Received request for book:', book);
        const bookResult = await query('SELECT * FROM bible.books WHERE short = $1', [book]);
        console.log('Book query result:', bookResult.rows);
        if (bookResult.rows.length === 0) {
            console.log('Book not found:', book);
            return res.status(404).json({ 
                error: 'Book not found',
                details: `No book found with short name: ${book}`
            });
        }
        
        const bookId = bookResult.rows[0].id;
        console.log('Fetching chapters for book ID:', bookId);
        
        const chaptersResult = await query(
            'SELECT * FROM bible.chapters WHERE book_id = $1 ORDER BY number',
            [bookId]
        );
        console.log('Chapters found:', chaptersResult.rows.length);
        
        res.json({ 
            book: bookResult.rows[0], 
            chapters: chaptersResult.rows 
        });
    } catch (error) {
        console.error('Error in /api/books/:book:', {
            error: error.message,
            stack: error.stack,
            params: req.params,
            query: req.query
        });
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
    // If the request is for an API route, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    // Otherwise serve the appropriate HTML file
    if (req.path.startsWith('/books/')) {
        return res.sendFile(path.join(__dirname, 'public', 'book.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Optional: catch-all for unknown routes
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

// Global error handlers for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// Run migrations and start server
async function startServer() {
    try {
        console.log('Running database migrations...');
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
            exec('node db/run-migrations.js', (error, stdout, stderr) => {
                if (error) {
                    console.error('Migration error:', stderr);
                    return reject(error);
                }
                console.log('Migrations completed:', stdout);
                resolve();
            });
        });

        console.log('Database initialized successfully');
        
        // Start server locally if not in Vercel
        if (process.env.VERCEL !== '1') {
            app.listen(port, () => {
                console.log(`Server is now running on http://localhost:${port}`);
            });
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Export the Express app for Vercel serverless
module.exports = app;
