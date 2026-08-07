require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query('ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;');
    console.log('passwordHash is now optional.');
  } catch (err) {
    console.log('passwordHash might already be optional or error:', err.message);
  }
  
  try {
    await pool.query('ALTER TABLE "User" ADD COLUMN "googleId" TEXT UNIQUE;');
    console.log('googleId column added.');
  } catch (err) {
    console.log('googleId might already exist or error:', err.message);
  }

  pool.end();
}

migrate();
