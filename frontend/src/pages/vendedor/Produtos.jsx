import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatarMoeda, getImagemUrl } from '../../utils';
import toast from 'react-hot-toast';

const VAZIO = {
  nome: '', descricao: '', preco: '', estoque: '',
  categoriaId: '', ativo: true, imagem: null,
};

export default function VendedorProdutos() {
  const { usuario } = useAuth();
  const slug = usuario?.empresa?.slug;
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['vendedor-produtos', slug],
    queryFn: async () => {
      const { data } = await api.get(`/empresa/${slug}/produtos/vendedor`);
      return data;
    },
    enabled: !!slug,
  });

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data } = await api.get('/categorias');
      return data;
    },
  });

  const salvar = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'imagem' && v !== null && v !== undefined) fd.append(k, v);
      });
      if (form.imagem) fd.append('imagem', form.imagem);

      if (editId) {
        return api.put(`/produtos/${editId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return api.post('/produtos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(['vendedor-produtos', slug]);
      fechar();
      toast.success(editId ? 'Produto atualizado!' : 'Produto criado!');
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro ao salvar'),
  });

  const excluir = useMutation({
    mutationFn: (id) => api.delete(`/produtos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['vendedor-produtos', slug]);
      toast.success('Produto excluído!');
    },
    onError: () => toast.error('Erro ao excluir produto'),
  });

  function abrirNovo() {
    setForm(VAZIO);
    setEditId(null);
    setPreview(null);
    setModal(true);
  }

  function abrirEdicao(p) {
    setForm({
      nome: p.nome, descricao: p.descricao || '',
      preco: p.preco, estoque: p.estoque,
      categoriaId: p.categoriaId || '', ativo: p.ativo, imagem: null,
    });
    setEditId(p.id);
    setPreview(p.imagem ? getImagemUrl(p.imagem) : null);
    setModal(true);
  }

  function fechar() {
    setModal(false);
    setForm(VAZIO);
    setEditId(null);
    setPreview(null);
  }

  function handleImagem(e) {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({ ...f, imagem: file }));
      setPreview(URL.createObjectURL(file));
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sol-500" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
        <button onClick={abrirNovo} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {produtos?.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Nenhum produto cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produtos?.map((p) => (
            <div key={p.id} className="card flex gap-4">
              {p.imagem ? (
                <img
                  src={getImagemUrl(p.imagem)}
                  alt={p.nome}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{p.nome}</p>
                <p className="text-sol-600 font-bold">{formatarMoeda(p.preco)}</p>
                <p className="text-sm text-gray-500">Estoque: {p.estoque}</p>
                <span className={`badge mt-1 ${p.ativo ? 'badge-ativo' : 'badge-inativo'}`}>
                  {p.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => abrirEdicao(p)}
                  className="p-1.5 text-gray-400 hover:text-sol-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir "${p.nome}"?`)) excluir.mutate(p.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5">
              {editId ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className="space-y-4">
              {/* Imagem */}
              <div>
                <label className="label">Imagem</label>
                {preview && (
                  <img src={preview} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                )}
                <input type="file" accept="image/*" onChange={handleImagem} className="text-sm" />
              </div>

              <div>
                <label className="label">Nome *</label>
                <input
                  className="input"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>

              <div>
                <label className="label">Descrição</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva o produto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Preço (R$) *</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="label">Estoque *</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.estoque}
                    onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="label">Categoria</label>
                <select
                  className="input"
                  value={form.categoriaId}
                  onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                >
                  <option value="">Sem categoria</option>
                  {categorias?.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="ativo" className="text-sm text-gray-700">Produto ativo (visível na loja)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={fechar} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={() => salvar.mutate()}
                disabled={salvar.isPending || !form.nome || !form.preco}
                className="btn-primary flex-1"
              >
                {salvar.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
