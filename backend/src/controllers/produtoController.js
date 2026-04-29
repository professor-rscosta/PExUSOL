const db = require('../db');
const path = require('path');

const listarPorEmpresa = async (req, res) => {
  const { slug } = req.params;
  const { categoria, busca } = req.query;
  const [emp] = await db.query('SELECT id FROM empresas WHERE slug=? AND ativo=1', [slug]);
  if (!emp[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  let q = 'SELECT p.*, c.nome as categoriaNome FROM produtos p LEFT JOIN categorias c ON p.categoriaId=c.id WHERE p.empresaId=? AND p.ativo=1';
  const params = [emp[0].id];
  if (categoria) { q += ' AND p.categoriaId=?'; params.push(categoria); }
  if (busca) { q += ' AND p.nome LIKE ?'; params.push(`%${busca}%`); }
  q += ' ORDER BY p.nome';
  const [rows] = await db.query(q, params);
  const produtos = rows.map(r => ({...r, categoria: r.categoriaId ? {id:r.categoriaId,nome:r.categoriaNome} : null}));
  // Retorna objeto com produtos para compatibilidade com frontend
  res.json({ produtos, total: produtos.length });
};

const listarTodos = async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*, c.nome as cNome, e.nome as eNome, e.slug as eSlug
    FROM produtos p 
    LEFT JOIN categorias c ON p.categoriaId=c.id 
    LEFT JOIN empresas e ON p.empresaId=e.id 
    ORDER BY e.nome, p.nome`);
  res.json(rows.map(r => ({...r, categoria: r.categoriaId?{id:r.categoriaId,nome:r.cNome}:null, empresa:{id:r.empresaId,nome:r.eNome,slug:r.eSlug}})));
};

const listarVendedor = async (req, res) => {
  const { slug } = req.params;
  const [emp] = await db.query('SELECT id FROM empresas WHERE slug=?', [slug]);
  if (!emp[0]) return res.status(404).json({ erro: 'Empresa não encontrada' });
  const [rows] = await db.query('SELECT p.*, c.nome as cNome FROM produtos p LEFT JOIN categorias c ON p.categoriaId=c.id WHERE p.empresaId=? ORDER BY p.nome', [emp[0].id]);
  res.json(rows.map(r => ({...r, categoria: r.categoriaId?{id:r.categoriaId,nome:r.cNome}:null})));
};

const buscarPorId = async (req, res) => {
  const [rows] = await db.query('SELECT p.*, c.nome as cNome, e.nome as eNome, e.slug as eSlug, e.whatsapp FROM produtos p LEFT JOIN categorias c ON p.categoriaId=c.id LEFT JOIN empresas e ON p.empresaId=e.id WHERE p.id=?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ erro: 'Produto não encontrado' });
  const r = rows[0];
  res.json({...r, categoria: r.categoriaId?{id:r.categoriaId,nome:r.cNome}:null, empresa:{id:r.empresaId,nome:r.eNome,slug:r.eSlug,whatsapp:r.whatsapp}});
};

const criar = async (req, res) => {
  const { nome, descricao, preco, estoque, unidade, categoriaId, empresaId, ativo } = req.body;
  if (!nome||!preco||!empresaId) return res.status(400).json({ erro: 'Nome, preço e empresa obrigatórios' });
  const imagem = req.file ? req.file.filename : null;
  const [r] = await db.query(
    'INSERT INTO produtos (nome,descricao,preco,estoque,unidade,categoriaId,empresaId,ativo,imagem) VALUES (?,?,?,?,?,?,?,?,?)',
    [nome, descricao||null, preco, estoque||0, unidade||'un', categoriaId||null, empresaId, ativo===false||ativo==='false'?0:1, imagem]
  );
  const [rows] = await db.query('SELECT * FROM produtos WHERE id=?', [r.insertId]);
  res.status(201).json(rows[0]);
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const [ex] = await db.query('SELECT * FROM produtos WHERE id=?', [id]);
  if (!ex[0]) return res.status(404).json({ erro: 'Produto não encontrado' });
  const p = ex[0];
  const { nome, descricao, preco, estoque, unidade, categoriaId, ativo } = req.body;
  const imagem = req.file ? req.file.filename : p.imagem;
  await db.query(
    'UPDATE produtos SET nome=?,descricao=?,preco=?,estoque=?,unidade=?,categoriaId=?,ativo=?,imagem=? WHERE id=?',
    [nome||p.nome, descricao!==undefined?descricao:p.descricao, preco||p.preco, estoque!==undefined?estoque:p.estoque, unidade||p.unidade, categoriaId!==undefined?categoriaId:p.categoriaId, ativo!==undefined?(ativo===false||ativo==='false'?0:1):p.ativo, imagem, id]
  );
  const [rows] = await db.query('SELECT * FROM produtos WHERE id=?', [id]);
  res.json(rows[0]);
};

const excluir = async (req, res) => {
  await db.query('DELETE FROM produtos WHERE id=?', [req.params.id]);
  res.json({ mensagem: 'Produto excluído' });
};

const buscaGlobal = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const [rows] = await db.query('SELECT p.*, e.nome as eNome, e.slug FROM produtos p LEFT JOIN empresas e ON p.empresaId=e.id WHERE p.ativo=1 AND p.nome LIKE ? LIMIT 20', [`%${q}%`]);
  res.json(rows);
};

module.exports = { listarPorEmpresa, listarTodos, listarVendedor, buscarPorId, criar, atualizar, excluir, buscaGlobal };
