// src/components/layout/HeaderPublico.jsx
import { Link } from 'react-router-dom'
import { ShoppingCart, LogIn } from 'lucide-react'
import { useCarrinho } from '../../contexts/CarrinhoContext'
import { useAuth } from '../../contexts/AuthContext'

export default function HeaderPublico() {
  const { totalItens } = useCarrinho()
  const { usuario } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logos/usina_sol.jpeg"
            alt="Usina do Sol"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400 shadow"
          />
          <div>
            <div className="font-bold text-gray-800 leading-none text-base">Usina do Sol</div>
            <div className="text-xs text-gray-400 leading-none">UNEB · Velho Chico</div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/carrinho"
            className="relative flex items-center gap-2 bg-amber-50 hover:bg-amber-100 rounded-xl px-3 py-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-amber-700" />
            {totalItens > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItens}
              </span>
            )}
            <span className="hidden sm:block text-sm font-medium text-amber-700">
              {totalItens > 0 ? `${totalItens} iten${totalItens > 1 ? 's' : ''}` : 'Carrinho'}
            </span>
          </Link>

          {usuario ? (
            <Link
              to={usuario.role === 'ADMIN' ? '/admin' : '/vendedor'}
              className="btn-secondary text-sm py-2 px-4"
            >
              Painel
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
