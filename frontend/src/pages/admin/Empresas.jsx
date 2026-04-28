// src/pages/admin/Empresas.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Globe, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function AdminEmpresas() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome: '', slug: '', descricao: '', whatsapp: '', endereco: '', cidade: '' })
  const [editando, setEditando] = useState(null)

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ['admin-empresas'],
    queryFn: async () => {
      const { data } = await api.get('/admin/empresas')
      return data
    },
  })

  const salvar = useMutation({
    mutationFn: async (dados) => {
      if (editando) {
        return api.put(`/admin/empresas/${editando}`, dados)
      }
      return api.post('/admin/empresas', dados)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-empresas'] })
      toast.success(editando ? 'Empresa atualizada!' : 'Empresa criada!')
      fecharModal()
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro ao salvar'),
  })

  const excluir = useMutation({
    mutationFn: (id) => api.delete(`/admin/empresas/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-empresas'] })
      toast.success('Empresa desativada!')
    },
  })

  const abrirEditar = (emp) => {
    setEditando(emp.id)
    setForm({ nome: emp.nome, slug: emp.slug, descricao: emp.descricao || '', whatsapp: emp.whatsapp, endereco: emp.endereco || '', cidade: emp.cidade || '' })
    setModal(true)
  }

  const fecharModal = () => {
    setModal(false)
    setEditando(null)
    setForm({ nome: '', slug: '', descricao: '', whatsapp: '', endereco: '', cidade: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    salvar.mutate(form)
  }

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Empresas</h1>
          <p className="text-gray-400 text-sm mt-0.5">Gerencie as associações do sistema</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Nova Empresa
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card p-6 h-40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((emp) => (
            <div key={emp.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{emp.nome}</h3>
                  <code className="text-xs text-gray-400">/{emp.slug}</code>
                </div>
                <span className={`badge ${emp.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {emp.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{emp.descricao}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Phone className="w-3.5 h-3.5" />
                {emp.whatsapp}
              </div>
              <div className="flex items-center gap-2 mt-1 mb-4">
                <span className="text-xs text-gray-400">{emp._count?.produtos} produtos · {emp._count?.pedidos} pedidos</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(emp)} className="btn-secondary text-sm py-2 flex-1">
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <a href={`/empresa/${emp.slug}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2 px-3">
                  <Globe className="w-4 h-4" />
                </a>
                <button onClick={() => { if(confirm('Desativar empresa?')) excluir.mutate(emp.id) }} className="text-red-400 hover:text-red-600 px-3">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-lg p-6 animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              {editando ? 'Editar Empresa' : 'Nova Empresa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Nome da Empresa *</label>
                  <input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                </div>
                {!editando && (
                  <div className="col-span-2">
                    <label className="label">Slug (URL) *</label>
                    <input className="input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g,'-')})} placeholder="ex: minha-associacao" required />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="label">Descrição</label>
                  <textarea className="input resize-none" rows={3} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">WhatsApp *</label>
                  <input className="input" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="5577999990001" required />
                </div>
                <div>
                  <label className="label">Endereço</label>
                  <input className="input" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
                </div>
                <div>
                  <label className="label">Cidade - UF</label>
                  <input className="input" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} placeholder="Cidade - BA" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={salvar.isPending}>
                  {salvar.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
