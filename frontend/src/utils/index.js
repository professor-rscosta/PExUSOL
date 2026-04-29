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

  // Emojis gerados em RUNTIME via String.fromCodePoint
  // Isso evita qualquer corrupcao pelo Vite/esbuild no build
  const e = {
    sol:     String.fromCodePoint(0x1F31E), // 🌞
    loja:    String.fromCodePoint(0x1F3EA), // 🏬
    cliente: String.fromCodePoint(0x1F464), // 👤
    tel:     String.fromCodePoint(0x1F4F1), // 📱
    pedido:  String.fromCodePoint(0x1F4CB), // 📋
    proto:   String.fromCodePoint(0x1F516), // 🔖
    data:    String.fromCodePoint(0x1F4C5), // 📅
    itens:   String.fromCodePoint(0x1F6D2), // 🛒
    total:   String.fromCodePoint(0x1F4B0), // 💰
    entrega: String.fromCodePoint(0x1F69A), // 🚚
    pin:     String.fromCodePoint(0x1F4CD), // 📍
    obs:     String.fromCodePoint(0x1F4DD), // 📝
    casa:    String.fromCodePoint(0x1F3E0), // 🏠
    smile:   String.fromCodePoint(0x1F60A), // 😊
    flor:    String.fromCodePoint(0x1F33B), // 🌻
    ok:      String.fromCodePoint(0x2705),  // ✅
  }

  const sep  = '──────────────────────────────'
  const sep2 = '══════════════════════════════'

  const listaItens = itens
    .map(function(i, idx) {
      return (
        '   ' + e.ok + ' *' + i.nome + '*\n' +
        '       ' + i.quantidade + 'x × ' + formatarMoeda(i.preco) +
        ' = *' + formatarMoeda(i.preco * i.quantidade) + '*'
      )
    })
    .join('\n')

  const total = itens.reduce(function(a, i) {
    return a + parseFloat(i.preco) * i.quantidade
  }, 0)

  var msg = ''
  msg += e.sol + ' *USINA DO SOL — NOVO PEDIDO* ' + e.sol + '\n'
  msg += sep2 + '\n'
  if (empresaNome) {
    msg += e.loja + ' *' + empresaNome + '*\n'
    msg += sep + '\n'
  }
  msg += '\n'
  msg += e.cliente + ' *CLIENTE*\n'
  msg += '   Nome: *' + (clienteNome || 'Não informado') + '*\n'
  if (clienteTelefone) {
    msg += '   ' + e.tel + ' Tel: *' + clienteTelefone + '*\n'
  }
  msg += '\n'
  msg += e.pedido + ' *DADOS DO PEDIDO*\n'
  msg += '   ' + e.proto + ' Protocolo: *' + protocolo + '*\n'
  msg += '   ' + e.data  + ' Data/Hora: ' + dataHora + '\n'
  msg += '\n'
  msg += e.itens + ' *ITENS DO PEDIDO*\n'
  msg += sep + '\n'
  msg += listaItens + '\n'
  msg += sep + '\n'
  msg += '\n'
  msg += sep2 + '\n'
  msg += e.total + ' *TOTAL: ' + formatarMoeda(total) + '*\n'
  msg += sep2 + '\n'
  msg += '\n'
  msg += e.entrega + ' *ENTREGA*\n'
  if (tipoEntrega === 'ENTREGA') {
    msg += '   ' + e.casa + ' Entrega no endereço\n'
    if (endereco) {
      msg += '   ' + e.pin + ' *' + endereco + '*\n'
    }
  } else {
    msg += '   ' + e.loja + ' Retirada na loja\n'
  }
  if (observacao) {
    msg += '\n' + e.obs + ' *Observação:* ' + observacao + '\n'
  }
  msg += '\n'
  msg += '_Olá! Fiz um pedido pelo site Usina do Sol._\n'
  msg += '_Aguardo a confirmação. Obrigado!_ ' + e.smile + e.flor

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
