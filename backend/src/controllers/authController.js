// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── LOGIN ────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { empresa: true, endereco: true },
  });

  if (!usuario || !usuario.ativo)
    return res.status(401).json({ erro: 'Email ou senha inválidos' });

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida)
    return res.status(401).json({ erro: 'Email ou senha inválidos' });

  const token = jwt.sign(
    { id: usuario.id, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { senha: _, ...usuarioSemSenha } = usuario;
  res.json({ token, usuario: usuarioSemSenha });
};

// ─── PERFIL ───────────────────────────────────────────────
const perfil = async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuario.id },
    include: { empresa: true, endereco: true },
  });
  const { senha: _, ...sem } = usuario;
  res.json(sem);
};

// ─── ATUALIZAR PERFIL ─────────────────────────────────────
const atualizarPerfil = async (req, res) => {
  const { nome, cpf, telefone, endereco } = req.body;
  const id = req.usuario.id;

  if (!nome || nome.trim().length < 3)
    return res.status(400).json({ erro: 'Nome inválido' });

  // Validar CPF único (exceto o próprio usuário)
  if (cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!validarCPF(cpfLimpo))
      return res.status(400).json({ erro: 'CPF inválido' });

    const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const existe = await prisma.usuario.findFirst({
      where: { cpf: cpfFormatado, NOT: { id } },
    });
    if (existe) return res.status(400).json({ erro: 'CPF já cadastrado' });
  }

  const cpfFormatado = cpf
    ? cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : null;

  // Atualizar usuário
  await prisma.usuario.update({
    where: { id },
    data: {
      nome: nome.trim(),
      cpf: cpfFormatado,
      telefone: telefone?.trim() || null,
    },
  });

  // Upsert endereço
  if (endereco && endereco.logradouro) {
    const endData = {
      logradouro: endereco.logradouro,
      numero: endereco.numero || 'S/N',
      complemento: endereco.complemento || null,
      bairro: endereco.bairro,
      cep: endereco.cep,
      cidade: endereco.cidade,
      estado: endereco.estado,
    };
    await prisma.endereco.upsert({
      where: { usuarioId: id },
      update: endData,
      create: { usuarioId: id, ...endData },
    });
  }

  const atualizado = await prisma.usuario.findUnique({
    where: { id },
    include: { empresa: true, endereco: true },
  });
  const { senha: _, ...sem } = atualizado;
  res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario: sem });
};

// ─── ALTERAR SENHA ────────────────────────────────────────
const alterarSenha = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha)
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  if (novaSenha.length < 6)
    return res.status(400).json({ erro: 'Nova senha deve ter no mínimo 6 caracteres' });

  const valida = await bcrypt.compare(senhaAtual, req.usuario.senha);
  if (!valida) return res.status(400).json({ erro: 'Senha atual incorreta' });

  const hash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({ where: { id: req.usuario.id }, data: { senha: hash } });
  res.json({ mensagem: 'Senha alterada com sucesso' });
};

// ─── HELPER: VALIDAR CPF ──────────────────────────────────
function validarCPF(cpf) {
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
}

module.exports = { login, perfil, atualizarPerfil, alterarSenha };
