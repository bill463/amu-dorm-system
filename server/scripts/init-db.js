const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'amu_dorm_db'}\`;`);
    console.log('Database initialized successfully');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
