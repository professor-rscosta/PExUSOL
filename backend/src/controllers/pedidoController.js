// controllers/pedidoController.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── GERAR PROTOCOLO ──────────────────────────────────────
const gerarProtocolo = async () => {
  const ano = new Date().getFullYear();
  const ultimo = await prisma.pedido.findFirst({
    where: { protocolo: { startsWith: `PED-${ano}-` } },
    orderBy: { id: 'desc' },
  });

  let seq = 1;
  if (ultimo) {
    const partes = ultimo.protocolo.split('-');
    seq = parseInt(partes[2]) + 1;
  }

  return `PED-${ano}-${String(seq).padStart(4, '0')}`;
};

// ─── CRIAR PEDIDO (PÚBLICO) ───────────────────────────────
const criar = async (req, res) => {
  const { slug } = req.params;
  const { clienteNome, clienteTelefone, clienteEndereco, tipoEntrega, observacao, itens } = req.body;

  if (!clienteNome || !itens || itens.length === 0) {
    return res.status(400).json({ erro: 'Nome do cliente e itens são obrigatórios' });
  }

  const empresa = await prisma.empresa.findUnique({ where: { slug } });
  if (!empresa || !empresa.ativo) {
    return res.status(404).json({ erro: 'Empresa não encontrada' });
  }

  // Valida e calcula itens
  let total = 0;
  const itensValidados = [];

  for (const item of itens) {
    const produto = await prisma.produto.findUnique({ where: { id: Number(item.produtoId) } });

    if (!produto || !produto.ativo || produto.empresaId !== empresa.id) {
      return res.status(400).json({ erro: `Produto inválido: ${item.produtoId}` });
    }

    if (produto.estoque < item.quantidade) {
      return res.status(400).json({ erro: `Estoque insuficiente para: ${produto.nome}` });
    }

    itensValidados.push({
      produtoId: produto.id,
      quantidade: Number(item.quantidade),
      preco: produto.preco,
    });

    total += Number(produto.preco) * Number(item.quantidade);
  }

  const protocolo = await gerarProtocolo();

  const pedido = await prisma.pedido.create({
    data: {
      protocolo,
      clienteNome: clienteNome.trim(),
      clienteTelefone: clienteTelefone?.replace(/\D/g, ''),
      clienteEndereco: tipoEntrega === 'ENTREGA' ? clienteEndereco : null,
      tipoEntrega: tipoEntrega || 'RETIRADA',
      observacao,
      total,
      empresaId: empresa.id,
      itens: {
        create: itensValidados,
      },
    },
    include: {
      itens: { include: { produto: true } },
      empresa: true,
    },
  });

  // Atualiza estoque
  for (const item of itensValidados) {
    await prisma.produto.update({
      where: { id: item.produtoId },
      data: { estoque: { decrement: item.quantidade } },
    });
  }

  res.status(201).json(pedido);
};

// ─── LISTAR PEDIDOS DA EMPRESA (VENDEDOR) ────────────────
const listarPorEmpresa = async (req, res) => {
  const empresaId = req.usuario.role === 'ADMIN'
    ? Number(req.params.empresaId)
    : req.usuario.empresaId;

  const { status, dataInicio, dataFim, pagina = 1, limite = 20 } = req.query;

  const where = {
    empresaId,
    ...(status && { status }),
    ...(dataInicio && dataFim && {
      createdAt: {
        gte: new Date(dataInicio),
        lte: new Date(dataFim + 'T23:59:59'),
      },
    }),
  };

  const skip = (Number(pagina) - 1) * Number(limite);

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: {
        itens: { include: { produto: { select: { nome: true, imagem: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limite),
    }),
    prisma.pedido.count({ where }),
  ]);

  res.json({
    pedidos,
    total,
    pagina: Number(pagina),
    totalPaginas: Math.ceil(total / Number(limite)),
  });
};

// ─── BUSCAR PEDIDO POR ID ─────────────────────────────────
const buscarPorId = async (req, res) => {
  const { id } = req.params;

  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(id) },
    include: {
      itens: { include: { produto: true } },
      empresa: true,
    },
  });

  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  // Vendedor só vê pedidos da própria empresa
  if (req.usuario.role === 'VENDEDOR' && pedido.empresaId !== req.usuario.empresaId) {
    return res.status(403).json({ erro: 'Sem permissão' });
  }

  res.json(pedido);
};

