import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from '../db/schema';

// Muat variabel environment dari file .env
dotenv.config();

// Validasi keamanan: Pastikan DATABASE_URL ada
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL tidak ditemukan di file .env');
}

// Inisialisasi Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

pool.on('connect', () => {
  console.log('Database PostgreSQL mode aktif on!');
});

pool.on('error', (err) => {
  console.error('Error occured.', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
