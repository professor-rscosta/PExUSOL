// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sun, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, carregando } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [verSenha, setVerSenha] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const usuario = await login(form.email, form.senha)
      toast.success(`Bem-vindo, ${usuario.nome.split(' ')[0]}!`)
      navigate(usuario.role === 'ADMIN' ? '/admin' : '/vendedor', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-50 via-white to-terra-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sol-400 to-terra-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-float">
            <Sun className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Usina do Sol</h1>
          <p className="text-gray-500 text-sm mt-1">Painel de Gestão</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Entrar no sistema</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={verSenha ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(!verSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {verSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-6" disabled={carregando}>
              {carregando ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          {/* Dicas de acesso */}
          <div className="mt-6 p-4 bg-sol-50 rounded-xl">
            <p className="text-xs font-semibold text-sol-700 mb-2">Acessos de demonstração:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>👑 Admin: <code>admin@usinado.sol</code> / <code>admin123</code></p>
              <p>🌻 Mangal: <code>vendedor@mangal.com</code> / <code>vendedor123</code></p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          <Link to="/" className="hover:text-sol-600">← Voltar para as lojas</Link>
        </p>
      </div>
    </div>
  )
}
