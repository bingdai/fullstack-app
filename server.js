require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const apiRoutes = require('./src/routes/api');
const pageRoutes = require('./src/routes/pages');

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

// Serve static files with proper caching headers
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
    }
}));

// Use API routes
app.use('/api', apiRoutes);

// Use page routes
app.use('/', pageRoutes);

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
        console.log('Starting server...');
        
        // Only run migrations in production
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
            console.log('Running database migrations...');
            const { exec } = require('child_process');
            await new Promise((resolve, reject) => {
                const migration = exec('node db/run-migrations.js');
                
                migration.stdout.on('data', (data) => {
                    console.log(`Migration: ${data}`);
                });
                
                migration.stderr.on('data', (data) => {
                    console.error(`Migration error: ${data}`);
                });
                
                migration.on('close', (code) => {
                    if (code === 0) {
                        console.log('Migrations completed successfully');
                        resolve();
                    } else {
                        console.error(`Migrations failed with code ${code}`);
                        reject(new Error(`Migrations failed with code ${code}`));
                    }
                });
            });
        }


        console.log('Database initialization complete');
        
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

// Only start server if this file is run directly (not when imported as a module)
if (require.main === module) {
    startServer().catch(error => {
        console.error('Fatal error during startup:', error);
        process.exit(1);
    });
}

// Export the Express app for Vercel serverless
module.exports = app;
