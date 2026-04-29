import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, ShoppingBag, Info, Lock } from 'lucide-react'
import { useCarrinho } from '../../contexts/CarrinhoContext'

export default function HeaderPublico() {
  const { totalItens } = useCarrinho()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const anchor = (hash) => isHome ? hash : `/${hash}`

  return (
    <header style={{ position:'sticky', top:0, zIndex:40, background:'#fff', borderBottom:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 16px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>

        {/* LOGO */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
          <img src="/logos/usina_sol.jpeg" alt="Usina do Sol"
            style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'2px solid #facc15' }}/>
          <div>
            <div style={{ fontWeight:700, color:'#1f2937', fontSize:14, lineHeight:1 }}>Usina do Sol</div>
            <div style={{ fontSize:11, color:'#9ca3af', lineHeight:1.4 }}>UNEB · Velho Chico</div>
          </div>
        </Link>

        {/* NAV central - só desktop */}
        <nav style={{ display:'flex', alignItems:'center', gap:4 }} className="hidden md:flex">
          <a href={anchor('#associacoes')} style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, fontWeight:500, color:'#4b5563', padding:'8px 12px', borderRadius:8, textDecoration:'none' }}
            onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <ShoppingBag size={16}/> Associações
          </a>
          <a href={anchor('#como-comprar')} style={{ fontSize:14, fontWeight:500, color:'#4b5563', padding:'8px 12px', borderRadius:8, textDecoration:'none' }}
            onMouseEnter={e=>e.currentTarget.style.background='#fffbeb'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            🛒 Como Comprar
          </a>
          <a href={anchor('#sobre')} style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, fontWeight:500, color:'#4b5563', padding:'8px 12px', borderRadius:8, textDecoration:'none' }}
            onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <Info size={16}/> Sobre
          </a>
        </nav>

        {/* BOTÕES DIREITA */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>

          {/* Carrinho */}
          <Link to="/carrinho" style={{ position:'relative', display:'flex', alignItems:'center', gap:6, background:'#fffbeb', color:'#92400e', fontWeight:500, fontSize:14, padding:'8px 12px', borderRadius:12, textDecoration:'none' }}>
            <ShoppingCart size={20}/>
            <span>Carrinho</span>
            {totalItens > 0 && (
              <span style={{ position:'absolute', top:-6, right:-6, background:'#f59e0b', color:'#fff', fontSize:11, fontWeight:700, width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {totalItens}
              </span>
            )}
          </Link>

          {/* ÁREA RESERVADA - botão azul, sempre visível */}
          <Link to="/login" style={{ display:'flex', alignItems:'center', gap:8, background:'#1a2f7a', color:'#ffffff', fontWeight:700, fontSize:14, padding:'9px 18px', borderRadius:12, textDecoration:'none', boxShadow:'0 2px 8px rgba(26,47,122,.3)' }}
            onMouseEnter={e=>e.currentTarget.style.background='#0f1f5c'}
            onMouseLeave={e=>e.currentTarget.style.background='#1a2f7a'}>
            <Lock size={16}/>
            Área Reservada
          </Link>
        </div>
      </div>
    </header>
  )
}
