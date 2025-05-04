import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  connectionString: string;
  poolSize: number;
  timeout: number;
}

export const databaseConfig: DatabaseConfig = {
  connectionString: process.env.SUPABASE_URL || '',
  poolSize: 2,
  timeout: 10000
};

export const pool = new Pool({
  connectionString: databaseConfig.connectionString,
  max: databaseConfig.poolSize,
  connectionTimeoutMillis: databaseConfig.timeout,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function query<T>(text: string, values?: any[]): Promise<T> {
  try {
    const result = await pool.query(text, values);
    return result.rows as T;
  } catch (error) {
    console.error('Database error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  }
}
