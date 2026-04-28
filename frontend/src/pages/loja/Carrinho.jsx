// src/pages/loja/Carrinho.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useCarrinho } from '../../contexts/CarrinhoContext'
import { formatarMoeda, gerarMensagemWhatsApp } from '../../utils'
import HeaderPublico from '../../components/layout/HeaderPublico'

export default function Carrinho() {
  const { itens, empresaSlug, total, remover, alterarQuantidade, limpar } = useCarrinho()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    clienteNome: '',
    clienteTelefone: '',
    clienteEndereco: '',
    tipoEntrega: 'RETIRADA',
    observacao: '',
  })
  const [enviando, setEnviando] = useState(false)

  const handleFinalizar = async () => {
    if (!form.clienteNome.trim()) {
      toast.error('Informe seu nome')
      return
    }
    if (form.tipoEntrega === 'ENTREGA' && !form.clienteEndereco.trim()) {
      toast.error('Informe o endereço de entrega')
      return
    }

    setEnviando(true)
    try {
      const { data: pedido } = await api.post(`/empresa/${empresaSlug}/pedidos`, {
        ...form,
        itens: itens.map((i) => ({ produtoId: i.id, quantidade: i.quantidade })),
      })

      // Busca empresa para pegar WhatsApp
      const { data: empresa } = await api.get(`/empresas/${empresaSlug}`)

      // Gera link WhatsApp
      const msg = gerarMensagemWhatsApp(
        pedido.protocolo,
        itens.map((i) => ({ nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
        form.tipoEntrega,
        form.clienteEndereco,
        form.observacao
      )

      limpar()
      navigate('/pedido/sucesso', {
        state: { pedido, whatsapp: empresa.whatsapp, msg },
      })
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao finalizar pedido')
    } finally {
      setEnviando(false)
    }
  }

  if (itens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderPublico />
        <div className="page-container py-20 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Seu carrinho está vazio</h2>
          <p className="text-gray-400 mt-1 mb-6">Adicione produtos de uma das nossas lojas</p>
          <Link to="/" className="btn-primary inline-flex">Ver lojas</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPublico />

      <div className="page-container py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/empresa/${empresaSlug}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Meu Carrinho</h1>
          <span className="badge bg-sol-100 text-sol-700">{itens.length} iten{itens.length > 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ITENS */}
          <div className="lg:col-span-2 space-y-3">
            {itens.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.imagem ? (
                    <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {item.categoria?.icone || '📦'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.nome}</h3>
                  <p className="text-sol-600 font-bold mt-0.5">{formatarMoeda(item.preco)}/{item.unidade}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-red-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantidade}</span>
                      <button
                        onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-green-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">
                        {formatarMoeda(parseFloat(item.preco) * item.quantidade)}
                      </span>
                      <button onClick={() => remover(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FORMULÁRIO + RESUMO */}
          <div className="space-y-4">
            {/* Dados do Cliente */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-800 mb-4">Seus dados</h2>
              <div className="space-y-3">
                <div>
                  <label className="label">Seu nome *</label>
                  <input
                    className="input"
                    placeholder="Como você se chama?"
                    value={form.clienteNome}
                    onChange={(e) => setForm({ ...form, clienteNome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Telefone (opcional)</label>
                  <input
                    className="input"
                    placeholder="(77) 99999-0000"
                    value={form.clienteTelefone}
                    onChange={(e) => setForm({ ...form, clienteTelefone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Entrega */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-800 mb-4">Tipo de entrega</h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { value: 'RETIRADA', label: '🏪 Retirada', desc: 'Na loja' },
                  { value: 'ENTREGA', label: '🏠 Entrega', desc: 'No endereço' },
                ].map((op) => (
                  <button
                    key={op.value}
                    onClick={() => setForm({ ...form, tipoEntrega: op.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.tipoEntrega === op.value
                        ? 'border-sol-500 bg-sol-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-sm">{op.label}</div>
                    <div className="text-xs text-gray-400">{op.desc}</div>
                  </button>
                ))}
              </div>

              {form.tipoEntrega === 'ENTREGA' && (
                <div>
                  <label className="label">Endereço *</label>
                  <input
                    className="input"
                    placeholder="Rua, nº, bairro..."
                    value={form.clienteEndereco}
                    onChange={(e) => setForm({ ...form, clienteEndereco: e.target.value })}
                  />
                </div>
              )}

              <div className="mt-3">
                <label className="label">Observação (opcional)</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Alguma observação sobre seu pedido?"
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                />
              </div>
            </div>

            {/* Resumo */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-800 mb-3">Resumo</h2>
              {itens.map((i) => (
                <div key={i.id} className="flex justify-between text-sm text-gray-600 py-1">
                  <span>{i.nome} x{i.quantidade}</span>
                  <span>{formatarMoeda(parseFloat(i.preco) * i.quantidade)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-sol-700">{formatarMoeda(total)}</span>
              </div>

              <button
                onClick={handleFinalizar}
                disabled={enviando}
                className="btn-whatsapp mt-4"
              >
                <MessageCircle className="w-6 h-6" />
                {enviando ? 'Processando...' : 'Finalizar no WhatsApp'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Um link WhatsApp será gerado com todos os detalhes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
