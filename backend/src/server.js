try { require('dotenv').config(); } catch(e) {}
require('express-async-errors');

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');
const routes  = require('./routes');

const app = express();

// Evita crash em erros não capturados
process.on('uncaughtException', (err) => console.error('uncaughtException:', err.message));
process.on('unhandledRejection', (reason) => console.error('unhandledRejection:', reason));

app.use(cors({
  origin: [
    'https://pexusol.rscacademy.com.br',
    'https://www.pexusol.rscacademy.com.br',
    process.env.FRONTEND_URL,
    'http://localhost:5173',
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const PUBLIC = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC));

// Log todas as requisições
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

app.get('/ping', (req, res) => res.json({ pong: true }));
app.get('/status', (req, res) => res.json({ status: 'online' }));
app.use('/api', routes);

app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads'))
    return res.status(404).json({ erro: 'Rota não encontrada' });
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Erro na rota', req.path, ':', err.message);
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ erro: 'Token inválido' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ erro: 'Token expirado' });
  res.status(err.statusCode || 500).json({ erro: err.message || 'Erro interno' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Banco MySQL conectado!');
  } catch(e) {
    console.error('❌ Banco erro:', e.message);
  }
  console.log('🌞 USINA DO SOL — porta ' + PORT);
});

module.exports = app;
