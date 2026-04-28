// src/pages/admin/Produtos.jsx
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ImageIcon, Search, Package, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatarMoeda, getImagemUrl } from '../../utils'

const CORES = ['bg-blue-600','bg-green-600','bg-rose-600','bg-teal-600','bg-purple-600','bg-amber-600']

export default function AdminProdutos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome:'',descricao:'',preco:'',estoque:'',unidade:'un',categoriaId:'',empresaId:'',ativo:true })
  const [imagem, setImagem] = useState(null)
  const [preview, setPreview] = useState(null)
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [agrupar, setAgrupar] = useState('empresa')

  const { data: produtos = [], isLoading } = useQuery({ queryKey:['admin-produtos'], queryFn: async()=>(await api.get('/admin/produtos')).data })
  const { data: categorias = [] } = useQuery({ queryKey:['categorias'], queryFn: async()=>(await api.get('/categorias')).data })
  const { data: empresas = [] } = useQuery({ queryKey:['admin-empresas'], queryFn: async()=>(await api.get('/admin/empresas')).data })

  const produtosFiltrados = useMemo(() => produtos.filter(p => {
    if (filtroEmpresa && p.empresaId !== Number(filtroEmpresa)) return false
    if (filtroCategoria && p.categoriaId !== Number(filtroCategoria)) return false
    if (filtroStatus === 'ativo' && !p.ativo) return false
    if (filtroStatus === 'inativo' && p.ativo) return false
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  }), [produtos, filtroEmpresa, filtroCategoria, filtroStatus, busca])

  const grupos = useMemo(() => {
    if (agrupar === 'lista') return [{ key:'todos', label:'Todos os Produtos', items:produtosFiltrados }]
    const map = {}
    produtosFiltrados.forEach(p => {
      const key = agrupar === 'empresa' ? (p.empresa?.nome||'Sem empresa') : (p.categoria?.nome||'Sem categoria')
      if (!map[key]) map[key] = []
      map[key].push(p)
    })
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b)).map(([label,items])=>({key:label,label,items}))
  }, [produtosFiltrados, agrupar])

  const salvar = useMutation({
    mutationFn: (fd) => editando ? api.put(`/produtos/${editando}`,fd,{headers:{'Content-Type':'multipart/form-data'}}) : api.post('/produtos',fd,{headers:{'Content-Type':'multipart/form-data'}}),
    onSuccess: () => { qc.invalidateQueries({queryKey:['admin-produtos']}); toast.success('Produto salvo!'); fecharModal() },
    onError: (err) => toast.error(err.response?.data?.erro||'Erro'),
  })

  const excluir = useMutation({
    mutationFn: (id) => api.delete(`/produtos/${id}`),
    onSuccess: () => { qc.invalidateQueries({queryKey:['admin-produtos']}); toast.success('Excluído!') },
    onError: () => toast.error('Erro ao excluir'),
  })

  const fecharModal = () => { setModal(false); setEditando(null); setImagem(null); setPreview(null); setForm({nome:'',descricao:'',preco:'',estoque:'',unidade:'un',categoriaId:'',empresaId:'',ativo:true}) }
  const abrirEditar = (p) => { setEditando(p.id); setForm({nome:p.nome,descricao:p.descricao||'',preco:p.preco,estoque:p.estoque,unidade:p.unidade||'un',categoriaId:p.categoriaId||'',empresaId:p.empresaId,ativo:p.ativo}); setPreview(p.imagem?getImagemUrl(p.imagem):null); setModal(true) }
  const handleSubmit = (e) => { e.preventDefault(); const fd=new FormData(); Object.entries(form).forEach(([k,v])=>{if(v!=='')fd.append(k,v)}); if(imagem)fd.append('imagem',imagem); salvar.mutate(fd) }
  const limpar = () => { setFiltroEmpresa(''); setFiltroCategoria(''); setFiltroStatus(''); setBusca('') }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-400 text-sm">{produtosFiltrados.length} de {produtos.length} produtos</p>
        </div>
        <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4"/> Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="label">Buscar</label>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input className="input pl-9" placeholder="Nome do produto..." value={busca} onChange={e=>setBusca(e.target.value)}/>
            </div>
          </div>
          <div className="min-w-44">
            <label className="label">Associação</label>
            <select className="input" value={filtroEmpresa} onChange={e=>setFiltroEmpresa(e.target.value)}>
              <option value="">Todas</option>
              {empresas.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div className="min-w-36">
            <label className="label">Categoria</label>
            <select className="input" value={filtroCategoria} onChange={e=>setFiltroCategoria(e.target.value)}>
              <option value="">Todas</option>
              {categorias.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="min-w-28">
            <label className="label">Status</label>
            <select className="input" value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
          <div className="min-w-36">
            <label className="label">Agrupar por</label>
            <select className="input" value={agrupar} onChange={e=>setAgrupar(e.target.value)}>
              <option value="empresa">Associação</option>
              <option value="categoria">Categoria</option>
              <option value="lista">Sem agrupamento</option>
            </select>
          </div>
          {(filtroEmpresa||filtroCategoria||filtroStatus||busca) && (
            <button onClick={limpar} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 self-end transition-colors">
              <X className="w-4 h-4"/> Limpar
            </button>
          )}
        </div>

        {/* Chips rápidos por empresa */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          <button onClick={()=>setFiltroEmpresa('')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${!filtroEmpresa?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
            Todas ({produtos.length})
          </button>
          {empresas.map((emp,i)=>(
            <button key={emp.id} onClick={()=>setFiltroEmpresa(String(emp.id))}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${filtroEmpresa===String(emp.id)?`${CORES[i%CORES.length]} text-white border-transparent`:'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {emp.nome.split('–')[0].trim().split(' ').slice(0,2).join(' ')} ({produtos.filter(p=>p.empresaId===emp.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Grupos */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i=><div key={i} className="bg-white rounded-2xl h-48 animate-pulse"/>)}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-400">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grupos.map((grupo,gi)=>{
            const corIdx = agrupar==='empresa' ? empresas.findIndex(e=>e.nome===grupo.label) : gi
            const cor = CORES[corIdx%CORES.length]
            return (
              <div key={grupo.key}>
                {agrupar!=='lista' && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-1 w-8 rounded-full ${cor}`}/>
                    <h2 className="font-bold text-gray-700">{grupo.label}</h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{grupo.items.length}</span>
                    <div className="flex-1 h-px bg-gray-100"/>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {grupo.items.map(p=>(
                    <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group ${!p.ativo?'opacity-60 border-red-100':'border-gray-100'}`}>
                      <div className="aspect-square bg-gray-50 relative overflow-hidden">
                        {p.imagem ? <img src={getImagemUrl(p.imagem)} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                          : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-200"/></div>}
                        {!p.ativo && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Inativo</span>}
                        {p.estoque===0 && p.ativo && <span className="absolute top-2 left-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">Sem estoque</span>}
                      </div>
                      <div className="p-3">
                        {agrupar!=='empresa' && <p className="text-xs text-gray-400 truncate mb-0.5">{p.empresa?.nome?.split('–')[0].trim()}</p>}
                        {agrupar!=='categoria' && p.categoria && <span className="inline-block text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full mb-1">{p.categoria.nome}</span>}
                        <h3 className="font-semibold text-sm text-gray-800 truncate">{p.nome}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-blue-700 font-bold text-sm">{formatarMoeda(p.preco)}</p>
                          <p className="text-xs text-gray-400">Est:{p.estoque}</p>
                        </div>
                        <div className="flex gap-1 mt-2.5">
                          <button onClick={()=>abrirEditar(p)} className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-600 py-1.5 rounded-lg transition-colors">
                            <Edit className="w-3.5 h-3.5"/> Editar
                          </button>
                          <button onClick={()=>confirm(`Excluir "${p.nome}"?`)&&excluir.mutate(p.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <h2 className="text-lg font-bold">{editando?'Editar':'Novo'} Produto</h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Associação *</label>
                <select className="input" value={form.empresaId} onChange={e=>setForm({...form,empresaId:e.target.value})} required>
                  <option value="">Selecione...</option>
                  {empresas.map(emp=><option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Imagem</label>
                {preview && <img src={preview} alt="" className="w-full h-36 object-cover rounded-xl mb-2"/>}
                <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setImagem(f);setPreview(URL.createObjectURL(f))}}} className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs"/>
              </div>
              <div>
                <label className="label">Nome *</label>
                <input className="input" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required/>
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea className="input resize-none" rows={2} value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Preço (R$) *</label><input type="number" step="0.01" min="0" className="input" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} required/></div>
                <div><label className="label">Estoque</label><input type="number" min="0" className="input" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})}/></div>
                <div><label className="label">Unidade</label>
                  <select className="input" value={form.unidade} onChange={e=>setForm({...form,unidade:e.target.value})}>
                    {['un','kg','g','L','ml','maço','bdj','cx','pct'].map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={form.categoriaId} onChange={e=>setForm({...form,categoriaId:e.target.value})}>
                  <option value="">Sem categoria</option>
                  {categorias.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ativo" checked={form.ativo} onChange={e=>setForm({...form,ativo:e.target.checked})} className="w-4 h-4"/>
                <label htmlFor="ativo" className="text-sm text-gray-700">Produto ativo</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={salvar.isPending}>{salvar.isPending?'Salvando...':'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
