// src/components/layout/HeaderPublico.jsx
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, ShoppingBag, Info, Lock, LayoutDashboard } from 'lucide-react'
import { useCarrinho } from '../../contexts/CarrinhoContext'
import { useAuth } from '../../contexts/AuthContext'

export default function HeaderPublico() {
  const { totalItens } = useCarrinho()
  const { usuario } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const anchor = (hash) => isHome ? hash : `/${hash}`

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ──────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logos/usina_sol.jpeg" alt="Usina do Sol"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400 shadow"/>
          <div className="hidden sm:block">
            <div className="font-bold text-gray-800 leading-none text-base">Usina do Sol</div>
            <div className="text-xs text-gray-400 leading-none">UNEB · Velho Chico</div>
          </div>
        </Link>

        {/* ── Nav central ───────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          <a href={anchor('#associacoes')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
            <ShoppingBag className="w-4 h-4"/> Associações
          </a>
          <a href={anchor('#como-comprar')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-lg transition-colors">
            🛒 Como Comprar
          </a>
          <a href={anchor('#sobre')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
            <Info className="w-4 h-4"/> Sobre o Projeto
          </a>
        </nav>

        {/* ── Ações direita ─────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Carrinho */}
          <Link to="/carrinho"
            className="relative flex items-center gap-2 bg-amber-50 hover:bg-amber-100 rounded-xl px-3 py-2 transition-colors">
            <ShoppingCart className="w-5 h-5 text-amber-700"/>
            {totalItens > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItens}
              </span>
            )}
            <span className="hidden sm:block text-sm font-medium text-amber-700">
              {totalItens > 0 ? `${totalItens} iten${totalItens > 1 ? 's' : ''}` : 'Carrinho'}
            </span>
          </Link>

          {/* Área Reservada — sempre visível no canto superior direito */}
          {usuario ? (
            <Link
              to={usuario.role === 'ADMIN' ? '/admin' : '/vendedor'}
              className="flex items-center gap-2 bg-[#1a2f7a] hover:bg-[#0f1f5c] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              <LayoutDashboard className="w-4 h-4"/>
              <span className="hidden sm:block">Painel</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-[#1a2f7a] hover:bg-[#0f1f5c] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              <Lock className="w-4 h-4"/>
              <span className="hidden sm:block">Área Reservada</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Menu mobile ───────────────────────────────────── */}
      <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2 flex gap-4 overflow-x-auto text-xs">
        <a href={anchor('#associacoes')} className="flex items-center gap-1 text-gray-600 whitespace-nowrap">🏘️ Associações</a>
        <a href={anchor('#como-comprar')} className="flex items-center gap-1 text-gray-600 whitespace-nowrap">🛒 Como Comprar</a>
        <a href={anchor('#sobre')} className="flex items-center gap-1 text-gray-600 whitespace-nowrap">ℹ️ Sobre</a>
        {!usuario && (
          <Link to="/login" className="flex items-center gap-1 text-[#1a2f7a] font-semibold whitespace-nowrap ml-auto">
            <Lock className="w-3 h-3"/> Área Reservada
          </Link>
        )}
      </div>
    </header>
  )
}
