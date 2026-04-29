// src/pages/loja/PaginaProduto.jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useCarrinho } from '../../contexts/CarrinhoContext'
import { formatarMoeda } from '../../utils'
import HeaderPublico from '../../components/layout/HeaderPublico'

export default function PaginaProduto() {
  const { slug, id } = useParams()
  const { adicionar } = useCarrinho()
  const [qtd, setQtd] = useState(1)

  const { data: produto, isLoading } = useQuery({
    queryKey: ['produto', id],
    queryFn: async () => {
      const { data } = await api.get(`/produtos/${id}`)
      return data
    },
  })

  const handleAdicionar = () => {
    if (!produto) return
    const ok = adicionar({ ...produto, empresa: { slug } }, qtd)
    if (ok !== false) toast.success(`${qtd}x ${produto.nome} adicionado!`, { icon: '🛒' })
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPublico />
      <div className="page-container py-10 text-center text-gray-400">Carregando...</div>
    </div>
  )

  if (!produto) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPublico />
      <div className="page-container py-6 max-w-3xl">
        <Link to={`/empresa/${slug}`} className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar à loja
        </Link>

        <div className="card overflow-hidden">
          <div className="aspect-video bg-white flex items-center justify-center overflow-hidden">
            {produto.imagem ? (
              <img src={getImagemUrl(produto.imagem)} alt={produto.nome} className="w-full h-full object-contain" />
            ) : (
              <span className="text-6xl">{produto.categoria?.icone || '📦'}</span>
            )}
          </div>
          <div className="p-6">
            {produto.categoria && (
              <span className="badge bg-sol-100 text-sol-700 mb-3">
                {produto.categoria.icone} {produto.categoria.nome}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{produto.nome}</h1>
            {produto.descricao && (
              <p className="text-gray-500 mb-4">{produto.descricao}</p>
            )}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-sol-700">{formatarMoeda(produto.preco)}</span>
              <span className="text-gray-400">/{produto.unidade}</span>
            </div>

            {produto.estoque > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1.5">
                  <button onClick={() => setQtd(Math.max(1, qtd - 1))} className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold">{qtd}</span>
                  <button onClick={() => setQtd(Math.min(produto.estoque, qtd + 1))} className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleAdicionar} className="btn-primary flex-1">
                  <ShoppingCart className="w-5 h-5" />
                  Adicionar ao carrinho
                </button>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 rounded-xl p-3 text-center font-medium">
                Produto esgotado
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Estoque disponível: {produto.estoque} {produto.unidade}(s)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
