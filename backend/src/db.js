// src/db.js — Pool de conexão MySQL (sem Prisma/Rust)
const mysql = require('mysql2/promise');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não definida!');
}

const pool = mysql.createPool(process.env.DATABASE_URL || '');

// Testa a conexão ao carregar
pool.query('SELECT 1')
  .then(() => console.log('✅ Pool MySQL OK'))
  .catch(e => console.error('❌ Pool MySQL erro:', e.message));

module.exports = pool;
