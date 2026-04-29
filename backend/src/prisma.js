// src/prisma.js — Singleton do PrismaClient com driver adapter (sem binário Rust)
const { PrismaClient } = require('@prisma/client');

let prisma;

if (!global._prisma) {
  global._prisma = new PrismaClient({
    log: ['error'],
  });
}

prisma = global._prisma;

module.exports = prisma;
