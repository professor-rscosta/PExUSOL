const bcrypt = require('bcryptjs');
const db = require('../db');

const listar = async (req, res) => {
  const [rows] = await db.query('SELECT u.id,u.nome,u.email,u.role,u.ativo,u.empresaId,e.nome as empresaNome FROM usuarios u LEFT JOIN empresas e ON u.empresaId=e.id ORDER BY u.nome');
  res.json(rows.map(r => ({...r, empresa: r.empresaId?{id:r.empresaId,nome:r.empresaNome}:null})));
};

const criar = async (req, res) => {
  const { nome, email, senha, role, empresaId } = req.body;
  if (!nome||!email||!senha) return res.status(400).json({ erro: 'Nome, email e senha obrigatórios' });
  const hash = await bcrypt.hash(senha, 10);
  const [r] = await db.query('INSERT INTO usuarios (nome,email,senha,role,empresaId) VALUES (?,?,?,?,?)', [nome, email.toLowerCase(), hash, role||'VENDEDOR', empresaId||null]);
  res.status(201).json({ id: r.insertId, nome, email, role: role||'VENDEDOR' });
};

const atualizar = async (req, res) => {
  const { nome, email, role, empresaId, ativo, senha } = req.body;
  const { id } = req.params;
  const [ex] = await db.query('SELECT * FROM usuarios WHERE id=?', [id]);
  if (!ex[0]) return res.status(404).json({ erro: 'Usuário não encontrado' });
  let q = 'UPDATE usuarios SET nome=?,email=?,role=?,empresaId=?,ativo=?';
  const params = [nome||ex[0].nome, email||ex[0].email, role||ex[0].role, empresaId!==undefined?empresaId:ex[0].empresaId, ativo!==undefined?(ativo?1:0):ex[0].ativo];
  if (senha) { q += ',senha=?'; params.push(await bcrypt.hash(senha, 10)); }
  q += ' WHERE id=?'; params.push(id);
  await db.query(q, params);
  res.json({ mensagem: 'Usuário atualizado' });
};

const excluir = async (req, res) => {
  await db.query('UPDATE usuarios SET ativo=0 WHERE id=?', [req.params.id]);
  res.json({ mensagem: 'Usuário desativado' });
};

module.exports = { listar, criar, atualizar, excluir };
