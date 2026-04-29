// controllers/usuarioController.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── LISTAR TODOS (ADMIN) ─────────────────────────────────
const listar = async (req, res) => {
  const { empresaId } = req.query;

  const usuarios = await prisma.usuario.findMany({
    where: {
      ...(empresaId && { empresaId: Number(empresaId) }),
    },
    select: {
      id: true, nome: true, email: true, role: true,
      ativo: true, empresaId: true, createdAt: true,
      empresa: { select: { nome: true, slug: true } },
    },
    orderBy: { nome: 'asc' },
  });

  res.json(usuarios);
};

// ─── CRIAR VENDEDOR ───────────────────────────────────────
const criar = async (req, res) => {
  const { nome, email, senha, role, empresaId } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }

  const existe = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
  if (existe) return res.status(400).json({ erro: 'Email já cadastrado' });

  if (role === 'VENDEDOR' && !empresaId) {
    return res.status(400).json({ erro: 'Vendedor precisa de uma empresa' });
  }

  const hash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email: email.toLowerCase().trim(),
      senha: hash,
      role: role || 'VENDEDOR',
      empresaId: empresaId ? Number(empresaId) : null,
    },
    select: {
      id: true, nome: true, email: true, role: true,
      ativo: true, empresaId: true, createdAt: true,
      empresa: { select: { nome: true } },
    },
  });

  res.status(201).json(usuario);
};

// ─── ATUALIZAR USUÁRIO ────────────────────────────────────
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, empresaId, ativo } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) } });
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  const dados = {
    nome: nome || usuario.nome,
    email: email ? email.toLowerCase() : usuario.email,
    empresaId: empresaId !== undefined ? (empresaId ? Number(empresaId) : null) : usuario.empresaId,
    ativo: ativo !== undefined ? Boolean(ativo) : usuario.ativo,
  };

  if (senha) {
    dados.senha = await bcrypt.hash(senha, 10);
  }

  const atualizado = await prisma.usuario.update({
    where: { id: Number(id) },
    data: dados,
    select: {
      id: true, nome: true, email: true, role: true,
      ativo: true, empresaId: true,
      empresa: { select: { nome: true } },
    },
  });

  res.json(atualizado);
};

// ─── EXCLUIR ──────────────────────────────────────────────
const excluir = async (req, res) => {
  const { id } = req.params;

  // Não pode excluir a si mesmo
  if (Number(id) === req.usuario.id) {
    return res.status(400).json({ erro: 'Não é possível excluir seu próprio usuário' });
  }

  await prisma.usuario.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });

  res.json({ mensagem: 'Usuário desativado com sucesso' });
};

module.exports = { listar, criar, atualizar, excluir };
