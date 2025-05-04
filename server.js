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
app.use(express.static(path.join(__dirname, 'public')));

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

// Routes
app.get('/api/data', async (req, res) => {
    console.log('Received GET request for /api/data');
    try {
        const result = await query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data', details: error.message, stack: error.stack });
    }
});

// Add a new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        const result = await query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user', details: error.message, stack: error.stack });
    }
});

// Book pages
app.get('/books/:book', async (req, res) => {
    const { book } = req.params;
    try {
        // Fetch book data from database
        const bookResult = await query('SELECT * FROM bible.books WHERE short = $1', [book]);
        if (bookResult.rows.length === 0) {
            return res.status(404).send('Book not found');
        }
        
        // Fetch chapters for the book
        const chaptersResult = await query(
            'SELECT * FROM bible.chapters WHERE book_id = $1 ORDER BY chapter_number',
            [bookResult.rows[0].id]
        );

        // Render book page
        res.sendFile(path.join(__dirname, 'public', 'book.html'));
    } catch (error) {
        console.error('Error fetching book data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API routes
app.get('/api/books/:book', async (req, res) => {
    const { book } = req.params;
    try {
        const bookResult = await query('SELECT * FROM bible.books WHERE short = $1', [book]);
        if (bookResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        const chaptersResult = await query(
            'SELECT * FROM bible.chapters WHERE book_id = $1 ORDER BY chapter_number',
            [bookResult.rows[0].id]
        );

        res.json({
            book: bookResult.rows[0],
            chapters: chaptersResult.rows
        });
    } catch (error) {
        console.error('Error fetching book data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
initializeDatabase()
    .then(() => {
        console.log('Database initialized successfully');
        // Start server locally if not in Vercel
        if (process.env.VERCEL !== '1') {
            app.listen(port, () => {
                console.log(`Server is now running on http://localhost:${port}`);
            });
        }
    }).catch(error => {
        console.error('Failed to start server:', error);
    });

// Export the Express app for Vercel serverless
module.exports = app;
