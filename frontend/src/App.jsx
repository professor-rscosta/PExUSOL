// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CarrinhoProvider } from './contexts/CarrinhoContext'

// Páginas públicas
import Home from './pages/Home'
import LojaEmpresa from './pages/loja/LojaEmpresa'
import PaginaProduto from './pages/loja/PaginaProduto'
import Carrinho from './pages/loja/Carrinho'
import CheckoutSucesso from './pages/loja/CheckoutSucesso'

// Auth
import Login from './pages/Login'

// Admin
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminEmpresas from './pages/admin/Empresas'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminProdutos from './pages/admin/Produtos'
import AdminPedidos from './pages/admin/Pedidos'
import AdminCategorias from './pages/admin/Categorias'

// Vendedor
import VendedorLayout from './components/layout/VendedorLayout'
import VendedorDashboard from './pages/vendedor/Dashboard'
import VendedorProdutos from './pages/vendedor/Produtos'
import VendedorPedidos from './pages/vendedor/Pedidos'
import VendedorRelatorio from './pages/vendedor/Relatorio'

// Rota protegida
function RotaProtegida({ children, roles }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontFamily: 'Inter', fontSize: '14px' },
            }}
          />
          <Routes>
            {/* PÚBLICO */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/empresa/:slug" element={<LojaEmpresa />} />
            <Route path="/empresa/:slug/produto/:id" element={<PaginaProduto />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/pedido/sucesso" element={<CheckoutSucesso />} />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <RotaProtegida roles={['ADMIN']}>
                  <AdminLayout />
                </RotaProtegida>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="empresas" element={<AdminEmpresas />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="produtos" element={<AdminProdutos />} />
              <Route path="pedidos" element={<AdminPedidos />} />
              <Route path="categorias" element={<AdminCategorias />} />
            </Route>

            {/* VENDEDOR */}
            <Route
              path="/vendedor"
              element={
                <RotaProtegida roles={['VENDEDOR']}>
                  <VendedorLayout />
                </RotaProtegida>
              }
            >
              <Route index element={<VendedorDashboard />} />
              <Route path="produtos" element={<VendedorProdutos />} />
              <Route path="pedidos" element={<VendedorPedidos />} />
              <Route path="relatorio" element={<VendedorRelatorio />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CarrinhoProvider>
    </AuthProvider>
  )
}
