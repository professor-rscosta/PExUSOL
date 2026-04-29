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

export const gerarMensagemWhatsApp = (
  pedido, itens, tipoEntrega, endereco, observacao,
  clienteNome = '', clienteTelefone = '', empresaNome = ''
) => {
  const protocolo = pedido || `PED-${new Date().getFullYear()}-XXXX`
  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const listaItens = itens
    .map((i) => `    ▸ ${i.nome}\n      ${i.quantidade}x × ${formatarMoeda(i.preco)} = *${formatarMoeda(i.preco * i.quantidade)}*`)
    .join('\n')

  const total = itens.reduce((a, i) => a + parseFloat(i.preco) * i.quantidade, 0)

  let msg = `☀️ *USINA DO SOL — NOVO PEDIDO*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  if (empresaNome) {
    msg += `🏪 *${empresaNome}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  }
  msg += `\n`
  msg += `👤 *CLIENTE*\n`
  msg += `   Nome: *${clienteNome || 'Não informado'}*\n`
  if (clienteTelefone) {
    msg += `   📱 Telefone: *${clienteTelefone}*\n`
  }
  msg += `\n`
  msg += `📋 *PEDIDO*\n`
  msg += `   🔖 Protocolo: *${protocolo}*\n`
  msg += `   📅 Data/Hora: ${dataHora}\n`
  msg += `\n`
  msg += `🛍️ *ITENS*\n`
  msg += `${listaItens}\n`
  msg += `\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  msg += `💰 *TOTAL: ${formatarMoeda(total)}*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  msg += `\n`
  msg += `🚚 *ENTREGA*\n`
  msg += `   ${tipoEntrega === 'ENTREGA' ? '🏠 Entrega no endereço' : '🏪 Retirada na loja'}\n`
  if (tipoEntrega === 'ENTREGA' && endereco) {
    msg += `   📍 ${endereco}\n`
  }
  if (observacao) {
    msg += `\n📝 *Observação:* ${observacao}\n`
  }
  msg += `\n`
  msg += `_Olá! Acabei de fazer um pedido pelo site Usina do Sol. Aguardo a confirmação!_ 😊🌻`

  return encodeURIComponent(msg)
}

export const getImagemUrl = (imagem) => {
  if (!imagem) return null
  if (imagem.startsWith('http')) return imagem
  // logos estáticas ficam em /public/logos/
  if (imagem.startsWith('logos/')) return `/${imagem}`
  // tudo mais fica em /uploads/
  return `/uploads/${imagem}`
}
