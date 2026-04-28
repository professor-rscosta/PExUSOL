// src/pages/admin/Produtos.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatarMoeda } from '../../utils'

export default function AdminProdutos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', estoque: '', unidade: 'un', categoriaId: '', empresaId: '', ativo: true })
  const [imagem, setImagem] = useState(null)

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['admin-produtos'],
    queryFn: async () => (await api.get('/admin/produtos')).data,
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => (await api.get('/categorias')).data,
  })

  const { data: empresas = [] } = useQuery({
    queryKey: ['admin-empresas'],
    queryFn: async () => (await api.get('/admin/empresas')).data,
  })

  const salvar = useMutation({
    mutationFn: (fd) => {
      if (editando) return api.put(`/produtos/${editando}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      return api.post('/produtos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-produtos'] })
      toast.success('Produto salvo!')
      fecharModal()
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro'),
  })

  const excluir = useMutation({
    mutationFn: (id) => api.delete(`/produtos/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-produtos'] }); toast.success('Excluído!') },
  })

  const fecharModal = () => {
    setModal(false); setEditando(null); setImagem(null)
    setForm({ nome: '', descricao: '', preco: '', estoque: '', unidade: 'un', categoriaId: '', empresaId: '', ativo: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (imagem) fd.append('imagem', imagem)
    salvar.mutate(fd)
  }

  const abrirEditar = (p) => {
    setEditando(p.id)
    setForm({ nome: p.nome, descricao: p.descricao || '', preco: p.preco, estoque: p.estoque, unidade: p.unidade, categoriaId: p.categoriaId || '', empresaId: p.empresaId, ativo: p.ativo })
    setModal(true)
  }

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Novo Produto
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card h-48 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtos.map((p) => (
            <div key={p.id} className="card group">
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {p.imagem ? (
                  <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {!p.ativo && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <span className="badge bg-red-500 text-white">Inativo</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400 mb-0.5">{p.empresa?.nome}</p>
                <h3 className="font-semibold text-sm text-gray-800 truncate">{p.nome}</h3>
                <p className="text-sol-600 font-bold text-sm mt-1">{formatarMoeda(p.preco)}</p>
                <p className="text-xs text-gray-400">Estoque: {p.estoque}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => abrirEditar(p)} className="flex-1 btn-secondary text-xs py-1.5">
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button onClick={() => { if(confirm('Excluir?')) excluir.mutate(p.id) }} className="text-red-300 hover:text-red-500 px-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-lg p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold mb-5">{editando ? 'Editar' : 'Novo'} Produto</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Empresa *</label>
                <select className="input" value={form.empresaId} onChange={e => setForm({...form, empresaId: e.target.value})} required>
                  <option value="">Selecione...</option>
                  {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nome *</label>
                <input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea className="input resize-none" rows={2} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">Preço (R$) *</label>
                  <input type="number" step="0.01" className="input" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Estoque</label>
                  <input type="number" className="input" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} />
                </div>
                <div>
                  <label className="label">Unidade</label>
                  <select className="input" value={form.unidade} onChange={e => setForm({...form, unidade: e.target.value})}>
                    {['un','kg','g','L','ml','maço','bdj','cx'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})}>
                  <option value="">Sem categoria</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Imagem do Produto</label>
                <input type="file" accept="image/*" onChange={e => setImagem(e.target.files[0])} className="input text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({...form, ativo: e.target.checked})} className="w-4 h-4" />
                <label htmlFor="ativo" className="text-sm text-gray-600">Produto ativo</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={salvar.isPending}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
