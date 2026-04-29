const db = require('../db');

const gerarProtocolo = async () => {
  const ano = new Date().getFullYear();
  const [[r]] = await db.query("SELECT COUNT(*) as c FROM pedidos WHERE YEAR(createdAt)=?", [ano]);
  const num = String(r.c + 1).padStart(4, '0');
  return `PED-${ano}-${num}`;
};

const criar = async (req, res) => {
  const { slug } = req.params;
  const { clienteNome, clienteTelefone, clienteEndereco, tipoEntrega, observacao, itens } = req.body;
  if (!clienteNome||!itens?.length) return res.status(400).json({ erro: 'Nome e itens obrigatórios' });
  const [emp] = await db.query('SELECT id,whatsapp FROM empresas WHERE slug=? AND ativo=1', [slug]);
  if (!emp[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  
  let total = 0;
  const itensValidos = [];
  for (const item of itens) {
    const [p] = await db.query('SELECT id,preco,estoque,nome FROM produtos WHERE id=? AND ativo=1', [item.produtoId]);
    if (!p[0]) return res.status(400).json({ erro: `Produto ${item.produtoId} não encontrado` });
    if (p[0].estoque < item.quantidade) return res.status(400).json({ erro: `Estoque insuficiente: ${p[0].nome}` });
    total += Number(p[0].preco) * item.quantidade;
    itensValidos.push({ ...item, preco: p[0].preco, nomeProduto: p[0].nome });
  }

  const protocolo = await gerarProtocolo();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO pedidos (protocolo,clienteNome,clienteTelefone,clienteEndereco,tipoEntrega,observacao,total,empresaId,status) VALUES (?,?,?,?,?,?,?,?,?)',
      [protocolo, clienteNome, clienteTelefone||null, clienteEndereco||null, tipoEntrega||'RETIRADA', observacao||null, total, emp[0].id, 'PENDENTE']
    );
    const pedidoId = r.insertId;
    for (const item of itensValidos) {
      await conn.query('INSERT INTO itens_pedido (pedidoId,produtoId,quantidade,preco) VALUES (?,?,?,?)', [pedidoId, item.produtoId, item.quantidade, item.preco]);
      await conn.query('UPDATE produtos SET estoque=estoque-? WHERE id=?', [item.quantidade, item.produtoId]);
    }
    await conn.commit();
    res.status(201).json({ id: pedidoId, protocolo, total, status: 'PENDENTE', whatsapp: emp[0].whatsapp, itens: itensValidos });
  } catch(e) {
    await conn.rollback();
    throw e;
  } finally { conn.release(); }
};

const listarPorEmpresa = async (req, res) => {
  const { slug } = req.params;
  const { status, pagina=1, limite=10 } = req.query;
  const [emp] = await db.query('SELECT id FROM empresas WHERE slug=?', [slug]);
  if (!emp[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  let q = 'SELECT * FROM pedidos WHERE empresaId=?';
  const params = [emp[0].id];
  if (status) { q += ' AND status=?'; params.push(status); }
  const [[{total}]] = await db.query(q.replace('SELECT *','SELECT COUNT(*) as total'), params);
  q += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(Number(limite), (Number(pagina)-1)*Number(limite));
  const [rows] = await db.query(q, params);
  res.json({ pedidos: rows, total, totalPaginas: Math.ceil(total/limite), pagina: Number(pagina) });
};

const buscarPorId = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM pedidos WHERE id=?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ erro: 'Pedido não encontrado' });
  const [itens] = await db.query('SELECT i.*, p.nome as nomeProduto, i.quantidade*i.preco as subtotal FROM itens_pedido i LEFT JOIN produtos p ON i.produtoId=p.id WHERE i.pedidoId=?', [req.params.id]);
  res.json({ ...rows[0], itens });
};

const atualizarStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const [rows] = await db.query('SELECT * FROM pedidos WHERE id=?', [id]);
  if (!rows[0]) return res.status(404).json({ erro: 'Pedido não encontrado' });
  if (status === 'CANCELADO' && rows[0].status !== 'CANCELADO') {
    const [itens] = await db.query('SELECT * FROM itens_pedido WHERE pedidoId=?', [id]);
    for (const item of itens) await db.query('UPDATE produtos SET estoque=estoque+? WHERE id=?', [item.quantidade, item.produtoId]);
  }
  await db.query('UPDATE pedidos SET status=? WHERE id=?', [status, id]);
  res.json({ mensagem: 'Status atualizado', status });
};

