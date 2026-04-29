// src/pages/admin/Empresas.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Globe, Phone, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { getImagemUrl } from '../../utils'

export default function AdminEmpresas() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome:'', slug:'', descricao:'', whatsapp:'', site:'', endereco:'', cidade:'' })
  const [editando, setEditando] = useState(null)
  const [logo, setLogo] = useState(null)
  const [previewLogo, setPreviewLogo] = useState(null)

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ['admin-empresas'],
    queryFn: async () => (await api.get('/admin/empresas')).data,
  })

  const salvar = useMutation({
    mutationFn: async (dados) => {
      const fd = new FormData()
      Object.entries(dados).forEach(([k,v]) => { if (v !== null && v !== undefined && v !== '') fd.append(k, v) })
      if (logo) fd.append('logo', logo)
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      return editando ? api.put(`/admin/empresas/${editando}`, fd, cfg) : api.post('/admin/empresas', fd, cfg)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-empresas'] })
      toast.success(editando ? 'Associação atualizada!' : 'Associação criada!')
      fecharModal()
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro ao salvar'),
  })

  const excluir = useMutation({
    mutationFn: (id) => api.delete(`/admin/empresas/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-empresas'] }); toast.success('Removida!') },
  })

  const abrirEditar = (emp) => {
    setEditando(emp.id)
    setForm({ nome: emp.nome, slug: emp.slug, descricao: emp.descricao||'', whatsapp: emp.whatsapp, site: emp.site||'', endereco: emp.endereco||'', cidade: emp.cidade||'' })
    setPreviewLogo(emp.logo ? getImagemUrl(emp.logo) : null)
    setLogo(null)
    setModal(true)
  }

  const fecharModal = () => {
    setModal(false); setEditando(null); setLogo(null); setPreviewLogo(null)
    setForm({ nome:'', slug:'', descricao:'', whatsapp:'', site:'', endereco:'', cidade:'' })
  }

  const handleSubmit = (e) => { e.preventDefault(); salvar.mutate(form) }

  const gerarSlug = (nome) => nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Associações</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4"/> Nova Associação
        </button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i=><div key={i} className="bg-white rounded-2xl h-40 animate-pulse"/>)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {empresas.map((emp) => {
            const logoSrc = emp.logo ? getImagemUrl(emp.logo) : null
            return (
              <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                {/* Cabeçalho colorido */}
                <div className="bg-gradient-to-r from-[#0f1f5c] to-[#1e40af] p-4 flex items-center gap-4">
                  {logoSrc ? (
                    <img src={logoSrc} alt={emp.nome} className="w-14 h-14 rounded-xl object-contain bg-white p-1 flex-shrink-0"/>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-yellow-400 flex items-center justify-center text-[#0f1f5c] font-black text-2xl flex-shrink-0">
                      {emp.nome[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-white font-bold truncate leading-snug">{emp.nome}</h3>
                    <p className="text-blue-300 text-xs font-mono">/{emp.slug}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${emp.ativo ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                      {emp.ativo ? '● Ativa' : '● Inativa'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {emp.descricao && <p className="text-gray-500 text-sm line-clamp-2">{emp.descricao}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {emp.whatsapp && (
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-green-500"/>{emp.whatsapp}</span>
                    )}
                    {emp.site && (
                      <a href={emp.site} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline">
                        <Globe className="w-3.5 h-3.5"/> Site oficial
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => abrirEditar(emp)} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
                      <Edit className="w-3.5 h-3.5"/> Editar
                    </button>
                    <button onClick={() => confirm(`Remover "${emp.nome}"?`) && excluir.mutate(emp.id)}
                      className="px-3 py-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editando ? 'Editar' : 'Nova'} Associação</h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo upload */}
              <div>
                <label className="label">Logo da Associação</label>
                <div className="flex items-center gap-4">
                  {previewLogo ? (
                    <div className="relative">
                      <img src={previewLogo} alt="" className="w-20 h-20 rounded-xl object-contain bg-gray-50 border border-gray-200 p-1"/>
                      <button type="button" onClick={()=>{setPreviewLogo(null);setLogo(null)}}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">✕</button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                      <Upload className="w-7 h-7"/>
                    </div>
                  )}
                  <div>
                    <input type="file" accept="image/*" id="logo-upload" className="hidden"
                      onChange={e=>{const f=e.target.files[0];if(f){setLogo(f);setPreviewLogo(URL.createObjectURL(f))}}}/>
                    <label htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-4 py-2 rounded-xl transition-colors">
                      <Upload className="w-4 h-4"/> {previewLogo ? 'Trocar logo' : 'Enviar logo'}
                    </label>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG até 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Nome *</label>
                <input className="input" value={form.nome} required
                  onChange={e => { setForm({...form, nome: e.target.value, slug: editando ? form.slug : gerarSlug(e.target.value)}) }}/>
              </div>
              <div>
                <label className="label">Slug (URL) *</label>
                <input className="input font-mono text-sm" value={form.slug} required
                  onChange={e => setForm({...form, slug: e.target.value})}
                  placeholder="ex: agropastoril"/>
                <p className="text-xs text-gray-400 mt-1">Usado na URL: /empresa/<strong>{form.slug || 'slug'}</strong></p>
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea className="input resize-none" rows={2} value={form.descricao}
                  onChange={e=>setForm({...form,descricao:e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">WhatsApp *</label>
                  <input className="input" value={form.whatsapp} required placeholder="5577999999999"
                    onChange={e=>setForm({...form,whatsapp:e.target.value})}/>
                </div>
                <div>
                  <label className="label">Site</label>
                  <input className="input" value={form.site} placeholder="https://..."
                    onChange={e=>setForm({...form,site:e.target.value})}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Endereço</label>
                  <input className="input" value={form.endereco} onChange={e=>setForm({...form,endereco:e.target.value})}/>
                </div>
                <div>
                  <label className="label">Cidade</label>
                  <input className="input" value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})}/>
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
