const db   = require('../db');
const path = require('path');
const fs   = require('fs');

const listar = async (req, res) => {
  const [rows] = await db.query(`
    SELECT e.*, 
      (SELECT COUNT(*) FROM produtos p WHERE p.empresaId=e.id) as totalProdutos,
      (SELECT COUNT(*) FROM pedidos pd WHERE pd.empresaId=e.id) as totalPedidos,
      (SELECT COUNT(*) FROM usuarios u WHERE u.empresaId=e.id) as totalUsuarios
    FROM empresas e WHERE e.ativo=1 ORDER BY e.nome`);
  res.json(rows);
};

const listarAdmin = async (req, res) => {
  const [rows] = await db.query(`
    SELECT e.*,
      (SELECT COUNT(*) FROM produtos p WHERE p.empresaId=e.id) as totalProdutos,
      (SELECT COUNT(*) FROM pedidos pd WHERE pd.empresaId=e.id) as totalPedidos
    FROM empresas e ORDER BY e.nome`);
  res.json(rows);
};

const buscarPorSlug = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM empresas WHERE slug=? AND ativo=1', [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  res.json(rows[0]);
};

const criar = async (req, res) => {
  const { nome, slug, descricao, whatsapp, site, endereco, cidade } = req.body;
  if (!nome||!slug||!whatsapp) return res.status(400).json({ erro: 'Nome, slug e WhatsApp obrigatórios' });
  const logo = req.file ? `uploads/produtos/${req.file.filename}` : null;
  const [r] = await db.query(
    'INSERT INTO empresas (nome,slug,descricao,whatsapp,site,logo,endereco,cidade) VALUES (?,?,?,?,?,?,?,?)',
    [nome, slug.toLowerCase().replace(/[^a-z0-9-]/g,'-'), descricao||null, whatsapp.replace(/\D/g,''), site||null, logo, endereco||null, cidade||null]
  );
  const [rows] = await db.query('SELECT * FROM empresas WHERE id=?', [r.insertId]);
  res.status(201).json(rows[0]);
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, whatsapp, site, endereco, cidade, ativo } = req.body;
  const [ex] = await db.query('SELECT * FROM empresas WHERE id=?', [id]);
  if (!ex[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  const logo = req.file ? `uploads/produtos/${req.file.filename}` : ex[0].logo;
  await db.query(
    'UPDATE empresas SET nome=?,descricao=?,whatsapp=?,site=?,logo=?,endereco=?,cidade=?,ativo=? WHERE id=?',
    [nome||ex[0].nome, descricao!==undefined?descricao:ex[0].descricao, whatsapp?whatsapp.replace(/\D/g,''):ex[0].whatsapp, site!==undefined?site:ex[0].site, logo, endereco!==undefined?endereco:ex[0].endereco, cidade!==undefined?cidade:ex[0].cidade, ativo!==undefined?(ativo==='false'||ativo===false?0:1):ex[0].ativo, id]
  );
  const [rows] = await db.query('SELECT * FROM empresas WHERE id=?', [id]);
  res.json(rows[0]);
};

const excluir = async (req, res) => {
  await db.query('UPDATE empresas SET ativo=0 WHERE id=?', [req.params.id]);
  res.json({ mensagem: 'Empresa desativada' });
};

const dashboard = async (req, res) => {
  const slug = req.params.slug || req.usuario?.empresa?.slug;
  const [emp] = await db.query('SELECT id FROM empresas WHERE slug=?', [slug]);
  if (!emp[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  const id = emp[0].id;
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const mes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const [[h]] = await db.query('SELECT COUNT(*) as c FROM pedidos WHERE empresaId=? AND criadoEm>=?', [id, hoje]);
  const [[m]] = await db.query('SELECT COUNT(*) as c, COALESCE(SUM(total),0) as r FROM pedidos WHERE empresaId=? AND criadoEm>=? AND status!="CANCELADO"', [id, mes]);
  const [[p]] = await db.query('SELECT COUNT(*) as c FROM produtos WHERE empresaId=? AND ativo=1', [id]);
  res.json({ pedidosHoje: h.c, pedidosMes: m.c, receitaMes: m.r, produtosAtivos: p.c });
};

module.exports = { listar, listarAdmin, buscarPorSlug, criar, atualizar, excluir, dashboard };
