const { Client } = require('pg');
require('dotenv').config();

async function applyMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Successfully connected to the database.');
    
    console.log('Adding studentImage to Student table...');
    try {
      await client.query('ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "studentImage" TEXT;');
      console.log('Done.');
    } catch (e) {
      console.error('Error adding column to Student:', e.message);
    }

    console.log('Adding studentImage to StudentRequest table...');
    try {
      await client.query('ALTER TABLE "StudentRequest" ADD COLUMN IF NOT EXISTS "studentImage" TEXT;');
      console.log('Done.');
    } catch (e) {
      console.error('Error adding column to StudentRequest:', e.message);
    }

    await client.end();
  } catch (err) {
    console.error('Connection error:', err.stack);
  }
}

applyMigrations();
