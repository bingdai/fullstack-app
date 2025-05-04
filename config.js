require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => {
        console.log('Executing query:', text);
        return pool.query(text, params);
    },
    pool
};
