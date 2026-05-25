// src/components/layout/VendedorLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, BarChart2, LogOut, Menu, X, ExternalLink, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getImagemUrl } from '../../utils'

const navItems = [
  { to: '/vendedor',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/vendedor/produtos',  label: 'Produtos',   icon: Package },
  { to: '/vendedor/pedidos',   label: 'Pedidos',    icon: ShoppingBag },
  { to: '/vendedor/relatorio', label: 'Relatório',  icon: BarChart2 },
  { to: '/vendedor/perfil',    label: 'Meu Perfil', icon: User },
]

export default function VendedorLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const lojaUrl = usuario?.empresa?.slug ? `/empresa/${usuario.empresa.slug}` : '/'
  const logoEmpresa = usuario?.empresa?.logo

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4ff' }}>

      {/* ── Sidebar Desktop ──────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col shadow-xl"
        style={{ background: 'linear-gradient(180deg, #0f1f5c 0%, #1a2f7a 60%, #1e40af 100%)' }}>

        {/* Logo / Empresa */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            {logoEmpresa ? (
              <img src={getImagemUrl(logoEmpresa)}
                alt={usuario?.empresa?.nome}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-yellow-400/60 bg-white p-0.5"/>
            ) : (
              <img src="/logos/usina_sol.jpeg" alt="Usina do Sol"
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-yellow-400/60"/>
            )}
            <div className="min-w-0">
              <div className="text-white font-bold text-sm truncate">
                {usuario?.empresa?.nome?.split('–')[0].trim().split(' ').slice(0,3).join(' ') || 'Vendedor'}
              </div>
              <div className="text-blue-300 text-xs">Painel do Vendedor</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-[#0f1f5c] shadow-md'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`
              }>
              <Icon className="w-5 h-5 flex-shrink-0"/>
              {label}
            </NavLink>
          ))}

          <a href={lojaUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-all mt-1">
            <ExternalLink className="w-5 h-5"/>
            Ver minha loja
          </a>
        </nav>

        {/* Usuário + Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center text-yellow-300 font-bold text-sm border border-yellow-400/30">
              {usuario?.nome?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-blue-300 text-xs">Vendedor</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-blue-300 hover:text-red-400 text-sm transition-colors w-full hover:bg-white/5 px-2 py-1.5 rounded-lg">
            <LogOut className="w-4 h-4"/>
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ─────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 h-14 flex items-center justify-between shadow-md"
        style={{ background: '#0f1f5c' }}>
        <div className="flex items-center gap-2.5">
          {logoEmpresa ? (
            <img src={getImagemUrl(logoEmpresa)}
              alt="" className="w-8 h-8 rounded-lg object-cover bg-white p-0.5"/>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-[#0f1f5c] font-black text-sm">
              {usuario?.empresa?.nome?.[0] || 'U'}
            </div>
          )}
          <span className="text-white font-bold text-sm">
            {usuario?.empresa?.nome?.split(' ').slice(0,2).join(' ') || 'Vendedor'}
          </span>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="text-white p-1">
          {menuAberto ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-30 pt-14"
          style={{ background: 'linear-gradient(180deg, #0f1f5c 0%, #1e40af 100%)' }}>
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-yellow-400 text-[#0f1f5c]' : 'text-blue-200'
                  }`
                }>
                <Icon className="w-5 h-5"/>{label}
              </NavLink>
            ))}
            <a href={lojaUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-blue-200 text-sm rounded-xl">
              <ExternalLink className="w-5 h-5"/> Ver loja
            </a>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-400 text-sm w-full rounded-xl">
              <LogOut className="w-5 h-5"/> Sair
            </button>
          </nav>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden h-14"/>
        <div className="p-6">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}
