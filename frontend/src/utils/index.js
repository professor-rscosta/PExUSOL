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

  // Emojis via Unicode para garantir compatibilidade
  const E = {
    sol:     '\uD83C\uDF1E', // 🌞
    loja:    '\uD83C\uDFEA', // 🏬
    cliente: '\uD83D\uDC64', // 👤
    tel:     '\uD83D\uDCF1', // 📱
    pedido:  '\uD83D\uDCCB', // 📋
    proto:   '\uD83D\uDD16', // 🔖
    data:    '\uD83D\uDCC5', // 📅
    itens:   '\uD83D\uDED2', // 🛒
    total:   '\uD83D\uDCB0', // 💰
    entrega: '\uD83D\uDE9A', // 🚚
    pin:     '\uD83D\uDCCD', // 📍
    obs:     '\uD83D\uDCDD', // 📝
    casa:    '\uD83C\uDFE0', // 🏠
    ok:      '\u2705',        // ✅
    flor:    '\uD83C\uDF3B', // 🌻
    smile:   '\uD83D\uDE0A', // 😊
  }

  const listaItens = itens
    .map((i) => `   ${E.ok} ${i.nome}\n       ${i.quantidade}x × ${formatarMoeda(i.preco)} = *${formatarMoeda(i.preco * i.quantidade)}*`)
    .join('\n')

  const total = itens.reduce((a, i) => a + parseFloat(i.preco) * i.quantidade, 0)

  let msg = `${E.sol} *USINA DO SOL — NOVO PEDIDO* ${E.sol}\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  if (empresaNome) {
    msg += `${E.loja} *${empresaNome}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  }
  msg += `\n`
  msg += `${E.cliente} *CLIENTE*\n`
  msg += `   Nome: *${clienteNome || 'Não informado'}*\n`
  if (clienteTelefone) {
    msg += `   ${E.tel} Tel: *${clienteTelefone}*\n`
  }
  msg += `\n`
  msg += `${E.pedido} *DADOS DO PEDIDO*\n`
  msg += `   ${E.proto} Protocolo: *${protocolo}*\n`
  msg += `   ${E.data} Data/Hora: ${dataHora}\n`
  msg += `\n`
  msg += `${E.itens} *ITENS DO PEDIDO*\n`
  msg += `${listaItens}\n`
  msg += `\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  msg += `${E.total} *TOTAL: ${formatarMoeda(total)}*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  msg += `\n`
  msg += `${E.entrega} *ENTREGA*\n`
  msg += `   ${tipoEntrega === 'ENTREGA' ? E.casa + ' Entrega no endereço' : E.loja + ' Retirada na loja'}\n`
  if (tipoEntrega === 'ENTREGA' && endereco) {
    msg += `   ${E.pin} *${endereco}*\n`
  }
  if (observacao) {
    msg += `\n${E.obs} *Observação:* ${observacao}\n`
  }
  msg += `\n`
  msg += `_Olá! Fiz um pedido pelo site Usina do Sol. Aguardo confirmação!_ ${E.smile}${E.flor}`

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
