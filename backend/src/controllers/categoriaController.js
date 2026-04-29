// controllers/categoriaController.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const listar = async (req, res) => {
  const categorias = await prisma.categoria.findMany({
    include: { _count: { select: { produtos: true } } },
    orderBy: { nome: 'asc' },
  });
  res.json(categorias);
};

const criar = async (req, res) => {
  const { nome, icone } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  const categoria = await prisma.categoria.create({ data: { nome, icone } });
  res.status(201).json(categoria);
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, icone } = req.body;

  const categoria = await prisma.categoria.update({
    where: { id: Number(id) },
    data: { nome, icone },
  });
  res.json(categoria);
};

const excluir = async (req, res) => {
  const { id } = req.params;
  await prisma.categoria.delete({ where: { id: Number(id) } });
  res.json({ mensagem: 'Categoria excluída' });
};

module.exports = { listar, criar, atualizar, excluir };
