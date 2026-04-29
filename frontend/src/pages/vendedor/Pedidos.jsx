import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, ChevronDown } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatarMoeda, formatarData, STATUS_PEDIDO } from '../../utils';
import toast from 'react-hot-toast';

const STATUS_OPCOES = [
  'PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO',
];

export default function VendedorPedidos() {
  const { usuario } = useAuth();
  const slug = usuario?.empresa?.slug;
  const qc = useQueryClient();

  const [detalhe, setDetalhe] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['vendedor-pedidos', slug, filtroStatus, pagina],
    queryFn: async () => {
      const params = new URLSearchParams({ pagina, limite: 10 });
      if (filtroStatus) params.set('status', filtroStatus);
      const { data } = await api.get(`/empresa/${slug}/pedidos?${params}`);
      return data;
    },
    enabled: !!slug,
  });

  const atualizarStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/pedidos/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries(['vendedor-pedidos', slug]);
      if (detalhe) {
        setDetalhe((d) => ({ ...d, status: detalhe.novoStatus }));
      }
      toast.success('Status atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sol-500" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <select
          className="input w-auto"
          value={filtroStatus}
          onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1); }}
        >
          <option value="">Todos os status</option>
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s}>{STATUS_PEDIDO[s]?.label || s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        {data?.pedidos?.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Nenhum pedido encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-left">
                <th className="pb-3">Protocolo</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Entrega</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Data</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.pedidos?.map((p) => {
                const st = STATUS_PEDIDO[p.status];
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-mono font-medium">{p.protocolo}</td>
                    <td className="py-3">{p.nomeCliente}</td>
                    <td className="py-3 font-semibold">{formatarMoeda(p.total)}</td>
                    <td className="py-3 text-gray-500">
                      {p.tipoEntrega === 'RETIRADA' ? '🏪 Retirada' : '🚚 Entrega'}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${st?.classe}`}>{st?.label}</span>
                    </td>
                    <td className="py-3 text-gray-400">{formatarData(p.criadoEm)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => setDetalhe(p)}
                        className="p-1.5 text-gray-400 hover:text-sol-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Paginação */}
        {data?.totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: data.totalPaginas }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPagina(p)}
                className={`w-8 h-8 rounded-full text-sm ${
                  p === pagina
                    ? 'bg-sol-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal detalhe */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{detalhe.protocolo}</h2>
                <p className="text-gray-500 text-sm">{formatarData(detalhe.criadoEm)}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Cliente */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
              <p><span className="font-medium">Cliente:</span> {detalhe.nomeCliente}</p>
              <p><span className="font-medium">Telefone:</span> {detalhe.telefoneCliente}</p>
              {detalhe.enderecoEntrega && (
                <p><span className="font-medium">Endereço:</span> {detalhe.enderecoEntrega}</p>
              )}
              <p><span className="font-medium">Entrega:</span> {detalhe.tipoEntrega === 'RETIRADA' ? '🏪 Retirada na loja' : '🚚 Entrega no endereço'}</p>
            </div>

            {/* Itens */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Itens do Pedido</h3>
              <div className="space-y-2">
                {detalhe.itens?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantidade}x {item.nomeProduto}</span>
                    <span className="font-medium">{formatarMoeda(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatarMoeda(detalhe.total)}</span>
              </div>
            </div>

            {/* Atualizar status */}
            <div>
              <label className="label">Atualizar Status</label>
              <div className="flex gap-2">
                <select
                  className="input flex-1"
                  defaultValue={detalhe.status}
                  onChange={(e) => setDetalhe({ ...detalhe, novoStatus: e.target.value })}
                >
                  {STATUS_OPCOES.map((s) => (
                    <option key={s} value={s}>{STATUS_PEDIDO[s]?.label || s}</option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    atualizarStatus.mutate({
                      id: detalhe.id,
                      status: detalhe.novoStatus || detalhe.status,
                    })
                  }
                  disabled={atualizarStatus.isPending}
                  className="btn-primary px-4"
                >
                  {atualizarStatus.isPending ? '...' : 'Salvar'}
                </button>
              </div>
            </div>

            {/* WhatsApp */}
            {detalhe.telefoneCliente && (
              <a
                href={`https://wa.me/55${detalhe.telefoneCliente.replace(/\D/g, '')}?text=Olá ${detalhe.nomeCliente}! Seu pedido ${detalhe.protocolo} está: ${STATUS_PEDIDO[detalhe.status]?.label}`}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp w-full mt-4 flex items-center justify-center gap-2"
              >
                📱 Contatar pelo WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
