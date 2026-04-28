import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, Package, DollarSign } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatarMoeda, formatarData } from '../../utils';

function hoje() {
  return new Date().toISOString().split('T')[0];
}
function primeiroDiaMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function VendedorRelatorio() {
  const { usuario } = useAuth();
  const slug = usuario?.empresa?.slug;

  const [dataInicio, setDataInicio] = useState(primeiroDiaMes());
  const [dataFim, setDataFim] = useState(hoje());

  const { data: relatorio, isLoading, refetch } = useQuery({
    queryKey: ['vendedor-relatorio', slug, dataInicio, dataFim],
    queryFn: async () => {
      const { data } = await api.get(
        `/empresa/${slug}/relatorio?dataInicio=${dataInicio}&dataFim=${dataFim}`
      );
      return data;
    },
    enabled: !!slug,
  });

  const cards = [
    {
      titulo: 'Total de Pedidos',
      valor: relatorio?.totalPedidos ?? 0,
      icon: ShoppingBag,
      cor: 'bg-sol-100 text-sol-700',
    },
    {
      titulo: 'Receita Total',
      valor: formatarMoeda(relatorio?.receitaTotal ?? 0),
      icon: DollarSign,
      cor: 'bg-verde-100 text-verde-700',
    },
    {
      titulo: 'Ticket Médio',
      valor: formatarMoeda(relatorio?.ticketMedio ?? 0),
      icon: TrendingUp,
      cor: 'bg-terra-100 text-terra-700',
    },
    {
      titulo: 'Itens Vendidos',
      valor: relatorio?.totalItens ?? 0,
      icon: Package,
      cor: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatório de Vendas</h1>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Data Início</label>
            <input
              type="date"
              className="input"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Data Fim</label>
            <input
              type="date"
              className="input"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <button onClick={() => refetch()} className="btn-primary">
            Filtrar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sol-500" />
        </div>
      ) : (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.titulo} className="card">
                <div className={`inline-flex p-2 rounded-lg mb-3 ${c.cor}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{c.valor}</p>
                <p className="text-sm text-gray-500">{c.titulo}</p>
              </div>
            ))}
          </div>

          {/* Produtos mais vendidos */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              🏆 Produtos Mais Vendidos
            </h2>
            {relatorio?.produtosMaisVendidos?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma venda no período.</p>
            ) : (
              <div className="space-y-3">
                {relatorio?.produtosMaisVendidos?.map((p, i) => (
                  <div key={p.produtoId} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{p.nomeProduto}</p>
                      <p className="text-sm text-gray-500">{p.totalQuantidade} unidades vendidas</p>
                    </div>
                    <span className="font-semibold text-verde-700">
                      {formatarMoeda(p.totalReceita)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos por status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Pedidos por Status
            </h2>
            {relatorio?.pedidosPorStatus?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum pedido no período.</p>
            ) : (
              <div className="space-y-2">
                {relatorio?.pedidosPorStatus?.map((s) => (
                  <div key={s.status} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-gray-700">{s.status}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm">{s._count} pedidos</span>
                      <span className="font-semibold">{formatarMoeda(s._sum?.total || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
