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
  // ─────────────────────────────────────────────────────────
  // REGRA: usar APENAS caracteres ASCII + formatacao WhatsApp
  //   *texto*  = negrito
  //   _texto_  = italico
  //   Separador: tracos simples (-)
  // ─────────────────────────────────────────────────────────
  const protocolo = pedido || ('PED-' + new Date().getFullYear() + '-XXXX')

  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const sep  = '-----------------------------'
  const sep2 = '============================='

  const listaItens = itens
    .map(function(i) {
      return (
        '   [' + (itens.indexOf(i) + 1) + '] *' + i.nome + '*\n' +
        '       ' + i.quantidade + 'x  x  ' + formatarMoeda(i.preco) +
        '  =  *' + formatarMoeda(i.preco * i.quantidade) + '*'
      )
    })
    .join('\n')

  const total = itens.reduce(function(a, i) {
    return a + parseFloat(i.preco) * i.quantidade
  }, 0)

  var msg = ''

  // CABECALHO
  msg += '*USINA DO SOL*\n'
  msg += '_Plataforma de Associacoes - UNEB_\n'
  msg += sep2 + '\n'

  // ASSOCIACAO
  if (empresaNome) {
    msg += '*Associacao:*\n'
    msg += '   ' + empresaNome + '\n'
    msg += sep + '\n'
  }

  // CLIENTE
  msg += '\n'
  msg += '*DADOS DO CLIENTE*\n'
  msg += '   Nome:  *' + (clienteNome || 'Nao informado') + '*\n'
  if (clienteTelefone) {
    msg += '   Fone:  *' + clienteTelefone + '*\n'
  }

  // PEDIDO
  msg += '\n'
  msg += '*DADOS DO PEDIDO*\n'
  msg += '   Protocolo: *' + protocolo + '*\n'
  msg += '   Data/Hora: ' + dataHora + '\n'

  // ITENS
  msg += '\n'
  msg += '*ITENS DO PEDIDO*\n'
  msg += sep + '\n'
  msg += listaItens + '\n'
  msg += sep + '\n'

  // TOTAL
  msg += '\n'
  msg += sep2 + '\n'
  msg += '   *TOTAL: ' + formatarMoeda(total) + '*\n'
  msg += sep2 + '\n'

  // ENTREGA
  msg += '\n'
  msg += '*ENTREGA*\n'
  if (tipoEntrega === 'ENTREGA') {
    msg += '   Tipo:  Entrega no endereco\n'
    if (endereco) {
      msg += '   Local: *' + endereco + '*\n'
    }
  } else {
    msg += '   Tipo:  Retirada na loja\n'
  }

  // OBSERVACAO
  if (observacao) {
    msg += '\n'
    msg += '*Observacao:*\n'
    msg += '   ' + observacao + '\n'
  }

  // RODAPE
  msg += '\n'
  msg += sep2 + '\n'
  msg += '_Ola! Fiz um pedido pelo site Usina do Sol._\n'
  msg += '_Aguardo a confirmacao. Obrigado!_'

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
