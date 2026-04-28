// src/pages/admin/Dashboard.jsx
import { useQuery } from '@tanstack/react-query'
import { Building2, Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import api from '../../api/axios'
import { formatarMoeda } from '../../utils'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
  const { usuario } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard')
      return data
    },
  })

  const cards = stats ? [
    { label: 'Empresas Ativas', valor: stats.totalEmpresas, icon: Building2, cor: 'bg-blue-50 text-blue-600' },
    { label: 'Produtos Ativos', valor: stats.totalProdutos, icon: Package, cor: 'bg-sol-50 text-sol-600' },
    { label: 'Pedidos do Mês', valor: stats.pedidosMes, icon: ShoppingBag, cor: 'bg-purple-50 text-purple-600' },
    { label: 'Receita do Mês', valor: formatarMoeda(stats.receitaMes), icon: TrendingUp, cor: 'bg-verde-50 text-verde-600', isValor: true },
  ] : []

  return (
    <div className="page-container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Bom dia, {usuario?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Painel Administrativo — Usina do Sol</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, valor, icon: Icon, cor }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cor} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{valor}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Ranking Empresas */}
      {stats?.empresasRanking?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sol-500" />
            Ranking de Vendas
          </h2>
          <div className="space-y-3">
            {stats.empresasRanking.map((emp, i) => (
              <div key={emp.slug} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-sol-100 text-sol-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{emp.nome}</p>
                  <p className="text-xs text-gray-400">{emp.pedidos} pedidos</p>
                </div>
                <span className="font-bold text-sol-700 text-sm">{formatarMoeda(emp.receita)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Geral */}
      {stats && (
        <div className="mt-4 p-4 bg-gradient-to-r from-sol-50 to-terra-50 rounded-2xl border border-sol-100">
          <p className="text-sm text-gray-500">Receita Total (todos os tempos)</p>
          <p className="text-3xl font-bold text-sol-700 mt-1">{formatarMoeda(stats.receitaTotal)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{stats.totalPedidos} pedidos no total</p>
        </div>
      )}
    </div>
  )
}
