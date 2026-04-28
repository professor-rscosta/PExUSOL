// src/components/layout/VendedorLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Sun, LayoutDashboard, Package, ShoppingBag, BarChart2, LogOut, Menu, X, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/vendedor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vendedor/produtos', label: 'Produtos', icon: Package },
  { to: '/vendedor/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/vendedor/relatorio', label: 'Relatório', icon: BarChart2 },
]

export default function VendedorLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const lojaUrl = usuario?.empresa?.slug ? `/empresa/${usuario.empresa.slug}` : '/'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-sol-400 to-terra-500 rounded-xl flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-gray-800 font-bold text-sm">Usina do Sol</div>
              <div className="text-gray-400 text-xs">{usuario?.empresa?.nome || 'Vendedor'}</div>
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
                    ? 'bg-sol-50 text-sol-700 border border-sol-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}

          <a
            href={lojaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          >
            <ExternalLink className="w-5 h-5" />
            Ver minha loja
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-sol-100 rounded-xl flex items-center justify-center text-sol-700 text-sm font-bold">
              {usuario?.nome?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-gray-800 text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-gray-400 text-xs">Vendedor</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-sol-500" />
          <span className="text-gray-800 font-bold text-sm">Painel Vendedor</span>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="text-gray-600">
          {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-30 bg-white pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-sol-50 text-sol-700' : 'text-gray-600'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 text-red-400 text-sm w-full">
              <LogOut className="w-5 h-5" /> Sair
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 md:overflow-auto">
        <div className="md:hidden h-14" />
        <Outlet />
      </main>
    </div>
  )
}
