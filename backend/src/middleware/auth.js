// middleware/auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── VERIFICA TOKEN ────────────────────────────────────────
const autenticar = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.id },
    include: { empresa: true },
  });

  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ erro: 'Usuário inativo ou não encontrado' });
  }

  req.usuario = usuario;
  next();
};

// ─── APENAS ADMIN ──────────────────────────────────────────
const apenasAdmin = (req, res, next) => {
  if (req.usuario.role !== 'ADMIN') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// ─── ADMIN OU VENDEDOR DA EMPRESA ──────────────────────────
const adminOuVendedor = (req, res, next) => {
  const { role, empresaId } = req.usuario;
  const empresaSlug = req.params.slug || req.params.empresaId;

  if (role === 'ADMIN') return next();
  if (role === 'VENDEDOR') return next();

  return res.status(403).json({ erro: 'Acesso negado.' });
};

module.exports = { autenticar, apenasAdmin, adminOuVendedor };
