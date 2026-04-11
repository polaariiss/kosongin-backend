import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from '../db/schema'; // Import seluruh skema yang sudah kita buat

// Muat variabel environment dari file .env
dotenv.config();

// Validasi keamanan: Pastikan DATABASE_URL ada
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL tidak ditemukan di file .env');
}

// Inisialisasi Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Opsional: Batasi maksimal koneksi bersamaan (berguna untuk mencegah server over-load)
  max: 20, 
});

// Mengecek apakah koneksi berhasil saat aplikasi pertama kali jalan
pool.on('connect', () => {
  console.log('Database PostgreSQL mode aktif on!');
});

pool.on('error', (err) => {
  console.error('Error occured.', err);
  process.exit(-1);
});

// Export instance `db` ini agar bisa dipakai di semua Controller
export const db = drizzle(pool, { schema });