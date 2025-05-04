require('dotenv').config();

const { Pool } = require('pg');

// Ensure SUPABASE_URL is set
if (!process.env.SUPABASE_URL) {
    console.error('Error: SUPABASE_URL environment variable is not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 second timeout
    idleTimeoutMillis: 60000, // 60 second idle timeout
    max: 2, // Maximum number of clients in the pool
});

module.exports = {
    query: async (text, params) => {
        console.log('Executing query:', text, params);
        try {
            const result = await pool.query({ text, values: params || [] });
            console.log('Query result:', result.rows);
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
