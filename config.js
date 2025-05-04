require('dotenv').config();

const { Pool } = require('pg');

// Ensure SUPABASE_URL is set
if (!process.env.SUPABASE_URL) {
    console.error('Error: SUPABASE_URL environment variable is not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 second timeout
    idleTimeoutMillis: 60000, // 60 second idle timeout
    max: 20, // Maximum number of clients in the pool
    min: 2 // Minimum number of clients in the pool
});

module.exports = {
    query: async (text, params) => {
        console.log('Executing query:', text);
        try {
            const result = await pool.query(text, params);
            return result;
        } catch (error) {
            console.error('Database error:', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            throw error;
        }
    },
    pool
};
