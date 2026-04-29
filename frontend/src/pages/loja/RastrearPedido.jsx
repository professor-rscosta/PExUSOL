import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Package, CheckCircle, Clock, Truck, XCircle, AlertCircle, Home, MessageCircle, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import { formatarMoeda, formatarData, getImagemUrl } from '../../utils'

const ETAPAS = [
  { status: 'PENDENTE',    label: 'Pedido Recebido',  icon: Clock,        cor: 'yellow' },
  { status: 'CONFIRMADO',  label: 'Confirmado',        icon: CheckCircle,  cor: 'blue'   },
  { status: 'PREPARANDO',  label: 'Em Preparo',        icon: Package,      cor: 'orange' },
  { status: 'ENVIADO',     label: 'Pronto / Enviado',  icon: Truck,        cor: 'purple' },
  { status: 'ENTREGUE',    label: 'Entregue',          icon: CheckCircle,  cor: 'green'  },
]

const COR = {
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-400', line: 'bg-yellow-400' },
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-700',   ring: 'ring-blue-400',   line: 'bg-blue-400'   },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-400', line: 'bg-orange-400' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-400', line: 'bg-purple-400' },
  green:  { bg: 'bg-green-100',  text: 'text-green-700',  ring: 'ring-green-400',  line: 'bg-green-400'  },
  red:    { bg: 'bg-red-100',    text: 'text-red-700',    ring: 'ring-red-400',    line: 'bg-red-400'    },
}

