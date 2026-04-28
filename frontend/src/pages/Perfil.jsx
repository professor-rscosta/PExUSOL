// src/pages/Perfil.jsx
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, MapPin, Lock, Save, Search } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

// ── Máscaras ───────────────────────────────────────────────
const maskCPF = (v) =>
  v.replace(/\D/g,'').slice(0,11)
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2')

const maskTel = (v) =>
  v.replace(/\D/g,'').slice(0,11)
    .replace(/(\d{2})(\d)/,'($1) $2')
    .replace(/(\d{5})(\d)/,'$1-$2')

const maskCEP = (v) =>
  v.replace(/\D/g,'').slice(0,8)
    .replace(/(\d{5})(\d)/,'$1-$2')

// ── Validar CPF ────────────────────────────────────────────
function validarCPF(cpf) {
  const c = cpf.replace(/\D/g,'')
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i)
  let r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== +c[9]) return false
  s = 0
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i)
  r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === +c[10]
}

export default function Perfil() {
  const { usuario: usuarioCtx, atualizarUsuario } = useAuth()
  const qc = useQueryClient()
  const [aba, setAba] = useState('dados')
  const [buscandoCep, setBuscandoCep] = useState(false)

  // ── Estado do formulário ──────────────────────────────────
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '',
    logradouro: '', numero: '', complemento: '',
    bairro: '', cep: '', cidade: '', estado: 'BA',
  })
  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [cpfErro, setCpfErro] = useState('')

  // ── Busca perfil atual ─────────────────────────────────────
  const { data: perfil } = useQuery({
    queryKey: ['perfil'],
    queryFn: async () => (await api.get('/auth/perfil')).data,
  })

  useEffect(() => {
    if (perfil) {
      setForm({
        nome: perfil.nome || '',
        cpf: perfil.cpf || '',
        telefone: perfil.telefone || '',
        logradouro: perfil.endereco?.logradouro || '',
        numero: perfil.endereco?.numero || '',
        complemento: perfil.endereco?.complemento || '',
        bairro: perfil.endereco?.bairro || '',
        cep: perfil.endereco?.cep || '',
        cidade: perfil.endereco?.cidade || '',
        estado: perfil.endereco?.estado || 'BA',
      })
    }
  }, [perfil])

  // ── Buscar CEP via ViaCEP ─────────────────────────────────
  const buscarCEP = async () => {
    const cep = form.cep.replace(/\D/g,'')
    if (cep.length !== 8) return toast.error('CEP incompleto')
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) return toast.error('CEP não encontrado')
      setForm(f => ({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
      }))
      toast.success('Endereço preenchido automaticamente!')
    } catch {
      toast.error('Erro ao buscar CEP')
    } finally {
      setBuscandoCep(false)
    }
  }

  // ── Salvar perfil ─────────────────────────────────────────
  const salvarPerfil = useMutation({
    mutationFn: () => api.put('/auth/perfil', {
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone,
      endereco: {
        logradouro: form.logradouro,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cep: form.cep,
        cidade: form.cidade,
        estado: form.estado,
      },
    }),
    onSuccess: (res) => {
      qc.invalidateQueries(['perfil'])
      if (atualizarUsuario) atualizarUsuario(res.data.usuario)
      toast.success('Perfil atualizado com sucesso!')
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro ao salvar'),
  })

  // ── Alterar senha ─────────────────────────────────────────
  const alterarSenha = useMutation({
    mutationFn: () => api.put('/auth/senha', {
      senhaAtual: senhaForm.senhaAtual,
      novaSenha: senhaForm.novaSenha,
    }),
    onSuccess: () => {
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmar: '' })
      toast.success('Senha alterada com sucesso!')
    },
    onError: (err) => toast.error(err.response?.data?.erro || 'Erro ao alterar senha'),
  })

  const handleSalvar = () => {
    if (!form.nome.trim()) return toast.error('Nome obrigatório')
    if (form.cpf && !validarCPF(form.cpf)) {
      setCpfErro('CPF inválido')
      return
    }
    setCpfErro('')
    salvarPerfil.mutate()
  }

  const handleSenha = () => {
    if (!senhaForm.senhaAtual || !senhaForm.novaSenha) return toast.error('Preencha todos os campos')
    if (senhaForm.novaSenha.length < 6) return toast.error('Nova senha deve ter no mínimo 6 caracteres')
    if (senhaForm.novaSenha !== senhaForm.confirmar) return toast.error('As senhas não coincidem')
    alterarSenha.mutate()
  }

  const abas = [
    { id: 'dados', label: 'Meus Dados', icon: User },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'senha', label: 'Alterar Senha', icon: Lock },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">Gerencie seus dados pessoais e endereço</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              aba === a.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <a.icon className="w-4 h-4" />
            {a.label}
          </button>
        ))}
      </div>

      {/* ── ABA: DADOS PESSOAIS ─────────────────────────────── */}
      {aba === 'dados' && (
        <div className="card max-w-lg">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Dados Pessoais
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Nome Completo *</label>
              <input className="input" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Seu nome completo" />
            </div>

            <div>
              <label className="label">CPF</label>
              <input
                className={`input ${cpfErro ? 'border-red-400 focus:ring-red-300' : ''}`}
                value={form.cpf}
                onChange={(e) => {
                  const v = maskCPF(e.target.value)
                  setForm({ ...form, cpf: v })
                  if (cpfErro) setCpfErro('')
                }}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {cpfErro && <p className="text-red-500 text-xs mt-1">{cpfErro}</p>}
              {form.cpf && form.cpf.replace(/\D/g,'').length === 11 && !cpfErro && (
                <p className={`text-xs mt-1 ${validarCPF(form.cpf) ? 'text-green-600' : 'text-red-500'}`}>
                  {validarCPF(form.cpf) ? '✅ CPF válido' : '❌ CPF inválido'}
                </p>
              )}
            </div>

            <div>
              <label className="label">Telefone (WhatsApp)</label>
              <input className="input" value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: maskTel(e.target.value) })}
                placeholder="(77) 99999-9999"
                maxLength={15} />
            </div>

            <div>
              <label className="label">E-mail</label>
              <input className="input bg-gray-50 cursor-not-allowed" value={perfil?.email || ''} disabled />
              <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p>
            </div>

            <div>
              <label className="label">Perfil</label>
              <input className="input bg-gray-50 cursor-not-allowed"
                value={perfil?.role === 'ADMIN' ? 'Administrador' : 'Vendedor'} disabled />
            </div>

            <button
              onClick={handleSalvar}
              disabled={salvarPerfil.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {salvarPerfil.isPending ? 'Salvando...' : 'Salvar Dados'}
            </button>
          </div>
        </div>
      )}

      {/* ── ABA: ENDEREÇO ───────────────────────────────────── */}
      {aba === 'endereco' && (
        <div className="card max-w-lg">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" /> Endereço
          </h2>
          <div className="space-y-4">
            {/* CEP com busca automática */}
            <div>
              <label className="label">CEP</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: maskCEP(e.target.value) })}
                  placeholder="00000-000"
                  maxLength={9}
                />
                <button
                  onClick={buscarCEP}
                  disabled={buscandoCep}
                  className="btn-secondary flex items-center gap-1.5 px-4 flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                  {buscandoCep ? '...' : 'Buscar'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Clique em "Buscar" para preencher automaticamente</p>
            </div>

            <div>
              <label className="label">Logradouro (Rua, Avenida, etc.)</label>
              <input className="input" value={form.logradouro}
                onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                placeholder="Ex: Rua das Flores" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Número</label>
                <input className="input" value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="Ex: 300 ou S/N" />
              </div>
              <div>
                <label className="label">Complemento</label>
                <input className="input" value={form.complemento}
                  onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                  placeholder="Ex: Apto 203" />
              </div>
            </div>

            <div>
              <label className="label">Bairro</label>
              <input className="input" value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                placeholder="Ex: Centro" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cidade</label>
                <input className="input" value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  placeholder="Ex: Bom Jesus da Lapa" />
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="input" value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {ESTADOS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSalvar}
              disabled={salvarPerfil.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {salvarPerfil.isPending ? 'Salvando...' : 'Salvar Endereço'}
            </button>
          </div>
        </div>
      )}

      {/* ── ABA: SENHA ──────────────────────────────────────── */}
      {aba === 'senha' && (
        <div className="card max-w-lg">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-600" /> Alterar Senha
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Senha Atual</label>
              <input type="password" className="input"
                value={senhaForm.senhaAtual}
                onChange={(e) => setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })}
                placeholder="Sua senha atual" />
            </div>
            <div>
              <label className="label">Nova Senha</label>
              <input type="password" className="input"
                value={senhaForm.novaSenha}
                onChange={(e) => setSenhaForm({ ...senhaForm, novaSenha: e.target.value })}
                placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="label">Confirmar Nova Senha</label>
              <input type="password" className="input"
                value={senhaForm.confirmar}
                onChange={(e) => setSenhaForm({ ...senhaForm, confirmar: e.target.value })}
                placeholder="Repita a nova senha" />
              {senhaForm.confirmar && senhaForm.novaSenha !== senhaForm.confirmar && (
                <p className="text-red-500 text-xs mt-1">❌ As senhas não coincidem</p>
              )}
              {senhaForm.confirmar && senhaForm.novaSenha === senhaForm.confirmar && senhaForm.novaSenha && (
                <p className="text-green-600 text-xs mt-1">✅ Senhas conferem</p>
              )}
            </div>
            <button
              onClick={handleSenha}
              disabled={alterarSenha.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {alterarSenha.isPending ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
