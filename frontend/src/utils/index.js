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
    .map((i) => `   >> ${i.nome}\n      ${i.quantidade}x x ${formatarMoeda(i.preco)} = *${formatarMoeda(i.preco * i.quantidade)}*`)
    .join('\n')

  const total = itens.reduce((a, i) => a + parseFloat(i.preco) * i.quantidade, 0)

  const sep = '================================'

  let msg = `*[ USINA DO SOL ]*\n`
  msg += `*NOVO PEDIDO*\n`
  msg += `${sep}\n`
  if (empresaNome) {
    msg += `*Associacao:* ${empresaNome}\n`
    msg += `${sep}\n`
  }
  msg += `\n`
  msg += `*>> CLIENTE*\n`
  msg += `   Nome: *${clienteNome || 'Nao informado'}*\n`
  if (clienteTelefone) {
    msg += `   Tel: *${clienteTelefone}*\n`
  }
  msg += `\n`
  msg += `*>> PEDIDO*\n`
  msg += `   Protocolo: *${protocolo}*\n`
  msg += `   Data/Hora: ${dataHora}\n`
  msg += `\n`
  msg += `*>> ITENS*\n`
  msg += `${listaItens}\n`
  msg += `\n`
  msg += `${sep}\n`
  msg += `*TOTAL: ${formatarMoeda(total)}*\n`
  msg += `${sep}\n`
  msg += `\n`
  msg += `*>> ENTREGA*\n`
  msg += `   ${tipoEntrega === 'ENTREGA' ? 'Entrega no endereco' : 'Retirada na loja'}\n`
  if (tipoEntrega === 'ENTREGA' && endereco) {
    msg += `   Endereco: *${endereco}*\n`
  }
  if (observacao) {
    msg += `\n*Observacao:* ${observacao}\n`
  }
  msg += `\n`
  msg += `_Ola! Fiz um pedido pelo site Usina do Sol. Aguardo confirmacao!_`

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