export default function RastrearPedido() {
  const [params] = useSearchParams()
  const [protocolo, setProtocolo] = useState(params.get('p') || '')
  const [buscar, setBuscar] = useState(!!params.get('p'))

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rastrear', protocolo],
    queryFn: async () => (await api.get(`/rastrear/${protocolo}`)).data,
    enabled: buscar && !!protocolo,
    retry: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (protocolo.trim()) { setBuscar(true); refetch() }
  }

  const idxAtual = data?.status === 'CANCELADO'
    ? -1
    : ETAPAS.findIndex(e => e.status === data?.status)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
          <Home className="w-4 h-4" />
          <span>Usina do Sol</span>
        </Link>
        <span className="text-white/40 text-xs">Rastreamento de Pedido</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Título */}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-white/20">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Rastrear Pedido</h1>
          <p className="text-blue-200 text-sm">Digite o protocolo para acompanhar seu pedido</p>
        </div>

        {/* Busca */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3
                         text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40
                         text-sm font-mono tracking-wide uppercase"
              placeholder="Ex: PED-2026-0001"
              value={protocolo}
              onChange={e => { setProtocolo(e.target.value.toUpperCase()); setBuscar(false) }}
            />
            <button type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold px-5 py-3
                         rounded-xl transition-all flex items-center gap-2 text-sm whitespace-nowrap">
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/60 text-sm">Buscando pedido...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="text-red-200 font-medium">Pedido não encontrado</p>
            <p className="text-red-300/70 text-sm mt-1">Verifique o protocolo e tente novamente</p>
          </div>
        )}

        {/* Resultado */}
        {data && !isLoading && (
          <div className="space-y-4">

            {/* Card principal */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl overflow-hidden">
              {/* Cabeçalho do card */}
              <div className="bg-white/10 px-5 py-4 flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-0.5">Protocolo</p>
                  <p className="text-white font-mono font-bold text-lg tracking-wide">{data.protocolo}</p>
                </div>
                <StatusBadge status={data.status} />
              </div>

              {/* Info empresa */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                {data.empresa?.logo && (
                  <img src={getImagemUrl(data.empresa.logo)} alt={data.empresa.nome}
                    className="w-10 h-10 rounded-xl object-contain bg-white p-1" />
                )}
                <div>
                  <p className="text-white/50 text-xs">Associação</p>
                  <p className="text-white font-medium text-sm">{data.empresa?.nome}</p>
                </div>
              </div>

              {/* Info cliente */}
              <div className="px-5 py-4 border-b border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Cliente</p>
                  <p className="text-white text-sm font-medium">{data.clienteNome}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Data do Pedido</p>
                  <p className="text-white text-sm">{formatarData(data.createdAt)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Entrega</p>
                  <p className="text-white text-sm">{data.tipoEntrega === 'ENTREGA' ? '🏠 Entrega' : '🏪 Retirada'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Total</p>
                  <p className="text-yellow-300 font-bold text-sm">{formatarMoeda(data.total)}</p>
                </div>
              </div>

              {/* Itens */}
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-white/40 text-xs mb-3">Itens do Pedido</p>
                <div className="space-y-2">
                  {data.itens?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-xs text-white/60">
                          {item.quantidade}x
                        </div>
                        <span className="text-white/80 text-sm">{item.nomeProduto}</span>
                      </div>
                      <span className="text-white/60 text-sm">{formatarMoeda(item.preco * item.quantidade)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endereço */}
              {data.tipoEntrega === 'ENTREGA' && data.clienteEndereco && (
                <div className="px-5 py-4 border-b border-white/10">
                  <p className="text-white/40 text-xs mb-1">Endereço de Entrega</p>
                  <p className="text-white/80 text-sm">{data.clienteEndereco}</p>
                </div>
              )}

              {/* Observação */}
              {data.observacao && (
                <div className="px-5 py-4 border-b border-white/10">
                  <p className="text-white/40 text-xs mb-1">Observação</p>
                  <p className="text-white/80 text-sm italic">"{data.observacao}"</p>
                </div>
              )}

              {/* Contato WhatsApp */}
              {data.empresa?.whatsapp && data.status !== 'ENTREGUE' && data.status !== 'CANCELADO' && (
                <div className="px-5 py-4">
                  <a
                    href={`https://wa.me/55${data.empresa.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Olá! Quero consultar o status do meu pedido ' + data.protocolo)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400
                               text-white font-semibold py-3 rounded-xl transition-all text-sm">
                    <MessageCircle className="w-4 h-4" />
                    Falar com a Associação
                  </a>
                </div>
              )}
            </div>

            {/* Timeline de status */}
            {data.status !== 'CANCELADO' ? (
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                <p className="text-white/50 text-xs mb-4">Acompanhamento do Pedido</p>
                <div className="space-y-1">
                  {ETAPAS.map((etapa, idx) => {
                    const ativo  = idx === idxAtual
                    const feito  = idx < idxAtual
                    const futuro = idx > idxAtual
                    const cor    = feito || ativo ? COR[etapa.cor] : null
                    const Icon   = etapa.icon
                    return (
                      <div key={etapa.status} className="flex items-start gap-3">
                        {/* Ícone */}
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 transition-all
                            ${ativo  ? `${COR[etapa.cor].bg} ${COR[etapa.cor].ring} ring-offset-2 ring-offset-transparent shadow-lg` : ''}
                            ${feito  ? `${COR[etapa.cor].bg} ring-${etapa.cor}-200` : ''}
                            ${futuro ? 'bg-white/5 ring-white/10' : ''}
                          `}>
                            <Icon className={`w-4 h-4 ${ativo || feito ? COR[etapa.cor].text : 'text-white/20'}`} />
                          </div>
                          {idx < ETAPAS.length - 1 && (
                            <div className={`w-0.5 h-6 mt-1 rounded-full ${feito ? COR[etapa.cor].line : 'bg-white/10'}`} />
                          )}
                        </div>
                        {/* Label */}
                        <div className="pt-1.5">
                          <p className={`text-sm font-medium ${ativo ? 'text-white' : feito ? 'text-white/70' : 'text-white/25'}`}>
                            {etapa.label}
                          </p>
                          {ativo && (
                            <p className={`text-xs mt-0.5 ${COR[etapa.cor].text}`}>
                              Status atual · Última atualização: {formatarData(data.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-6 text-center">
                <XCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
                <p className="text-red-200 font-bold text-lg">Pedido Cancelado</p>
                <p className="text-red-300/70 text-sm mt-1">Este pedido foi cancelado. Entre em contato com a associação.</p>
              </div>
            )}

            {/* Nova busca */}
            <button onClick={() => { setProtocolo(''); setBuscar(false) }}
              className="w-full text-white/40 hover:text-white/70 text-sm py-2 transition-colors flex items-center justify-center gap-1">
              <Search className="w-3 h-3" />
              Buscar outro pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const mapa = {
    PENDENTE:    { label: 'Pendente',       cls: 'bg-yellow-400/20 text-yellow-300 ring-yellow-400/30' },
    CONFIRMADO:  { label: 'Confirmado',     cls: 'bg-blue-400/20   text-blue-300   ring-blue-400/30'   },
    PREPARANDO:  { label: 'Em Preparo',     cls: 'bg-orange-400/20 text-orange-300 ring-orange-400/30' },
    ENVIADO:     { label: 'Enviado',        cls: 'bg-purple-400/20 text-purple-300 ring-purple-400/30' },
    ENTREGUE:    { label: 'Entregue',       cls: 'bg-green-400/20  text-green-300  ring-green-400/30'  },
    CANCELADO:   { label: 'Cancelado',      cls: 'bg-red-400/20    text-red-300    ring-red-400/30'    },
  }
  const s = mapa[status] || { label: status, cls: 'bg-gray-400/20 text-gray-300 ring-gray-400/30' }
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ring-1 ${s.cls}`}>
      {s.label}
    </span>
  )
}
