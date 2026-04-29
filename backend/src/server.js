// ============================================================
// SERVER.JS — Usina do Sol API
// ============================================================
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// ─── CORS ────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ],
  credentials: true,
}));

// ─── BODY PARSER ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILES (UPLOAD) ───────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── ROTAS ───────────────────────────────────────────────
app.use('/api', routes);

// ─── HEALTH CHECK ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    projeto: '🌞 Usina do Sol',
    versao: '1.0.0',
    instituicao: 'UNEB — Velho Chico',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// ─── ERROR HANDLER ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ erro: 'Token inválido' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' });
  }
  if (err.code === 'P2002') {
    return res.status(400).json({ erro: 'Registro duplicado. Verifique os dados.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    erro: err.message || 'Erro interno do servidor',
  });
});

// ─── START ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('🌞 ════════════════════════════════════════');
  console.log('    USINA DO SOL — API Iniciada!');
  console.log(`    http://localhost:${PORT}`);
  console.log('    UNEB · Departamento Velho Chico');
  console.log('════════════════════════════════════════🌞');
  console.log('');
});

module.exports = app;
