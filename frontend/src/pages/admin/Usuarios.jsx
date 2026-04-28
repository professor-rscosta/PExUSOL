// src/pages/admin/Usuarios.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function AdminUsuarios() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'VENDEDOR', empresaId: '' })

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: async () => (await api.get('/admin/usuarios')).data,
  })

  const { data: empresas = [] } = useQuery({
    queryKey: ['admin-empresas'],
    queryFn: async () => (await api.get('/admin/empresas')).data,
  })

  const salvar = useMutation({
    mutationFn: (dados) => editando
      ? api.put(`/admin/usuarios/${editando}`, dados)
      : api.post('/admin/usuarios', dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-usuarios'] })
      toast.success(editando ? 'Usuário atualizado!' : 'Usuário criado!')
      fecharModal()
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro'),
  })

  const desativar = useMutation({
    mutationFn: (id) => api.delete(`/admin/usuarios/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-usuarios'] }); toast.success('Usuário desativado') },
  })

  const abrirEditar = (u) => {
    setEditando(u.id)
    setForm({ nome: u.nome, email: u.email, senha: '', role: u.role, empresaId: u.empresaId || '' })
    setModal(true)
  }

  const fecharModal = () => {
    setModal(false); setEditando(null)
    setForm({ nome: '', email: '', senha: '', role: 'VENDEDOR', empresaId: '' })
  }

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-400 text-sm">Administradores e vendedores</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" /> Novo Usuário
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="card p-4 h-16 animate-pulse" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Empresa</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sol-100 flex items-center justify-center text-sol-700 text-sm font-bold">
                        {u.nome?.[0]}
                      </div>
                      <span className="font-medium text-sm text-gray-800">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{u.empresa?.nome || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => abrirEditar(u)} className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if(confirm('Desativar?')) desativar.mutate(u.id) }} className="text-red-300 hover:text-red-500">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-md p-6 animate-fadeIn">
            <h2 className="text-lg font-bold mb-5">{editando ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); salvar.mutate(form) }} className="space-y-3">
              <div>
                <label className="label">Nome *</label>
                <input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <label className="label">{editando ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}</label>
                <input type="password" className="input" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} required={!editando} />
              </div>
              <div>
                <label className="label">Perfil</label>
                <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {form.role === 'VENDEDOR' && (
                <div>
                  <label className="label">Empresa *</label>
                  <select className="input" value={form.empresaId} onChange={e => setForm({...form, empresaId: e.target.value})} required>
                    <option value="">Selecione...</option>
                    {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                  </select>
                </div>
              )}
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
