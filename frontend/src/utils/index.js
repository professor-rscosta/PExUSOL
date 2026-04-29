// src/utils/index.js

export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor) || 0)
}

export const formatarData = (data) => {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(data))
}

export const formatarDataCurta = (data) => {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(data))
}

export const STATUS_PEDIDO = {
  PENDENTE:    { label: '⏳ Pendente',    classe: 'badge-pendente' },
  CONFIRMADO:  { label: '✅ Confirmado',  classe: 'badge-confirmado' },
  EM_PREPARO:  { label: '🍳 Em Preparo',  classe: 'badge-preparo' },
  PRONTO:      { label: '📦 Pronto',      classe: 'badge-pronto' },
  ENTREGUE:    { label: '🎉 Entregue',    classe: 'badge-entregue' },
  CANCELADO:   { label: '❌ Cancelado',   classe: 'badge-cancelado' },
  // aliases legados
  PREPARANDO:  { label: '🍳 Em Preparo',  classe: 'badge-preparo' },
  ENVIADO:     { label: '🚚 Enviado',     classe: 'badge-pronto' },
}

export const gerarMensagemWhatsApp = (pedido, itens, tipoEntrega, endereco, observacao) => {
  const protocolo = pedido || `PED-${new Date().getFullYear()}-XXXX`
  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const listaItens = itens
    .map((i) => `  • ${i.nome} x${i.quantidade} — ${formatarMoeda(i.preco * i.quantidade)}`)
    .join('\n')

  const total = itens.reduce((a, i) => a + parseFloat(i.preco) * i.quantidade, 0)

  let msg = `🌞 *PEDIDO — USINA DO SOL*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━\n`
  msg += `📋 Protocolo: *${protocolo}*\n`
  msg += `📅 Data/Hora: ${dataHora}\n\n`
  msg += `🛍️ *ITENS DO PEDIDO:*\n`
  msg += `${listaItens}\n\n`
  msg += `💰 *Total: ${formatarMoeda(total)}*\n\n`
  msg += `🚚 Entrega: *${tipoEntrega === 'ENTREGA' ? '🏠 Entrega no endereço' : '🏪 Retirada na loja'}*\n`
  if (tipoEntrega === 'ENTREGA' && endereco) {
    msg += `📍 Endereço: ${endereco}\n`
  }
  if (observacao) {
    msg += `📝 Obs: ${observacao}\n`
  }
  msg += `\n_Aguardo confirmação do pedido!_ 😊`

  return encodeURIComponent(msg)
}

export const getImagemUrl = (imagem) => {
  if (!imagem) return null
  if (imagem.startsWith('http')) return imagem
  return `/uploads/${imagem}`
}
