require('dotenv').config();

// Ensure DATABASE_URL is set for both local and remote environments
if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
}

// No DB exports needed; all DB logic is now in /src/db.js
