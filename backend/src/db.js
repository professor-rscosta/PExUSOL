// src/db.js — Pool de conexão MySQL (sem Prisma/Rust)
const mysql = require('mysql2/promise');

const pool = mysql.createPool(process.env.DATABASE_URL || '');

module.exports = pool;
