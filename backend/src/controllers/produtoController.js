// controllers/produtoController.js
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// ─── LISTAR PRODUTOS DE UMA EMPRESA ──────────────────────
const listarPorEmpresa = async (req, res) => {
  const { slug } = req.params;
  const { categoria, busca, pagina = 1, limite = 20 } = req.query;

  const empresa = await prisma.empresa.findUnique({ where: { slug } });
  if (!empresa) return res.status(404).json({ erro: 'Empresa não encontrada' });

  const where = {
    empresaId: empresa.id,
    ativo: true,
    ...(categoria && { categoriaId: Number(categoria) }),
    ...(busca && {
      nome: { contains: busca },
    }),
  };

  const skip = (Number(pagina) - 1) * Number(limite);

  const [produtos, total] = await Promise.all([
    prisma.produto.findMany({
      where,
      include: { categoria: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limite),
    }),
    prisma.produto.count({ where }),
  ]);

  res.json({
    produtos,
    total,
    pagina: Number(pagina),
    totalPaginas: Math.ceil(total / Number(limite)),
  });
};

// ─── LISTAR TODOS OS PRODUTOS (ADMIN) ────────────────────
const listarTodos = async (req, res) => {
  const { busca, empresaId, categoriaId } = req.query;

  const where = {
    ...(busca && { nome: { contains: busca } }),
    ...(empresaId && { empresaId: Number(empresaId) }),
    ...(categoriaId && { categoriaId: Number(categoriaId) }),
  };

  const produtos = await prisma.produto.findMany({
    where,
    include: { empresa: true, categoria: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(produtos);
};

// ─── LISTAR PARA O VENDEDOR ───────────────────────────────
const listarVendedor = async (req, res) => {
  const empresaId = req.usuario.empresaId;

  if (!empresaId) {
    return res.status(400).json({ erro: 'Vendedor sem empresa associada' });
  }

  const produtos = await prisma.produto.findMany({
    where: { empresaId },
    include: { categoria: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(produtos);
};

// ─── BUSCAR POR ID ────────────────────────────────────────
const buscarPorId = async (req, res) => {
  const { id } = req.params;

  const produto = await prisma.produto.findUnique({
    where: { id: Number(id) },
    include: { empresa: true, categoria: true },
  });

  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  res.json(produto);
};

// ─── CRIAR PRODUTO ────────────────────────────────────────
const criar = async (req, res) => {
  const { nome, descricao, preco, estoque, unidade, categoriaId } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
  }

  const empresaId = req.usuario.role === 'ADMIN'
    ? Number(req.body.empresaId)
    : req.usuario.empresaId;

  if (!empresaId) {
    return res.status(400).json({ erro: 'Empresa não identificada' });
  }

  let imagem = null;
  if (req.file) {
    imagem = `/uploads/produtos/${req.file.filename}`;
  }

  const produto = await prisma.produto.create({
    data: {
      nome,
      descricao,
      preco: parseFloat(preco),
      estoque: parseInt(estoque) || 0,
      unidade: unidade || 'un',
      imagem,
      empresaId,
      categoriaId: categoriaId ? Number(categoriaId) : null,
    },
    include: { categoria: true },
  });

  res.status(201).json(produto);
};

// ─── ATUALIZAR PRODUTO ────────────────────────────────────
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, estoque, unidade, categoriaId, ativo } = req.body;

  const produto = await prisma.produto.findUnique({ where: { id: Number(id) } });
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  // Vendedor só edita produtos da própria empresa
  if (req.usuario.role === 'VENDEDOR' && produto.empresaId !== req.usuario.empresaId) {
    return res.status(403).json({ erro: 'Sem permissão para editar este produto' });
  }

  let imagem = produto.imagem;
  if (req.file) {
    imagem = `/uploads/produtos/${req.file.filename}`;
    if (produto.imagem) {
      const oldPath = path.join(__dirname, '..', '..', produto.imagem);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const atualizado = await prisma.produto.update({
    where: { id: Number(id) },
    data: {
      nome: nome || produto.nome,
      descricao: descricao !== undefined ? descricao : produto.descricao,
      preco: preco ? parseFloat(preco) : produto.preco,
      estoque: estoque !== undefined ? parseInt(estoque) : produto.estoque,
      unidade: unidade || produto.unidade,
      imagem,
      categoriaId: categoriaId !== undefined ? (categoriaId ? Number(categoriaId) : null) : produto.categoriaId,
      ativo: ativo !== undefined ? (ativo === 'true' || ativo === true) : produto.ativo,
    },
    include: { categoria: true },
  });

  res.json(atualizado);
};

// ─── EXCLUIR PRODUTO ──────────────────────────────────────
const excluir = async (req, res) => {
  const { id } = req.params;

  const produto = await prisma.produto.findUnique({ where: { id: Number(id) } });
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  if (req.usuario.role === 'VENDEDOR' && produto.empresaId !== req.usuario.empresaId) {
    return res.status(403).json({ erro: 'Sem permissão' });
  }

  // Remove imagem
  if (produto.imagem) {
    const imgPath = path.join(__dirname, '..', '..', produto.imagem);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  await prisma.produto.delete({ where: { id: Number(id) } });
  res.json({ mensagem: 'Produto excluído com sucesso' });
};

// ─── BUSCA GLOBAL ─────────────────────────────────────────
const buscaGlobal = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ erro: 'Busca muito curta' });
  }

  const produtos = await prisma.produto.findMany({
    where: {
      ativo: true,
      nome: { contains: q },
      empresa: { ativo: true },
    },
    include: { empresa: true, categoria: true },
    take: 30,
  });

  res.json(produtos);
};

module.exports = {
  listarPorEmpresa,
  listarTodos,
  listarVendedor,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  buscaGlobal,
};
