// src/components/layout/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Sun, LayoutDashboard, Building2, Users, Package,
  ShoppingBag, Tag, LogOut, Menu, X, User
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/categorias', label: 'Categorias', icon: Tag },
]

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-gray-900 flex-col">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-sol-400 to-terra-500 rounded-xl flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Usina do Sol</div>
              <div className="text-gray-400 text-xs">Painel Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sol-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sol-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
              {usuario?.nome?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-gray-400 text-xs">Administrador</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full py-1.5 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-sol-400" />
          <span className="text-white font-bold text-sm">Usina do Sol</span>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="text-gray-300">
          {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-30 bg-gray-900 pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-sol-500 text-white' : 'text-gray-300'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 text-red-400 text-sm w-full">
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:overflow-auto">
        <div className="md:hidden h-14" />
        <Outlet />
      </main>
    </div>
  )
}
