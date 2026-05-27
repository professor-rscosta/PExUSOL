// src/pages/vendedor/Produtos.jsx
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, Search, X, Filter } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatarMoeda, getImagemUrl } from '../../utils';
import toast from 'react-hot-toast';

const VAZIO = { nome:'', descricao:'', preco:'', estoque:'', categoriaId:'', ativo:true, imagem:null };

export default function VendedorProdutos() {
  const { usuario } = useAuth();
  const slug = usuario?.empresa?.slug;
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [agrupar, setAgrupar] = useState(true);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['vendedor-produtos', slug],
    queryFn: async () => { const { data } = await api.get(`/empresa/${slug}/produtos/vendedor`); return data; },
    enabled: !!slug,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => { const { data } = await api.get('/categorias'); return data; },
  });

  const produtosFiltrados = useMemo(() => produtos.filter(p => {
    if (filtroCategoria && p.categoriaId !== Number(filtroCategoria)) return false;
    if (filtroStatus === 'ativo' && !p.ativo) return false;
    if (filtroStatus === 'inativo' && p.ativo) return false;
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }), [produtos, filtroCategoria, filtroStatus, busca]);

  const grupos = useMemo(() => {
    if (!agrupar) return [{ key:'todos', label:'Todos', items: produtosFiltrados }];
    const map = {};
    produtosFiltrados.forEach(p => {
      const key = p.categoria?.nome || 'Sem categoria';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b)).map(([label,items])=>({key:label,label,items}));
  }, [produtosFiltrados, agrupar]);

  const salvar = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>{ if(k!=='imagem'&&v!==null&&v!==undefined) fd.append(k,v); });
      if (form.imagem) fd.append('imagem', form.imagem);
      // Garante empresaId no FormData (obrigatório pelo backend)
      if (!editId) fd.append('empresaId', usuario?.empresa?.id || '');
      return editId ? api.put(`/produtos/${editId}`,fd,{headers:{'Content-Type':'multipart/form-data'}})
                    : api.post('/produtos',fd,{headers:{'Content-Type':'multipart/form-data'}});
    },
    onSuccess: () => { qc.invalidateQueries(['vendedor-produtos',slug]); fechar(); toast.success(editId?'Atualizado!':'Criado!'); },
    onError: (err) => toast.error(err.response?.data?.erro||'Erro ao salvar'),
  });

  const excluir = useMutation({
    mutationFn: (id) => api.delete(`/produtos/${id}`),
    onSuccess: () => { qc.invalidateQueries(['vendedor-produtos',slug]); toast.success('Excluído!'); },
    onError: () => toast.error('Erro ao excluir'),
  });

  function abrirNovo() { setForm(VAZIO); setEditId(null); setPreview(null); setModal(true); }
  function abrirEdicao(p) {
    setForm({nome:p.nome,descricao:p.descricao||'',preco:p.preco,estoque:p.estoque,categoriaId:p.categoriaId||'',ativo:p.ativo,imagem:null});
    setEditId(p.id); setPreview(p.imagem?getImagemUrl(p.imagem):null); setModal(true);
  }
  function fechar() { setModal(false); setForm(VAZIO); setEditId(null); setPreview(null); }

  const totalAtivos = produtos.filter(p=>p.ativo).length;
  const semEstoque = produtos.filter(p=>p.estoque===0&&p.ativo).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
          <p className="text-gray-400 text-sm">{produtosFiltrados.length} de {produtos.length} produtos</p>
        </div>
        <button onClick={abrirNovo} className="bg-[#1a2f7a] hover:bg-[#0f1f5c] text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4"/> Novo Produto
        </button>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:'Total', valor: produtos.length, cor:'bg-blue-50 text-blue-700 border-blue-100' },
          { label:'Ativos', valor: totalAtivos, cor:'bg-green-50 text-green-700 border-green-100' },
          { label:'Sem Estoque', valor: semEstoque, cor: semEstoque>0?'bg-red-50 text-red-700 border-red-100':'bg-gray-50 text-gray-500 border-gray-100' },
        ].map(s=>(
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.cor}`}>
            <p className="text-xl font-bold">{s.valor}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-36">
            <label className="label">Buscar</label>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input className="input pl-9" placeholder="Nome..." value={busca} onChange={e=>setBusca(e.target.value)}/>
            </div>
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
          <div className="self-end">
            <button onClick={()=>setAgrupar(a=>!a)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition-all ${agrupar?'bg-[#1a2f7a] text-white border-[#1a2f7a]':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              <Filter className="w-4 h-4"/> {agrupar?'Agrupado':'Sem grupo'}
            </button>
          </div>
          {(busca||filtroCategoria||filtroStatus) && (
            <button onClick={()=>{setBusca('');setFiltroCategoria('');setFiltroStatus('')}} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 self-end px-2 py-2">
              <X className="w-4 h-4"/> Limpar
            </button>
          )}
        </div>

        {/* Chips de categoria */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
            <button onClick={()=>setFiltroCategoria('')}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${!filtroCategoria?'bg-[#1a2f7a] text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              Todos
            </button>
            {categorias.filter(c=>produtos.some(p=>p.categoriaId===c.id)).map(c=>(
              <button key={c.id} onClick={()=>setFiltroCategoria(String(c.id))}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${filtroCategoria===String(c.id)?'bg-amber-500 text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {c.nome} ({produtos.filter(p=>p.categoriaId===c.id).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista agrupada */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i=><div key={i} className="bg-white rounded-2xl h-32 animate-pulse"/>)}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-400">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map(grupo=>(
            <div key={grupo.key}>
              {agrupar && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1 w-6 rounded-full bg-amber-400"/>
                  <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{grupo.label}</h2>
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{grupo.items.length}</span>
                  <div className="flex-1 h-px bg-gray-100"/>
                </div>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grupo.items.map(p=>(
                  <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex group ${!p.ativo?'opacity-60 border-red-100':'border-gray-100'}`}>
                    {p.imagem ? (
                      <img src={getImagemUrl(p.imagem)} alt={p.nome} className="w-20 h-20 object-cover flex-shrink-0 m-3 rounded-xl"/>
                    ) : (
                      <div className="w-20 h-20 bg-gray-50 flex items-center justify-center flex-shrink-0 m-3 rounded-xl">
                        <Package className="w-7 h-7 text-gray-200"/>
                      </div>
                    )}
                    <div className="flex-1 p-3 pl-0 min-w-0">
                      {p.categoria && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{p.categoria.nome}</span>}
                      <p className="font-semibold text-gray-800 truncate mt-1 text-sm">{p.nome}</p>
                      <p className="text-[#1a2f7a] font-bold text-sm">{formatarMoeda(p.preco)}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs font-medium ${p.estoque===0?'text-red-500':'text-gray-400'}`}>
                          {p.estoque===0?'⚠️ Sem estoque':`Estoque: ${p.estoque}`}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.ativo?'bg-green-50 text-green-600':'bg-red-50 text-red-500'}`}>
                          {p.ativo?'Ativo':'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-1 pr-3">
                      <button onClick={()=>abrirEdicao(p)} className="p-1.5 text-gray-400 hover:text-[#1a2f7a] hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4"/>
                      </button>
                      <button onClick={()=>confirm(`Excluir "${p.nome}"?`)&&excluir.mutate(p.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">{editId?'Editar':'Novo'} Produto</h2>
              <button onClick={fechar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Imagem</label>
                {preview && <img src={preview} alt="" className="w-full h-36 object-cover rounded-xl mb-2"/>}
                <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setForm(prev=>({...prev,imagem:f}));setPreview(URL.createObjectURL(f))}}}
                  className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs"/>
              </div>
              <div><label className="label">Nome *</label><input className="input" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Nome do produto"/></div>
              <div><label className="label">Descrição</label><textarea className="input resize-none" rows={3} value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} placeholder="Descreva o produto..."/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Preço (R$) *</label><input className="input" type="number" step="0.01" min="0" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} placeholder="0,00"/></div>
                <div><label className="label">Estoque *</label><input className="input" type="number" min="0" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})} placeholder="0"/></div>
              </div>
              <div><label className="label">Categoria</label>
                <select className="input" value={form.categoriaId} onChange={e=>setForm({...form,categoriaId:e.target.value})}>
                  <option value="">Sem categoria</option>
                  {categorias.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ativo" checked={form.ativo} onChange={e=>setForm({...form,ativo:e.target.checked})} className="w-4 h-4"/>
                <label htmlFor="ativo" className="text-sm text-gray-700">Produto ativo (visível na loja)</label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={fechar} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={()=>salvar.mutate()} disabled={salvar.isPending||!form.nome||!form.preco}
                  className="flex-1 bg-[#1a2f7a] hover:bg-[#0f1f5c] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                  {salvar.isPending?'Salvando...':'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}