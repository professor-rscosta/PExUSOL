// src/db.js — Pool de conexão MySQL (sem Prisma/Rust)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
