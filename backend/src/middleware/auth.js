const jwt = require('jsonwebtoken');
const db  = require('../db');

const autenticar = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ erro: 'Token não fornecido' });
  const token = auth.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [rows] = await db.query('SELECT u.*, e.slug as empresaSlug, e.nome as empresaNome, e.logo as empresaLogo, e.whatsapp as empresaWhatsapp FROM usuarios u LEFT JOIN empresas e ON u.empresaId=e.id WHERE u.id=? AND u.ativo=1', [decoded.id]);
  if (!rows[0]) return res.status(401).json({ erro: 'Usuário não encontrado' });
  const u = rows[0];
  req.usuario = { ...u, empresa: u.empresaId ? { id:u.empresaId, slug:u.empresaSlug, nome:u.empresaNome, logo:u.empresaLogo, whatsapp:u.empresaWhatsapp } : null };
  next();
};

const apenasAdmin = (req, res, next) => {
  if (req.usuario?.role !== 'ADMIN') return res.status(403).json({ erro: 'Acesso restrito' });
  next();
};

const adminOuVendedor = (req, res, next) => {
  if (!['ADMIN','VENDEDOR'].includes(req.usuario?.role)) return res.status(403).json({ erro: 'Acesso negado' });
  next();
};

module.exports = { autenticar, apenasAdmin, adminOuVendedor };
