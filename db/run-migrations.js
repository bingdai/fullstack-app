const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
    console.log('Starting database migrations...');
    console.log('Database URL:', process.env.DATABASE_URL ? '***REDACTED***' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    let pool;
    let client;
    
    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        console.log('Connecting to database...');
        client = await pool.connect();
        console.log('Database connection established');

        // Test connection
        const dbVersion = await client.query('SELECT version()');
        console.log('Database version:', dbVersion.rows[0].version);

        // Check if migrations table exists
        const migrationsTableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'migrations'
            );
        `);

        console.log('Migrations table exists:', migrationsTableExists.rows[0].exists);

        await client.query('BEGIN');
        
        // Get all migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        console.log('Reading migrations from:', migrationsDir);
        
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`Found ${migrationFiles.length} migration files`);

        // Run each migration
        for (const file of migrationFiles) {
            console.log(`\n--- Running migration: ${file} ---`);
            const filePath = path.join(migrationsDir, file);
            console.log('Reading file:', filePath);
            
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log('Executing SQL...');
            
            try {
                await client.query(sql);
                console.log(`✅ Completed migration: ${file}`);
            } catch (error) {
                console.error(`❌ Error in migration ${file}:`, error.message);
                throw error;
            }
        }

        await client.query('COMMIT');
        console.log('\n✅ All migrations completed successfully');
        return true;
    } catch (error) {
        console.error('\n❌ Migration failed with error:', error);
        if (client) {
            await client.query('ROLLBACK').catch(e => console.error('Rollback error:', e));
        }
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log('Database client released');
        }
        if (pool) {
            await pool.end();
            console.log('Connection pool closed');
        }
    }
}

runMigrations().catch(console.error);
