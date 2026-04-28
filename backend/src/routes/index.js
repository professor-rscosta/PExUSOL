// routes/index.js — Todas as rotas da API
const express = require('express');
const router = express.Router();

const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authCtrl = require('../controllers/authController');
const empresaCtrl = require('../controllers/empresaController');
const produtoCtrl = require('../controllers/produtoController');
const pedidoCtrl = require('../controllers/pedidoController');
const usuarioCtrl = require('../controllers/usuarioController');
const categoriaCtrl = require('../controllers/categoriaController');

// ═══════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════
router.post('/auth/login', authCtrl.login);
router.get('/auth/perfil', autenticar, authCtrl.perfil);
router.put('/auth/senha', autenticar, authCtrl.alterarSenha);

// ═══════════════════════════════════════════════════════
// EMPRESAS (PÚBLICO)
// ═══════════════════════════════════════════════════════
router.get('/empresas', empresaCtrl.listar);
router.get('/empresas/:slug', empresaCtrl.buscarPorSlug);

// EMPRESAS (PROTEGIDO)
router.get('/admin/empresas', autenticar, apenasAdmin, empresaCtrl.listarAdmin);
router.post('/admin/empresas', autenticar, apenasAdmin, empresaCtrl.criar);
router.put('/admin/empresas/:id', autenticar, upload.single('logo'), empresaCtrl.atualizar);
router.delete('/admin/empresas/:id', autenticar, apenasAdmin, empresaCtrl.excluir);

// Dashboard por empresa (vendedor/admin)
router.get('/dashboard', autenticar, empresaCtrl.dashboard);
router.get('/empresas/:slug/dashboard', autenticar, empresaCtrl.dashboard);
router.get('/admin/dashboard', autenticar, apenasAdmin, pedidoCtrl.dashboardGlobal);

// ═══════════════════════════════════════════════════════
// CATEGORIAS
// ═══════════════════════════════════════════════════════
router.get('/categorias', categoriaCtrl.listar);
router.post('/admin/categorias', autenticar, apenasAdmin, categoriaCtrl.criar);
router.put('/admin/categorias/:id', autenticar, apenasAdmin, categoriaCtrl.atualizar);
router.delete('/admin/categorias/:id', autenticar, apenasAdmin, categoriaCtrl.excluir);

// ═══════════════════════════════════════════════════════
// PRODUTOS (PÚBLICO)
// ═══════════════════════════════════════════════════════
router.get('/produtos/busca', produtoCtrl.buscaGlobal);
router.get('/empresa/:slug/produtos', produtoCtrl.listarPorEmpresa);
router.get('/produtos/:id', produtoCtrl.buscarPorId);

// PRODUTOS (PROTEGIDO)
router.get('/vendedor/produtos', autenticar, produtoCtrl.listarVendedor);
router.get('/admin/produtos', autenticar, apenasAdmin, produtoCtrl.listarTodos);
router.post('/produtos', autenticar, upload.single('imagem'), produtoCtrl.criar);
router.put('/produtos/:id', autenticar, upload.single('imagem'), produtoCtrl.atualizar);
router.delete('/produtos/:id', autenticar, produtoCtrl.excluir);

// ═══════════════════════════════════════════════════════
// PEDIDOS
// ═══════════════════════════════════════════════════════
// Público — cliente cria pedido
router.post('/empresa/:slug/pedidos', pedidoCtrl.criar);

// Slug-based (vendedor acessa pela URL com slug)
router.get('/empresa/:slug/pedidos', autenticar, pedidoCtrl.listarPorEmpresa);
router.get('/empresa/:slug/produtos/vendedor', autenticar, produtoCtrl.listarVendedor);
router.get('/empresa/:slug/relatorio', autenticar, pedidoCtrl.relatorio);

// Protegido — vendedor/admin
router.get('/vendedor/pedidos', autenticar, (req, res, next) => {
  req.params.empresaId = req.usuario.empresaId;
  next();
}, pedidoCtrl.listarPorEmpresa);

router.get('/admin/pedidos/:empresaId', autenticar, apenasAdmin, pedidoCtrl.listarPorEmpresa);
router.get('/pedidos/:id', autenticar, pedidoCtrl.buscarPorId);
router.put('/pedidos/:id/status', autenticar, pedidoCtrl.atualizarStatus);
router.patch('/pedidos/:id/status', autenticar, pedidoCtrl.atualizarStatus);

// Relatórios
router.get('/vendedor/relatorio', autenticar, (req, res, next) => {
  req.params.empresaId = req.usuario.empresaId;
  next();
}, pedidoCtrl.relatorio);

router.get('/admin/relatorio/:empresaId?', autenticar, apenasAdmin, pedidoCtrl.relatorio);

// ═══════════════════════════════════════════════════════
// USUÁRIOS (ADMIN)
// ═══════════════════════════════════════════════════════
router.get('/admin/usuarios', autenticar, apenasAdmin, usuarioCtrl.listar);
router.post('/admin/usuarios', autenticar, apenasAdmin, usuarioCtrl.criar);
router.put('/admin/usuarios/:id', autenticar, apenasAdmin, usuarioCtrl.atualizar);
router.delete('/admin/usuarios/:id', autenticar, apenasAdmin, usuarioCtrl.excluir);

module.exports = router;
