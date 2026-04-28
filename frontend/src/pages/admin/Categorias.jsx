// src/pages/admin/Categorias.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function AdminCategorias() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome: '', icone: '' })
  const [editando, setEditando] = useState(null)

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => (await api.get('/categorias')).data,
  })

  const salvar = useMutation({
    mutationFn: (d) => editando ? api.put(`/admin/categorias/${editando}`, d) : api.post('/admin/categorias', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); toast.success('Salvo!'); fecharModal() },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro'),
  })

  const excluir = useMutation({
    mutationFn: (id) => api.delete(`/admin/categorias/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); toast.success('Excluída!') },
  })

  const fecharModal = () => { setModal(false); setEditando(null); setForm({ nome: '', icone: '' }) }

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categorias.map((cat) => (
          <div key={cat.id} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{cat.icone}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{cat.nome}</p>
              <p className="text-xs text-gray-400">{cat._count?.produtos || 0} produtos</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditando(cat.id); setForm({ nome: cat.nome, icone: cat.icone || '' }); setModal(true) }} className="text-gray-300 hover:text-gray-600">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => { if(confirm('Excluir?')) excluir.mutate(cat.id) }} className="text-red-300 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-sm p-6 animate-fadeIn">
            <h2 className="text-lg font-bold mb-4">{editando ? 'Editar' : 'Nova'} Categoria</h2>
            <form onSubmit={(e) => { e.preventDefault(); salvar.mutate(form) }} className="space-y-3">
              <div>
                <label className="label">Nome *</label>
                <input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
              </div>
              <div>
                <label className="label">Emoji/Ícone</label>
                <input className="input" value={form.icone} onChange={e => setForm({...form, icone: e.target.value})} placeholder="Ex: 🌱" maxLength={5} />
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
