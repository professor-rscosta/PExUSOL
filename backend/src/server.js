// ============================================================
// SERVER.JS — Usina do Sol API + Frontend
// ============================================================
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const routes  = require('./routes');

const app = express();

// ─── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://pexusol.rscacademy.com.br',
    'https://www.pexusol.rscacademy.com.br',
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean),
  credentials: true,
}));

// ─── BODY PARSER ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── UPLOADS (imagens dos produtos) ───────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── FRONTEND REACT (pasta public/) ───────────────────────
const PUBLIC = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC));

// ─── STATUS DA API ────────────────────────────────────────
app.get('/status', (req, res) => {
  res.json({
    projeto:     '🌞 Usina do Sol',
    versao:      '1.0.0',
    instituicao: 'UNEB — Velho Chico',
    status:      'online',
    timestamp:   new Date().toISOString(),
  });
});

// ─── ROTAS DA API ─────────────────────────────────────────
app.use('/api', routes);

// ─── SPA FALLBACK (React Router) ──────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ erro: 'Rota não encontrada' });
  }
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

// ─── ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ erro: 'Token inválido' });
  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' });
  if (err.code === 'P2002')
    return res.status(400).json({ erro: 'Registro duplicado. Verifique os dados.' });
  res.status(err.statusCode || 500).json({
    erro: err.message || 'Erro interno do servidor',
  });
});

// ─── START ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('🌞 ════════════════════════════════════════');
  console.log('    USINA DO SOL — API + Frontend Iniciado!');
  console.log(`    http://localhost:${PORT}`);
  console.log('    UNEB · Departamento Velho Chico');
  console.log('════════════════════════════════════════🌞');
  console.log('');
});

module.exports = app;