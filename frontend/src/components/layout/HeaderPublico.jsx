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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logos/usina_sol.jpeg" alt="Usina do Sol"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400"/>
          <div>
            <div className="font-bold text-gray-800 text-sm leading-none">Usina do Sol</div>
            <div className="text-xs text-gray-400 leading-none">UNEB · Velho Chico</div>
          </div>
        </Link>

        {/* NAV - desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <a href={anchor('#associacoes')} className="text-sm font-medium text-gray-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4"/> Associações
          </a>
          <a href={anchor('#como-comprar')} className="text-sm font-medium text-gray-600 hover:text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors">
            🛒 Como Comprar
          </a>
          <a href={anchor('#sobre')} className="text-sm font-medium text-gray-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1.5">
            <Info className="w-4 h-4"/> Sobre
          </a>
        </nav>

        {/* BOTÕES DIREITA */}
        <div className="flex items-center gap-2">

          {/* Carrinho */}
          <Link to="/carrinho" className="relative flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium text-sm px-3 py-2 rounded-xl transition-colors">
            <ShoppingCart className="w-5 h-5"/>
            <span className="hidden sm:inline">Carrinho</span>
            {totalItens > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItens}
              </span>
            )}
          </Link>

          {/* ÁREA RESERVADA - sempre visível */}
          {usuario ? (
            <Link
              to={usuario.role === 'ADMIN' ? '/admin' : '/vendedor'}
              className="flex items-center gap-2 bg-[#1a2f7a] hover:bg-[#0f1f5c] text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow"
            >
              <LayoutDashboard className="w-4 h-4"/>
              Painel
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-[#1a2f7a] hover:bg-[#0f1f5c] text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow"
            >
              <Lock className="w-4 h-4"/>
              Área Reservada
            </Link>
          )}
        </div>
      </div>

      {/* NAV mobile */}
      <div className="md:hidden flex gap-3 px-4 pb-2 overflow-x-auto text-xs border-t border-gray-100 pt-2">
        <a href={anchor('#associacoes')} className="text-gray-600 whitespace-nowrap">🏘️ Associações</a>
        <a href={anchor('#como-comprar')} className="text-gray-600 whitespace-nowrap">🛒 Como Comprar</a>
        <a href={anchor('#sobre')} className="text-gray-600 whitespace-nowrap">ℹ️ Sobre</a>
        <Link to="/login" className="text-[#1a2f7a] font-bold whitespace-nowrap ml-auto flex items-center gap-1">
          <Lock className="w-3 h-3"/> Área Reservada
        </Link>
      </div>
    </header>
  )
}
