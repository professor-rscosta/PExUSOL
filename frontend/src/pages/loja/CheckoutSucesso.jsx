// src/pages/loja/CheckoutSucesso.jsx
import { useLocation, Link } from 'react-router-dom'
import { CheckCircle, MessageCircle, Home } from 'lucide-react'

export default function CheckoutSucesso() {
  const { state } = useLocation()

  if (!state?.pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Link to="/" className="btn-primary">Voltar ao início</Link>
        </div>
      </div>
    )
  }

  const { pedido, whatsapp, msg } = state
  const waUrl = `https://wa.me/${whatsapp}?text=${msg}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido registrado! 🎉</h1>
        <p className="text-gray-500 mb-2">
          Protocolo: <strong className="text-gray-800">{pedido.protocolo}</strong>
        </p>
        <p className="text-gray-500 mb-8">
          Clique no botão abaixo para enviar seu pedido pelo WhatsApp e aguardar a confirmação.
        </p>

        <div className="card p-6 mb-6">
          <div className="text-4xl mb-3">📲</div>
          <p className="text-sm text-gray-600 mb-4">
            A mensagem com todos os detalhes já está preparada. Basta clicar e enviar!
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle className="w-6 h-6" />
            Abrir WhatsApp e Enviar Pedido
          </a>
        </div>

        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm">
          <Home className="w-4 h-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
