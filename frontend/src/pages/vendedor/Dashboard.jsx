import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatarMoeda, formatarData, STATUS_PEDIDO } from '../../utils';

export default function VendedorDashboard() {
  const { usuario } = useAuth();
  const slug = usuario?.empresa?.slug;

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['vendedor-dashboard', slug],
    queryFn: async () => {
      const { data } = await api.get(`/empresas/${slug}/dashboard`);
      return data;
    },
    enabled: !!slug,
  });

  const { data: pedidosRecentes } = useQuery({
    queryKey: ['pedidos-recentes', slug],
    queryFn: async () => {
      const { data } = await api.get(`/empresa/${slug}/pedidos?limite=5`);
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sol-500" />
      </div>
    );
  }

  const cards = [
    {
      titulo: 'Pedidos Hoje',
      valor: dashboard?.pedidosHoje ?? 0,
      icon: ShoppingBag,
      cor: 'bg-sol-100 text-sol-700',
    },
    {
      titulo: 'Pedidos do Mês',
      valor: dashboard?.pedidosMes ?? 0,
      icon: Package,
      cor: 'bg-terra-100 text-terra-700',
    },
    {
      titulo: 'Receita do Mês',
      valor: formatarMoeda(dashboard?.receitaMes ?? 0),
      icon: TrendingUp,
      cor: 'bg-verde-100 text-verde-700',
    },
    {
      titulo: 'Produtos Ativos',
      valor: dashboard?.produtosAtivos ?? 0,
      icon: AlertCircle,
      cor: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {usuario?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {usuario?.empresa?.nome} — resumo do dia
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.titulo} className="card">
            <div className={`inline-flex p-2 rounded-lg mb-3 ${card.cor}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.valor}</p>
            <p className="text-sm text-gray-500">{card.titulo}</p>
          </div>
        ))}
      </div>

      {/* Pedidos recentes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Últimos Pedidos
        </h2>
        {pedidosRecentes?.pedidos?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum pedido ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="pb-2">Protocolo</th>
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecentes?.pedidos?.map((p) => {
                  const st = STATUS_PEDIDO[p.status];
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-mono font-medium">{p.protocolo}</td>
                      <td className="py-2">{p.nomeCliente}</td>
                      <td className="py-2">{formatarMoeda(p.total)}</td>
                      <td className="py-2">
                        <span className={`badge ${st?.classe}`}>{st?.label}</span>
                      </td>
                      <td className="py-2 text-gray-400">{formatarData(p.criadoEm)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
