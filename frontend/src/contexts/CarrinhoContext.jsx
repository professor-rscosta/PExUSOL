// src/contexts/CarrinhoContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'

const CarrinhoContext = createContext(null)

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([])
  const [empresaSlug, setEmpresaSlug] = useState(null)

  const adicionar = useCallback((produto, quantidade = 1) => {
    // Verifica se é de outra empresa
    if (empresaSlug && empresaSlug !== produto.empresa?.slug && itens.length > 0) {
      const confirma = window.confirm(
        'Seu carrinho tem itens de outra loja. Deseja limpar e adicionar este produto?'
      )
      if (!confirma) return false
      setItens([])
    }

    setEmpresaSlug(produto.empresa?.slug || empresaSlug)

    setItens((prev) => {
      const existe = prev.find((i) => i.id === produto.id)
      if (existe) {
        return prev.map((i) =>
          i.id === produto.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        )
      }
      return [...prev, { ...produto, quantidade }]
    })
    return true
  }, [itens, empresaSlug])

  const remover = useCallback((id) => {
    setItens((prev) => {
      const novos = prev.filter((i) => i.id !== id)
      if (novos.length === 0) setEmpresaSlug(null)
      return novos
    })
  }, [])

  const alterarQuantidade = useCallback((id, quantidade) => {
    if (quantidade <= 0) {
      remover(id)
      return
    }
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantidade } : i))
    )
  }, [remover])

  const limpar = useCallback(() => {
    setItens([])
    setEmpresaSlug(null)
  }, [])

  const total = itens.reduce(
    (acc, i) => acc + parseFloat(i.preco) * i.quantidade,
    0
  )

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        empresaSlug,
        total,
        totalItens,
        adicionar,
        remover,
        alterarQuantidade,
        limpar,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export const useCarrinho = () => {
  const ctx = useContext(CarrinhoContext)
  if (!ctx) throw new Error('useCarrinho fora do CarrinhoProvider')
  return ctx
}