const relatorio = async (req, res) => {
  const { slug } = req.params;
  const { dataInicio, dataFim } = req.query;
  const [emp] = await db.query('SELECT id FROM empresas WHERE slug=?', [slug]);
  if (!emp[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  const id = emp[0].id;
  const di = dataInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const df = dataFim || new Date().toISOString().split('T')[0];
  const [[tot]] = await db.query("SELECT COUNT(*) as totalPedidos, COALESCE(SUM(total),0) as receitaTotal, COALESCE(AVG(total),0) as ticketMedio FROM pedidos WHERE empresaId=? AND status!='CANCELADO' AND DATE(createdAt) BETWEEN ? AND ?", [id,di,df]);
  const [[ti]] = await db.query("SELECT COALESCE(SUM(i.quantidade),0) as totalItens FROM itens_pedido i JOIN pedidos p ON i.pedidoId=p.id WHERE p.empresaId=? AND p.status!='CANCELADO' AND DATE(p.createdAt) BETWEEN ? AND ?", [id,di,df]);
  const [top] = await db.query("SELECT i.produtoId, prod.nome as nomeProduto, SUM(i.quantidade) as totalQuantidade, SUM(i.quantidade*i.preco) as totalReceita FROM itens_pedido i JOIN pedidos p ON i.pedidoId=p.id JOIN produtos prod ON i.produtoId=prod.id WHERE p.empresaId=? AND p.status!='CANCELADO' AND DATE(p.createdAt) BETWEEN ? AND ? GROUP BY i.produtoId ORDER BY totalQuantidade DESC LIMIT 10", [id,di,df]);
  const [byStatus] = await db.query("SELECT status, COUNT(*) as _count FROM pedidos WHERE empresaId=? AND DATE(createdAt) BETWEEN ? AND ? GROUP BY status", [id,di,df]);
  res.json({ ...tot, ...ti, produtosMaisVendidos: top, pedidosPorStatus: byStatus });
};

const dashboardGlobal = async (req, res) => {
  const [[tot]] = await db.query("SELECT COUNT(*) as totalPedidos, COALESCE(SUM(total),0) as receitaTotal FROM pedidos WHERE status!='CANCELADO'");
  const [[prods]] = await db.query("SELECT COUNT(*) as totalProdutos FROM produtos WHERE ativo=1");
  const [[emps]] = await db.query("SELECT COUNT(*) as totalEmpresas FROM empresas WHERE ativo=1");
  const [ranking] = await db.query("SELECT e.nome, COUNT(p.id) as totalPedidos, COALESCE(SUM(p.total),0) as receita FROM empresas e LEFT JOIN pedidos p ON e.id=p.empresaId AND p.status!='CANCELADO' WHERE e.ativo=1 GROUP BY e.id ORDER BY receita DESC");
  res.json({ ...tot, ...prods, ...emps, ranking });
};


const listarPorId = async (req, res) => {
  const { empresaId } = req.params;
  const { status, pagina=1, limite=20 } = req.query;
  let q = 'SELECT * FROM pedidos WHERE empresaId=?';
  const params = [empresaId];
  if (status) { q += ' AND status=?'; params.push(status); }
  const [[{total}]] = await db.query(q.replace('SELECT *','SELECT COUNT(*) as total'), params);
  q += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(Number(limite), (Number(pagina)-1)*Number(limite));
  const [rows] = await db.query(q, params);
  // Busca itens de cada pedido
  for (const p of rows) {
    const [itens] = await db.query(
      'SELECT i.*, prod.nome as nomeProduto FROM itens_pedido i LEFT JOIN produtos prod ON i.produtoId=prod.id WHERE i.pedidoId=?',
      [p.id]
    );
    p.itens = itens;
  }
  res.json({ pedidos: rows, total, totalPaginas: Math.ceil(total/limite), pagina: Number(pagina) });
};


const rastrear = async (req, res) => {
  const { protocolo } = req.params;
  const [rows] = await db.query(
    `SELECT p.*, e.nome as empresaNome, e.whatsapp as empresaWhatsapp, e.logo as empresaLogo, e.slug as empresaSlug
     FROM pedidos p LEFT JOIN empresas e ON p.empresaId = e.id
     WHERE p.protocolo = ?`,
    [protocolo.toUpperCase()]
  );
  if (!rows[0]) return res.status(404).json({ erro: 'Pedido não encontrado. Verifique o protocolo.' });
  const pedido = rows[0];
  const [itens] = await db.query(
    `SELECT i.quantidade, i.preco, prod.nome as nomeProduto, prod.imagem
     FROM itens_pedido i LEFT JOIN produtos prod ON i.produtoId = prod.id
     WHERE i.pedidoId = ?`,
    [pedido.id]
  );
  res.json({
    protocolo: pedido.protocolo,
    status: pedido.status,
    tipoEntrega: pedido.tipoEntrega,
    clienteNome: pedido.clienteNome,
    total: pedido.total,
    createdAt: pedido.createdAt,
    updatedAt: pedido.updatedAt,
    observacao: pedido.observacao,
    clienteEndereco: pedido.clienteEndereco,
    empresa: {
      nome: pedido.empresaNome,
      whatsapp: pedido.empresaWhatsapp,
      logo: pedido.empresaLogo,
      slug: pedido.empresaSlug,
    },
    itens,
  });
};

module.exports = { criar, listarPorEmpresa, listarPorId, buscarPorId, atualizarStatus, relatorio, dashboardGlobal, rastrear };
