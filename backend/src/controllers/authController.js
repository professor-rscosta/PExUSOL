const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');

const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

  const [rows] = await db.query(
    'SELECT u.*, e.slug as empresaSlug, e.nome as empresaNome, e.logo as empresaLogo, e.whatsapp as empresaWhatsapp FROM usuarios u LEFT JOIN empresas e ON u.empresaId = e.id WHERE u.email = ? AND u.ativo = 1',
    [email.toLowerCase().trim()]
  );
  const usuario = rows[0];
  if (!usuario) return res.status(401).json({ erro: 'Email ou senha inválidos' });

  const valida = await bcrypt.compare(senha, usuario.senha);
  if (!valida) return res.status(401).json({ erro: 'Email ou senha inválidos' });

  const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

  const { senha: _, ...sem } = usuario;
  const u = {
    ...sem,
    empresa: usuario.empresaId ? { id: usuario.empresaId, slug: usuario.empresaSlug, nome: usuario.empresaNome, logo: usuario.empresaLogo, whatsapp: usuario.empresaWhatsapp } : null
  };
  res.json({ token, usuario: u });
};

const perfil = async (req, res) => {
  const [rows] = await db.query(
    'SELECT u.*, e.slug as empresaSlug, e.nome as empresaNome, e.logo as empresaLogo FROM usuarios u LEFT JOIN empresas e ON u.empresaId = e.id WHERE u.id = ?',
    [req.usuario.id]
  );
  const u = rows[0];
  if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const { senha: _, ...sem } = u;
  res.json({ ...sem, empresa: u.empresaId ? { id: u.empresaId, slug: u.empresaSlug, nome: u.empresaNome, logo: u.empresaLogo } : null });
};

const atualizarPerfil = async (req, res) => {
  const { nome, cpf, telefone, endereco } = req.body;
  const id = req.usuario.id;
  if (!nome?.trim()) return res.status(400).json({ erro: 'Nome obrigatório' });
  await db.query('UPDATE usuarios SET nome=?, cpf=?, telefone=? WHERE id=?', [nome.trim(), cpf||null, telefone||null, id]);
  if (endereco?.logradouro) {
    const [ex] = await db.query('SELECT id FROM enderecos WHERE usuarioId=?', [id]);
    if (ex[0]) {
      await db.query('UPDATE enderecos SET logradouro=?,numero=?,complemento=?,bairro=?,cep=?,cidade=?,estado=? WHERE usuarioId=?',
        [endereco.logradouro,endereco.numero||'S/N',endereco.complemento||null,endereco.bairro,endereco.cep,endereco.cidade,endereco.estado,id]);
    } else {
      await db.query('INSERT INTO enderecos (usuarioId,logradouro,numero,complemento,bairro,cep,cidade,estado) VALUES (?,?,?,?,?,?,?,?)',
        [id,endereco.logradouro,endereco.numero||'S/N',endereco.complemento||null,endereco.bairro,endereco.cep,endereco.cidade,endereco.estado]);
    }
  }
  res.json({ mensagem: 'Perfil atualizado!' });
};

const alterarSenha = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: 'Preencha todos os campos' });
  if (novaSenha.length < 6) return res.status(400).json({ erro: 'Mínimo 6 caracteres' });
  const [rows] = await db.query('SELECT senha FROM usuarios WHERE id=?', [req.usuario.id]);
  const valida = await bcrypt.compare(senhaAtual, rows[0].senha);
  if (!valida) return res.status(400).json({ erro: 'Senha atual incorreta' });
  const hash = await bcrypt.hash(novaSenha, 10);
  await db.query('UPDATE usuarios SET senha=? WHERE id=?', [hash, req.usuario.id]);
  res.json({ mensagem: 'Senha alterada!' });
};

module.exports = { login, perfil, atualizarPerfil, alterarSenha };
