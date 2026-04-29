// src/pages/loja/LojaEmpresa.jsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Search, MapPin, Phone, ArrowLeft, Plus, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useCarrinho } from '../../contexts/CarrinhoContext'
import { formatarMoeda, getImagemUrl } from '../../utils'
import HeaderPublico from '../../components/layout/HeaderPublico'

export default function LojaEmpresa() {
  const { slug } = useParams()
  const { adicionar, itens } = useCarrinho()
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState(null)

  const { data: empresa } = useQuery({
    queryKey: ['empresa', slug],
    queryFn: async () => {
      const { data } = await api.get(`/empresas/${slug}`)
      return data
    },
  })

  const { data: dadosProdutos, isLoading } = useQuery({
    queryKey: ['produtos-loja', slug, categoriaAtiva, busca],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (categoriaAtiva) params.set('categoria', categoriaAtiva)
      if (busca) params.set('busca', busca)
      const { data } = await api.get(`/empresa/${slug}/produtos?${params}`)
      return data
    },
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data } = await api.get('/categorias')
      return data
    },
  })

  const produtos = dadosProdutos?.produtos || []

  const handleAdicionar = (produto) => {
    const ok = adicionar({ ...produto, empresa: { slug } })
    if (ok !== false) toast.success(`${produto.nome} adicionado!`, { icon: '🛒' })
  }

  const noCarrinho = (id) => itens.some((i) => i.id === id)

  if (!empresa && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold text-gray-700">Loja não encontrada</h2>
          <Link to="/" className="text-sol-600 mt-2 inline-block hover:underline">Voltar ao início</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPublico />

      {/* BANNER DA LOJA */}
      {empresa && (
        <div className="bg-gradient-to-r from-sol-500 to-terra-500 text-white">
          <div className="page-container py-8">
            <Link to="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Todas as lojas
            </Link>
            <div className="flex items-start gap-4">
              {empresa.logo ? (
                <img src={getImagemUrl(empresa.logo)} alt={empresa.nome} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                  🏪
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{empresa.nome}</h1>
                {empresa.cidade && (
                  <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {empresa.cidade}
                  </div>
                )}
                <p className="text-white/80 text-sm mt-1 max-w-xl">{empresa.descricao}</p>
              </div>
            </div>

            {empresa.whatsapp && (
              <a
                href={`https://wa.me/${empresa.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold mt-4 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Falar no WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      <div className="page-container py-6">
        {/* Busca + Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            onClick={() => setCategoriaAtiva(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              !categoriaAtiva ? 'bg-sol-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id === categoriaAtiva ? null : cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                categoriaAtiva === cat.id ? 'bg-sol-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat.icone} {cat.nome}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUTOS */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">📦</span>
            <p className="text-gray-500 mt-3">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onAdicionar={() => handleAdicionar(produto)}
                noCarrinho={noCarrinho(produto.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProdutoCard({ produto, onAdicionar, noCarrinho }) {
  return (
    <div className="card group animate-fadeIn">
      <Link to={`/empresa/${slug}/produto/${produto.id}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {produto.imagem ? (
            <img
              src={getImagemUrl(produto.imagem)}
              alt={produto.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {produto.categoria?.icone || '📦'}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        {produto.categoria && (
          <span className="badge bg-sol-100 text-sol-700 text-xs mb-1">
            {produto.categoria.icone} {produto.categoria.nome}
          </span>
        )}
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
          {produto.nome}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-sol-700 font-bold text-base">{formatarMoeda(produto.preco)}</span>
            <span className="text-xs text-gray-400 ml-1">/{produto.unidade}</span>
          </div>
          {produto.estoque > 0 ? (
            <button
              onClick={onAdicionar}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                noCarrinho
                  ? 'bg-verde-100 text-verde-600'
                  : 'bg-sol-500 hover:bg-sol-600 text-white'
              }`}
            >
              {noCarrinho ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          ) : (
            <span className="text-xs text-red-400 font-medium">Esgotado</span>
          )}
        </div>
      </div>
    </div>
  )
}
