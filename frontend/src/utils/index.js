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
  clienteNome = '', clienteTelefone = '', empresaNome = '',
  baseUrl = 'https://www.pexusol.rscacademy.com.br'
) => {
  const protocolo = pedido || ('PED-' + new Date().getFullYear() + '-XXXX')
  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const total = itens.reduce((a, i) => a + parseFloat(i.preco) * i.quantidade, 0)

  const listaItens = itens
    .map((i, idx) =>
      '  ' + (idx + 1) + '. ' + i.nome + '\n' +
      '     ' + i.quantidade + 'x de ' + formatarMoeda(i.preco) + ' = ' + formatarMoeda(i.preco * i.quantidade)
    )
    .join('\n')

  const L1 = '================================'
  const L2 = '--------------------------------'
  const trackUrl = baseUrl + '/rastrear/' + protocolo

  let m = ''
  m += '*[ USINA DO SOL ]*' + '\n'
  m += '_Plataforma de Associacoes - UNEB_' + '\n'
  m += L1 + '\n'
  m += '\n'

  if (empresaNome) {
    m += '*Associacao*' + '\n'
    m += empresaNome + '\n'
    m += L2 + '\n'
    m += '\n'
  }

  m += '*CLIENTE*' + '\n'
  m += 'Nome...: *' + (clienteNome || 'Nao informado') + '*' + '\n'
  if (clienteTelefone) {
    m += 'Fone...: *' + clienteTelefone + '*' + '\n'
  }
  m += '\n'

  m += '*PEDIDO*' + '\n'
  m += 'Protocolo: *' + protocolo + '*' + '\n'
  m += 'Data/Hora: ' + dataHora + '\n'
  m += '\n'

  m += '*ITENS*' + '\n'
  m += L2 + '\n'
  m += listaItens + '\n'
  m += L2 + '\n'
  m += '\n'

  m += L1 + '\n'
  m += '*TOTAL: ' + formatarMoeda(total) + '*' + '\n'
  m += L1 + '\n'
  m += '\n'

  m += '*ENTREGA*' + '\n'
  if (tipoEntrega === 'ENTREGA') {
    m += 'Tipo...: Entrega no endereco' + '\n'
    if (endereco) m += 'Local..: *' + endereco + '*' + '\n'
  } else {
    m += 'Tipo...: Retirada na loja' + '\n'
  }

  if (observacao) {
    m += '\n*Obs.:* ' + observacao + '\n'
  }

  m += '\n'
  m += L1 + '\n'
  m += '_Pedido realizado pelo site Usina do Sol._' + '\n'
  m += '_Aguardo confirmacao. Obrigado!_' + '\n'
  m += '\n'
  m += L2 + '\n'
  m += '*ACOMPANHE SEU PEDIDO:*' + '\n'
  m += trackUrl + '\n'
  m += '_Clique no link acima para ver o status em tempo real_' + '\n'
  m += L2

  return encodeURIComponent(m)
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
  // já tem prefixo correto (produtos/ ou empresas/)
  if (imagem.startsWith('produtos/') || imagem.startsWith('empresas/')) return `/uploads/${imagem}`
  // legado: arquivo sem prefixo — tenta em uploads/produtos/
  if (imagem.includes('.')) return `/uploads/produtos/${imagem}`
  return `/uploads/${imagem}`
}
