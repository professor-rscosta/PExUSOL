// src/pages/loja/Carrinho.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, MessageCircle, Search, MapPin, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useCarrinho } from '../../contexts/CarrinhoContext'
import { formatarMoeda, getImagemUrl } from '../../utils'
import HeaderPublico from '../../components/layout/HeaderPublico'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const maskCPF = (v) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')
const maskTel = (v) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2')
const maskCEP = (v) => v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2')

export default function Carrinho() {
  const { itens, empresaSlug, total, remover, alterarQuantidade, limpar } = useCarrinho()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    clienteNome: '',
    clienteCpf: '',
    clienteTelefone: '',
    clienteEmail: '',
    tipoEntrega: 'RETIRADA',
    // endereço
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'BA',
    observacao: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)

  // ── Busca CEP via ViaCEP ───────────────────────────────
  const buscarCEP = async () => {
    const cep = form.cep.replace(/\D/g,'')
    if (cep.length !== 8) return toast.error('CEP incompleto')
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) return toast.error('CEP não encontrado')
      setForm(f => ({ ...f, logradouro: data.logradouro||f.logradouro, bairro: data.bairro||f.bairro, cidade: data.localidade||f.cidade, estado: data.uf||f.estado }))
      toast.success('Endereço preenchido!')
    } catch { toast.error('Erro ao buscar CEP') }
    finally { setBuscandoCep(false) }
  }

  const enderecoCompleto = () => {
    if (form.tipoEntrega !== 'ENTREGA') return ''
    const parts = [form.logradouro, form.numero, form.complemento, form.bairro, form.cidade, form.estado, form.cep].filter(Boolean)
    return parts.join(', ')
  }

  const handleFinalizar = async () => {
    if (!form.clienteNome.trim()) return toast.error('Informe seu nome completo')
    if (!form.clienteTelefone.trim()) return toast.error('Informe seu telefone WhatsApp')
    if (form.tipoEntrega === 'ENTREGA') {
      if (!form.logradouro.trim()) return toast.error('Informe o logradouro')
      if (!form.numero.trim()) return toast.error('Informe o número')
      if (!form.cidade.trim()) return toast.error('Informe a cidade')
    }

    setEnviando(true)
    try {
      const { data: pedido } = await api.post(`/empresa/${empresaSlug}/pedidos`, {
        clienteNome: form.clienteNome,
        clienteTelefone: form.clienteTelefone.replace(/\D/g,''),
        clienteEndereco: enderecoCompleto(),
        tipoEntrega: form.tipoEntrega,
        observacao: form.observacao,
        itens: itens.map(i => ({ produtoId: i.id, quantidade: i.quantidade })),
      })

      const { data: empresa } = await api.get(`/empresas/${empresaSlug}`)

      // Passa dados brutos — a mensagem é gerada e encodada em CheckoutSucesso
      const dadosPedido = {
        protocolo: pedido.protocolo,
        itens: itens.map(i => ({ nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
        tipoEntrega: form.tipoEntrega,
        endereco: enderecoCompleto(),
        observacao: form.observacao,
        clienteNome: form.clienteNome,
        clienteTelefone: form.clienteTelefone,
        empresaNome: empresa.nome,
      }

      limpar()
      navigate('/pedido/sucesso', { state: { pedido, whatsapp: empresa.whatsapp, dadosPedido } })
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
          <span className="badge bg-amber-100 text-amber-700">{itens.length} iten{itens.length > 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── ITENS ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {itens.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  {item.imagem
                    ? <img src={getImagemUrl(item.imagem)} alt={item.nome} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.nome}</h3>
                  <p className="text-amber-600 font-bold mt-0.5 text-sm">{formatarMoeda(item.preco)}/{item.unidade}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button onClick={() => alterarQuantidade(item.id, item.quantidade - 1)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-red-50 transition-colors">
                        <Minus className="w-3.5 h-3.5"/>
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantidade}</span>
                      <button onClick={() => alterarQuantidade(item.id, item.quantidade + 1)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-green-50 transition-colors">
                        <Plus className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800 text-sm">{formatarMoeda(parseFloat(item.preco) * item.quantidade)}</span>
                      <button onClick={() => remover(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── FORMULÁRIO + RESUMO ────────────────────── */}
          <div className="space-y-4">

            {/* ── Dados Pessoais ──────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600"/> Dados Pessoais
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="label">Nome Completo *</label>
                  <input className="input" placeholder="Seu nome completo"
                    value={form.clienteNome} onChange={e => setForm({...form, clienteNome: e.target.value})}/>
                </div>
                <div>
                  <label className="label">CPF</label>
                  <input className="input" placeholder="000.000.000-00" maxLength={14}
                    value={form.clienteCpf} onChange={e => setForm({...form, clienteCpf: maskCPF(e.target.value)})}/>
                </div>
                <div>
                  <label className="label">Telefone (WhatsApp) *</label>
                  <input className="input" placeholder="(77) 99999-9999" maxLength={15}
                    value={form.clienteTelefone} onChange={e => setForm({...form, clienteTelefone: maskTel(e.target.value)})}/>
                </div>
                <div>
                  <label className="label">E-mail <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <input className="input" type="email" placeholder="seu@email.com"
                    value={form.clienteEmail} onChange={e => setForm({...form, clienteEmail: e.target.value})}/>
                </div>
              </div>
            </div>

            {/* ── Tipo de Entrega ─────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600"/> Entrega
              </h2>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { value: 'RETIRADA', label: '🏪 Retirada', desc: 'Buscar na loja' },
                  { value: 'ENTREGA',  label: '🏠 Entrega',  desc: 'No meu endereço' },
                ].map(op => (
                  <button key={op.value} onClick={() => setForm({...form, tipoEntrega: op.value})}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${form.tipoEntrega === op.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="font-semibold text-sm">{op.label}</div>
                    <div className="text-xs text-gray-400">{op.desc}</div>
                  </button>
                ))}
              </div>

              {/* Endereço completo — só aparece se ENTREGA */}
              {form.tipoEntrega === 'ENTREGA' && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Endereço de entrega</p>

                  {/* CEP com busca */}
                  <div>
                    <label className="label">CEP</label>
                    <div className="flex gap-2">
                      <input className="input flex-1" placeholder="00000-000" maxLength={9}
                        value={form.cep} onChange={e => setForm({...form, cep: maskCEP(e.target.value)})}/>
                      <button onClick={buscarCEP} disabled={buscandoCep}
                        className="flex-shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
                        <Search className="w-4 h-4"/>{buscandoCep ? '...' : 'Buscar'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Clique em "Buscar" para preencher automaticamente</p>
                  </div>

                  <div>
                    <label className="label">Logradouro (Rua, Avenida, etc.)</label>
                    <input className="input" placeholder="Ex: Rua das Flores"
                      value={form.logradouro} onChange={e => setForm({...form, logradouro: e.target.value})}/>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Número</label>
                      <input className="input" placeholder="300 ou S/N"
                        value={form.numero} onChange={e => setForm({...form, numero: e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">Complemento</label>
                      <input className="input" placeholder="Apto, Casa..."
                        value={form.complemento} onChange={e => setForm({...form, complemento: e.target.value})}/>
                    </div>
                  </div>

                  <div>
                    <label className="label">Bairro</label>
                    <input className="input" placeholder="Ex: Centro"
                      value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})}/>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Cidade</label>
                      <input className="input" placeholder="Bom Jesus da Lapa"
                        value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">Estado</label>
                      <select className="input" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                        {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <label className="label">Observação <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea className="input resize-none" rows={2}
                  placeholder="Alguma observação sobre o pedido?"
                  value={form.observacao} onChange={e => setForm({...form, observacao: e.target.value})}/>
              </div>
            </div>

            {/* ── Resumo + Botão ──────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-3">Resumo do Pedido</h2>
              {itens.map(i => (
                <div key={i.id} className="flex justify-between text-sm text-gray-600 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="truncate pr-2">{i.nome} <span className="text-gray-400">x{i.quantidade}</span></span>
                  <span className="flex-shrink-0 font-medium">{formatarMoeda(parseFloat(i.preco) * i.quantidade)}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-amber-700">{formatarMoeda(total)}</span>
              </div>

              <button onClick={handleFinalizar} disabled={enviando}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-base disabled:opacity-60">
                <MessageCircle className="w-5 h-5"/>
                {enviando ? 'Processando...' : 'Finalizar no WhatsApp'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Você será redirecionado ao WhatsApp com todos os detalhes do pedido
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
