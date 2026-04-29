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
  const protocolo = pedido || ('PED-' + new Date().getFullYear() + '-XXXX')
  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const sep  = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'
  const sep2 = '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'

  const listaItens = itens
    .map(function(i, idx) {
      return (
        '   ' + (idx + 1) + '. *' + i.nome + '*\n' +
        '       ' + i.quantidade + 'x \u00d7 ' + formatarMoeda(i.preco) +
        ' = *' + formatarMoeda(i.preco * i.quantidade) + '*'
      )
    })
    .join('\n')

  const total = itens.reduce(function(a, i) {
    return a + parseFloat(i.preco) * i.quantidade
  }, 0)

  var msg = ''

  msg += '\uD83C\uDF1E *USINA DO SOL \u2014 NOVO PEDIDO* \uD83C\uDF1E\n'
  msg += sep2 + '\n'
  if (empresaNome) {
    msg += '\uD83C\uDFEA *' + empresaNome + '*\n'
    msg += sep + '\n'
  }
  msg += '\n'
  msg += '\uD83D\uDC64 *CLIENTE*\n'
  msg += '   Nome: *' + (clienteNome || 'Nao informado') + '*\n'
  if (clienteTelefone) {
    msg += '   \uD83D\uDCF1 Tel: *' + clienteTelefone + '*\n'
  }
  msg += '\n'
  msg += '\uD83D\uDCCB *DADOS DO PEDIDO*\n'
  msg += '   \uD83D\uDD16 Protocolo: *' + protocolo + '*\n'
  msg += '   \uD83D\uDCC5 Data/Hora: ' + dataHora + '\n'
  msg += '\n'
  msg += '\uD83D\uDED2 *ITENS DO PEDIDO*\n'
  msg += sep + '\n'
  msg += listaItens + '\n'
  msg += sep + '\n'
  msg += '\n'
  msg += sep2 + '\n'
  msg += '\uD83D\uDCB0 *TOTAL: ' + formatarMoeda(total) + '*\n'
  msg += sep2 + '\n'
  msg += '\n'
  msg += '\uD83D\uDE9A *ENTREGA*\n'
  if (tipoEntrega === 'ENTREGA') {
    msg += '   \uD83C\uDFE0 Entrega no endere\u00e7o\n'
    if (endereco) {
      msg += '   \uD83D\uDCCD *' + endereco + '*\n'
    }
  } else {
    msg += '   \uD83C\uDFEA Retirada na loja\n'
  }
  if (observacao) {
    msg += '\n'
    msg += '\uD83D\uDCDD *Observa\u00e7\u00e3o:* ' + observacao + '\n'
  }
  msg += '\n'
  msg += '_Ol\u00e1! Fiz um pedido pelo site Usina do Sol._\n'
  msg += '_Aguardo a confirma\u00e7\u00e3o. Obrigado!_ \uD83D\uDE0A\uD83C\uDF1B'

  return encodeURIComponent(msg)
}


// Funcao auxiliar para abrir WhatsApp diretamente
export const enviarWhatsApp = function(numero, mensagemCodificada) {
  // Remove tudo que nao e numero
  var num = String(numero).replace(/\D/g, '')
  // Garante codigo do Brasil
  if (!num.startsWith('55')) num = '55' + num
  var url = 'https://wa.me/' + num + '?text=' + mensagemCodificada
  window.open(url, '_blank')
}


export const getImagemUrl = (imagem) => {
  if (!imagem) return null
  if (imagem.startsWith('http')) return imagem
  // logos estáticas ficam em /public/logos/
  if (imagem.startsWith('logos/')) return `/${imagem}`
  // tudo mais fica em /uploads/
  return `/uploads/${imagem}`
}