// ─── ATUALIZAR STATUS ─────────────────────────────────────
const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ['PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido' });
  }

  const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } });
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  if (req.usuario.role === 'VENDEDOR' && pedido.empresaId !== req.usuario.empresaId) {
    return res.status(403).json({ erro: 'Sem permissão' });
  }

  // Se cancelado, devolve estoque
  if (status === 'CANCELADO' && pedido.status !== 'CANCELADO') {
    const itens = await prisma.itemPedido.findMany({ where: { pedidoId: Number(id) } });
    for (const item of itens) {
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: { estoque: { increment: item.quantidade } },
      });
    }
  }

  const atualizado = await prisma.pedido.update({
    where: { id: Number(id) },
    data: { status },
    include: { itens: { include: { produto: true } } },
  });

  res.json(atualizado);
};

// ─── RELATÓRIO DE VENDAS ──────────────────────────────────
const relatorio = async (req, res) => {
  const empresaId = req.usuario.role === 'ADMIN'
    ? Number(req.params.empresaId || 0)
    : req.usuario.empresaId;

  const { dataInicio, dataFim } = req.query;

  const hoje = new Date();
  const inicio = dataInicio ? new Date(dataInicio) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = dataFim ? new Date(dataFim + 'T23:59:59') : hoje;

  const whereBase = {
    ...(empresaId && { empresaId }),
    createdAt: { gte: inicio, lte: fim },
    status: { notIn: ['CANCELADO'] },
  };

  const [
    totalPedidos,
    receita,
    porStatus,
    produtosMaisVendidos,
    pedidosPorDia,
  ] = await Promise.all([
    prisma.pedido.count({ where: whereBase }),

    prisma.pedido.aggregate({
      where: whereBase,
      _sum: { total: true },
    }),

    prisma.pedido.groupBy({
      by: ['status'],
      where: { ...(empresaId && { empresaId }), createdAt: { gte: inicio, lte: fim } },
      _count: { status: true },
    }),

    prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: {
        pedido: whereBase,
      },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 5,
    }).then(async (items) => {
      return Promise.all(
        items.map(async (item) => {
          const produto = await prisma.produto.findUnique({
            where: { id: item.produtoId },
            select: { nome: true, imagem: true },
          });
          return { ...produto, quantidade: item._sum.quantidade };
        })
      );
    }),

    prisma.$queryRaw`
      SELECT DATE(createdAt) as data, COUNT(*) as pedidos, SUM(total) as receita
      FROM pedidos
      WHERE empresaId = ${empresaId || 0} OR ${!empresaId}
        AND createdAt >= ${inicio}
        AND createdAt <= ${fim}
        AND status != 'CANCELADO'
      GROUP BY DATE(createdAt)
      ORDER BY data
    `.catch(() => []),
  ]);

  res.json({
    periodo: { inicio, fim },
    totalPedidos,
    receita: receita._sum.total || 0,
    porStatus,
    produtosMaisVendidos,
    pedidosPorDia,
  });
};

// ─── DASHBOARD GLOBAL (ADMIN) ─────────────────────────────
const dashboardGlobal = async (req, res) => {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [
    totalEmpresas,
    totalProdutos,
    totalPedidos,
    pedidosMes,
    receitaTotal,
    receitaMes,
    empresasRanking,
  ] = await Promise.all([
    prisma.empresa.count({ where: { ativo: true } }),
    prisma.produto.count({ where: { ativo: true } }),
    prisma.pedido.count(),
    prisma.pedido.count({ where: { createdAt: { gte: inicioMes } } }),
    prisma.pedido.aggregate({
      where: { status: { notIn: ['CANCELADO'] } },
      _sum: { total: true },
    }),
    prisma.pedido.aggregate({
      where: {
        createdAt: { gte: inicioMes },
        status: { notIn: ['CANCELADO'] },
      },
      _sum: { total: true },
    }),
    prisma.pedido.groupBy({
      by: ['empresaId'],
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }).then(async (items) => {
      return Promise.all(
        items.map(async (item) => {
          const empresa = await prisma.empresa.findUnique({
            where: { id: item.empresaId },
            select: { nome: true, slug: true },
          });
          return {
            ...empresa,
            pedidos: item._count.id,
            receita: item._sum.total || 0,
          };
        })
      );
    }),
  ]);

  res.json({
    totalEmpresas,
    totalProdutos,
    totalPedidos,
    pedidosMes,
    receitaTotal: receitaTotal._sum.total || 0,
    receitaMes: receitaMes._sum.total || 0,
    empresasRanking,
  });
};

module.exports = {
  criar,
  listarPorEmpresa,
  buscarPorId,
  atualizarStatus,
  relatorio,
  dashboardGlobal,
};
