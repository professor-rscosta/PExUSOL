const db = require('../db');

const listar = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categorias ORDER BY nome');
  // Conta produtos por categoria
  for (const cat of rows) {
    const [[r]] = await db.query('SELECT COUNT(*) as c FROM produtos WHERE categoriaId=? AND ativo=1', [cat.id]);
    cat._count = { produtos: r.c };
  }
  res.json(rows);
};

const criar = async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
  const [r] = await db.query('INSERT INTO categorias (nome,descricao) VALUES (?,?)', [nome, descricao||null]);
  res.status(201).json({ id: r.insertId, nome, descricao, _count: { produtos: 0 } });
};

const atualizar = async (req, res) => {
  const { nome, descricao } = req.body;
  await db.query('UPDATE categorias SET nome=?,descricao=? WHERE id=?', [nome, descricao||null, req.params.id]);
  res.json({ mensagem: 'Categoria atualizada' });
};

const excluir = async (req, res) => {
  await db.query('DELETE FROM categorias WHERE id=?', [req.params.id]);
  res.json({ mensagem: 'Categoria excluída' });
};

module.exports = { listar, criar, atualizar, excluir };
