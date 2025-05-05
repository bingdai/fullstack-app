const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? '***REDACTED***' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('✅ Database connection successful');
        
        // Test query
        const version = await client.query('SELECT version()');
        console.log('PostgreSQL version:', version.rows[0].version);
        
        // Check if schema exists
        const schemaExists = await client.query(
            `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'bible'`
        );
        console.log('Bible schema exists:', schemaExists.rows.length > 0);
        
        // Check if books table exists
        const booksTableExists = await client.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'bible' 
                AND table_name = 'books'
            )`
        );
        console.log('Books table exists:', booksTableExists.rows[0].exists);
        
        // List all books if they exist
        if (booksTableExists.rows[0].exists) {
            const books = await client.query('SELECT id, name, short FROM bible.books');
            console.log('Books in database:', books.rows);
        }
        
        client.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

testConnection()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
