const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('./config');

const app = express();
const port = 3002; // Changed to avoid port conflict
console.log('Starting server on port:', port);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
            const port = 3002;
            app.listen(port, () => {
                console.log(`Server is now running on http://localhost:${port}`);
            });
        }
    }).catch(error => {
        console.error('Failed to start server:', error);
    });

// Export the Express app for Vercel serverless
module.exports = app;
