// src/pages/admin/Pedidos.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatarMoeda, formatarData, STATUS_PEDIDO } from '../../utils'

export default function AdminPedidos() {
  const qc = useQueryClient()
  const [empresaId, setEmpresaId] = useState('')
  const [pedidoDetalhe, setPedidoDetalhe] = useState(null)

  const { data: empresas = [] } = useQuery({
    queryKey: ['admin-empresas'],
    queryFn: async () => (await api.get('/admin/empresas')).data,
  })

  const { data: dados } = useQuery({
    queryKey: ['admin-pedidos', empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await api.get(`/admin/pedidos/${empresaId}`)).data,
  })

  const atualizarStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/pedidos/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pedidos'] })
      toast.success('Status atualizado!')
      setPedidoDetalhe(null)
    },
  })

  const pedidos = dados?.pedidos || []

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h1>

      {/* Filtro empresa */}
      <div className="mb-4">
        <select className="input max-w-xs" value={empresaId} onChange={e => setEmpresaId(e.target.value)}>
          <option value="">Selecione uma empresa...</option>
          {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
        </select>
      </div>

      {pedidos.length === 0 && empresaId && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>Nenhum pedido encontrado</p>
        </div>
      )}

      {pedidos.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Protocolo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedidos.map((p) => {
                const statusInfo = STATUS_PEDIDO[p.status]
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm font-bold text-gray-800">{p.protocolo}</p>
                      <p className="text-xs text-gray-400">{formatarData(p.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{p.clienteNome}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusInfo.cor}`}>{statusInfo.label}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-sol-700 text-sm">{formatarMoeda(p.total)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setPedidoDetalhe(p)} className="text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalhe */}
      {pedidoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-md p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <h2 className="font-bold text-lg mb-1">{pedidoDetalhe.protocolo}</h2>
            <p className="text-sm text-gray-400 mb-4">{formatarData(pedidoDetalhe.createdAt)}</p>

            <div className="space-y-2 mb-4">
              <p className="text-sm"><span className="font-medium">Cliente:</span> {pedidoDetalhe.clienteNome}</p>
              <p className="text-sm"><span className="font-medium">Entrega:</span> {pedidoDetalhe.tipoEntrega}</p>
              {pedidoDetalhe.clienteEndereco && <p className="text-sm"><span className="font-medium">Endereço:</span> {pedidoDetalhe.clienteEndereco}</p>}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              {pedidoDetalhe.itens?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.produto?.nome} x{item.quantidade}</span>
                  <span className="font-medium">{formatarMoeda(item.preco * item.quantidade)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-sol-700">{formatarMoeda(pedidoDetalhe.total)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Alterar Status</label>
              <select className="input" defaultValue={pedidoDetalhe.status}
                onChange={e => atualizarStatus.mutate({ id: pedidoDetalhe.id, status: e.target.value })}>
                {Object.entries(STATUS_PEDIDO).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <button onClick={() => setPedidoDetalhe(null)} className="btn-secondary w-full">Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
