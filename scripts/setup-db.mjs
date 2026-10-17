import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const password = process.argv[2] || process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.log(`
========================================================================
PANDUAN MENJALANKAN SETUP DATABASE SUPABASE (KITCHEN CHAACAKE)
========================================================================
Password database Supabase belum dimasukkan.

Cara 1 (Otomatis via Terminal):
  Jalankan perintah ini dengan password database Supabase Anda:
  node scripts/setup-db.mjs "PASSWORD_DATABASE_ANDA"

Cara 2 (Mudah via Supabase Dashboard Web - Rekomendasi):
  1. Buka Supabase SQL Editor:
     https://supabase.com/dashboard/project/aivmrlglexmzbryjvaui/sql
  2. Buka file: supabase/schema.sql di project ini
  3. Salin seluruh isinya dan Paste di SQL Editor
  4. Klik tombol "Run" (Selesai dalam 5 detik!)
========================================================================
`);
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL || `postgresql://postgres:${encodeURIComponent(password)}@db.aivmrlglexmzbryjvaui.supabase.co:5432/postgres`;

async function run() {
  console.log('Menghubungkan ke database Supabase...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✓ Berhasil terhubung ke Supabase PostgreSQL!');

    const schemaPath = path.resolve(__dirname, '../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Menjalankan skrip skema database (supabase/schema.sql)...');
    await client.query(sql);
    console.log('✓ Skema tabel, RLS policies, dan Data Awal berhasil dibuat di Supabase!');

    // Verify row counts
    const tables = ['categories', 'raw_materials', 'finished_products', 'transactions', 'notifications', 'users'];
    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM public.${table}`);
      console.log(`  - Tabel public.${table}: ${res.rows[0].count} data`);
    }

    console.log('\n========================================================================');
    console.log('BERHASIL! Database Supabase Kitchen Chaacake sudah 100% aktif dan siap dipakai.');
    console.log('========================================================================');
  } catch (err) {
    console.error('✗ Terjadi kesalahan:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('  -> Password database yang Anda masukkan salah.');
    }
  } finally {
    await client.end();
  }
}

run();
