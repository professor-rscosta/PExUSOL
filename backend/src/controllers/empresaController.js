// controllers/empresaController.js
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// ─── LISTAR TODAS ─────────────────────────────────────────
const listar = async (req, res) => {
  const empresas = await prisma.empresa.findMany({
    where: { ativo: true },
    include: {
      _count: { select: { produtos: true, pedidos: true, usuarios: true } },
    },
    orderBy: { nome: 'asc' },
  });
  res.json(empresas);
};

// ─── LISTAR TODAS (ADMIN) ─────────────────────────────────
const listarAdmin = async (req, res) => {
  const empresas = await prisma.empresa.findMany({
    include: {
      _count: { select: { produtos: true, pedidos: true, usuarios: true } },
    },
    orderBy: { nome: 'asc' },
  });
  res.json(empresas);
};

// ─── BUSCAR POR SLUG ──────────────────────────────────────
const buscarPorSlug = async (req, res) => {
  const { slug } = req.params;

  const empresa = await prisma.empresa.findUnique({
    where: { slug },
    include: {
      _count: { select: { produtos: { where: { ativo: true } } } },
    },
  });

  if (!empresa) {
    return res.status(404).json({ erro: 'Empresa não encontrada' });
  }

  res.json(empresa);
};

// ─── CRIAR ────────────────────────────────────────────────
const criar = async (req, res) => {
  const { nome, slug, descricao, whatsapp, endereco, cidade } = req.body;

  if (!nome || !slug || !whatsapp) {
    return res.status(400).json({ erro: 'Nome, slug e WhatsApp são obrigatórios' });
  }

  // Normaliza slug
  const slugNormalizado = slug
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const empresa = await prisma.empresa.create({
    data: {
      nome,
      slug: slugNormalizado,
      descricao,
      whatsapp: whatsapp.replace(/\D/g, ''),
      endereco,
      cidade,
    },
  });

  res.status(201).json(empresa);
};

// ─── ATUALIZAR ────────────────────────────────────────────
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, whatsapp, endereco, cidade, ativo } = req.body;

  const empresa = await prisma.empresa.findUnique({ where: { id: Number(id) } });
  if (!empresa) return res.status(404).json({ erro: 'Empresa não encontrada' });

  // Restrição: vendedor só pode editar sua própria empresa
  if (req.usuario.role === 'VENDEDOR' && req.usuario.empresaId !== Number(id)) {
    return res.status(403).json({ erro: 'Sem permissão' });
  }

  // Upload de logo
  let logo = empresa.logo;
  if (req.file) {
    logo = `/uploads/produtos/${req.file.filename}`;
    // Remove logo anterior
    if (empresa.logo) {
      const oldPath = path.join(__dirname, '..', '..', empresa.logo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const atualizada = await prisma.empresa.update({
    where: { id: Number(id) },
    data: {
      nome: nome || empresa.nome,
      descricao: descricao !== undefined ? descricao : empresa.descricao,
      whatsapp: whatsapp ? whatsapp.replace(/\D/g, '') : empresa.whatsapp,
      endereco: endereco !== undefined ? endereco : empresa.endereco,
      cidade: cidade !== undefined ? cidade : empresa.cidade,
      logo,
      ativo: ativo !== undefined ? Boolean(ativo) : empresa.ativo,
    },
  });

  res.json(atualizada);
};

// ─── EXCLUIR ──────────────────────────────────────────────
const excluir = async (req, res) => {
  const { id } = req.params;

  await prisma.empresa.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });

  res.json({ mensagem: 'Empresa desativada com sucesso' });
};

// ─── DASHBOARD DA EMPRESA ─────────────────────────────────
const dashboard = async (req, res) => {
  const empresaId = req.usuario.role === 'ADMIN'
    ? Number(req.params.id)
    : req.usuario.empresaId;

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [totalProdutos, totalPedidos, pedidosMes, receitaMes, pedidosRecentes] =
    await Promise.all([
      prisma.produto.count({ where: { empresaId, ativo: true } }),
      prisma.pedido.count({ where: { empresaId } }),
      prisma.pedido.count({
        where: { empresaId, createdAt: { gte: inicioMes } },
      }),
      prisma.pedido.aggregate({
        where: {
          empresaId,
          createdAt: { gte: inicioMes },
          status: { notIn: ['CANCELADO'] },
        },
        _sum: { total: true },
      }),
      prisma.pedido.findMany({
        where: { empresaId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          itens: { include: { produto: { select: { nome: true } } } },
        },
      }),
    ]);

  res.json({
    totalProdutos,
    totalPedidos,
    pedidosMes,
    receitaMes: receitaMes._sum.total || 0,
    pedidosRecentes,
  });
};

module.exports = { listar, listarAdmin, buscarPorSlug, criar, atualizar, excluir, dashboard };
