// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usina_usuario')
    return saved ? JSON.parse(saved) : null
  })
  const [carregando, setCarregando] = useState(false)

  const login = async (email, senha) => {
    setCarregando(true)
    try {
      const { data } = await api.post('/auth/login', { email, senha })
      localStorage.setItem('usina_token', data.token)
      localStorage.setItem('usina_usuario', JSON.stringify(data.usuario))
      setUsuario(data.usuario)
      return data.usuario
    } finally {
      setCarregando(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('usina_token')
    localStorage.removeItem('usina_usuario')
    setUsuario(null)
  }

  const isAdmin = usuario?.role === 'ADMIN'
  const isVendedor = usuario?.role === 'VENDEDOR'

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando, isAdmin, isVendedor }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
