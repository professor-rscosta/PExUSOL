// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── LOGIN ────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { empresa: true },
  });

  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  const token = jwt.sign(
    { id: usuario.id, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { senha: _, ...usuarioSemSenha } = usuario;

  res.json({
    token,
    usuario: usuarioSemSenha,
  });
};

// ─── PERFIL ───────────────────────────────────────────────
const perfil = async (req, res) => {
  const { senha: _, ...usuario } = req.usuario;
  res.json(usuario);
};

// ─── ALTERAR SENHA ────────────────────────────────────────
const alterarSenha = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }
  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: 'Nova senha deve ter no mínimo 6 caracteres' });
  }

  const valida = await bcrypt.compare(senhaAtual, req.usuario.senha);
  if (!valida) {
    return res.status(400).json({ erro: 'Senha atual incorreta' });
  }

  const hash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: req.usuario.id },
    data: { senha: hash },
  });

  res.json({ mensagem: 'Senha alterada com sucesso' });
};

module.exports = { login, perfil, alterarSenha };
