// src/pages/Home.jsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink, ShoppingBag, Wrench, Sparkles, ArrowRight, MapPin, Lock } from 'lucide-react';
import api from '../api/axios';

// ── DADOS ESTÁTICOS (sempre aparecem mesmo sem backend) ─────
const ASSOCIACOES = [
  {
    slug: 'agropastoril',
    nome: 'Agropastoril Quilombolas de Mangal e Barro Vermelho',
    descricao: 'Mel, extrativismo e produtos da roça das comunidades quilombolas.',
    site: 'https://projetosmario.com/mangal/',
    logo: '/logos/agropastoril.jpeg',
    cor: 'from-green-700 to-green-500',
    emoji: '🌱',
  },
  {
    slug: 'aebs',
    nome: 'AEBS – Associação Evangélica de Sítio do Mato',
    descricao: 'Licores, biscoitos e doces artesanais com receitas tradicionais.',
    site: 'https://projetosmario.com/aebsv6/',
    logo: '/logos/aebs.jpeg',
    cor: 'from-blue-800 to-blue-600',
    emoji: '🍯',
  },
  {
    slug: 'amesim',
    nome: 'AME SIM – Associação de Mulheres Empreendedoras de Sítio do Mato',
    descricao: 'Artesanato, crochê, bordado e projetos culturais feitos por mulheres.',
    site: 'https://www.amesim.com.br',
    logo: '/logos/amesim.jpeg',
    cor: 'from-rose-600 to-pink-500',
    emoji: '🌸',
  },
  {
    slug: 'candeeiro',
    nome: 'Casa Candeeiro do Oeste',
    descricao: 'Bolsas de palha, tapeçaria, hortaliças orgânicas e cultura sertaneja.',
    site: 'https://www.casacandeeirodoeste.com',
    logo: '/logos/candeeiro.jpeg',
    cor: 'from-teal-700 to-teal-500',
    emoji: '🪔',
  },
];

const PRODUTOS = [
  { icone: '🍪', nome: 'Biscoitos e doces artesanais' },
  { icone: '🍶', nome: 'Licores artesanais' },
  { icone: '🍲', nome: 'Culinária tradicional' },
  { icone: '🧶', nome: 'Crochê e tapeçaria' },
  { icone: '✂️', nome: 'Bordado em ponto cruz' },
  { icone: '🎨', nome: 'Pintura em tecido' },
  { icone: '👜', nome: 'Bolsas de palha de banana e milho' },
  { icone: '🪆', nome: 'Bonecas de palha e tecido' },
];

const SERVICOS = [
  { icone: '🧵', nome: 'Oficinas de artesanato' },
  { icone: '🍳', nome: 'Oficinas de culinária tradicional' },
  { icone: '💬', nome: 'Rodas de conversa e troca de saberes' },
  { icone: '🖼️', nome: 'Exposições culturais' },
  { icone: '🎪', nome: 'Feiras culturais' },
  { icone: '📲', nome: 'Divulgação em redes sociais' },
];

const PROJETOS = [
  { icone: '🌟', nome: 'Valorização da cultura popular' },
  { icone: '🤝', nome: 'Fortalecimento da identidade cultural' },
  { icone: '💰', nome: 'Geração de renda solidária' },
  { icone: '👩‍👧', nome: 'Inclusão de mulheres, jovens e idosos' },
  { icone: '🏫', nome: 'Parcerias com escolas e associações' },
  { icone: '🔄', nome: 'Intercâmbio de saberes entre gerações' },
];

export default function Home() {
  // Busca dados da API (enriquece contagem de produtos etc.)
  const { data: empresasApi } = useQuery({
    queryKey: ['empresas-home'],
    queryFn: async () => {
      const { data } = await api.get('/empresas');
      return data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  // Mescla dados estáticos com dados da API
  const associacoes = ASSOCIACOES.map((est) => {
    const api = empresasApi?.find((e) => e.slug === est.slug);
    return {
      ...est,
      totalProdutos: api?._count?.produtos ?? null,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0f1f5c] via-[#1a2f7a] to-[#1e40af] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src="/logos/usina_sol.jpeg"
              alt="Logo Usina do Sol"
              className="w-28 h-28 rounded-full object-cover ring-4 ring-yellow-400 shadow-2xl"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">
            ☀️ Usina do Sol
          </h1>
          <p className="text-yellow-300 font-bold text-base sm:text-lg mb-3 tracking-widest uppercase">
            Projeto Usina do Sol · UNEB · Velho Chico
          </p>
          <p className="text-blue-200 text-base max-w-2xl mx-auto leading-relaxed">
            Plataforma solidária que conecta comunidades do Território Velho Chico
            a consumidores que valorizam produtos artesanais, cultura e tradição.
          </p>

          <div className="flex items-center justify-center gap-1.5 mt-4 text-blue-300 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Sítio do Mato · Bom Jesus da Lapa · Bahia — Brasil</span>
          </div>

          {/* Botões CTA */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#associacoes"
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-7 py-3 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-base"
            >
              <ShoppingBag className="w-5 h-5" />
              Ver Associações
            </a>
            <a
              href="#sobre"
              className="border-2 border-blue-300 hover:bg-blue-800 text-white px-7 py-3 rounded-full transition-all flex items-center gap-2 text-base"
            >
              Sobre o Projeto <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/login"
              className="border-2 border-yellow-500/50 hover:border-yellow-400 text-yellow-300 hover:text-yellow-200 px-7 py-3 rounded-full transition-all flex items-center gap-2 text-base"
            >
              <Lock className="w-4 h-4" />
              Painel Administrativo
            </Link>
          </div>
        </div>
      </section>

      {/* ── ASSOCIAÇÕES ───────────────────────────────────────── */}
      <section id="associacoes" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">🏘️ Nossas Associações</h2>
          <p className="text-gray-500 mt-2 text-base">
            Conheça cada comunidade e acesse a loja para realizar sua compra
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {associacoes.map((assoc) => (
            <div
              key={assoc.slug}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col group hover:-translate-y-1 duration-200"
            >
              {/* Header colorido com logo */}
              <div className={`bg-gradient-to-br ${assoc.cor} p-6 flex flex-col items-center gap-3`}>
                <img
                  src={assoc.logo}
                  alt={assoc.nome}
                  className="w-24 h-24 rounded-full object-contain bg-white p-1.5 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span
                  className="w-24 h-24 rounded-full bg-white/20 items-center justify-center text-4xl hidden"
                  aria-hidden="true"
                >
                  {assoc.emoji}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-center leading-snug text-sm mb-2">
                  {assoc.nome}
                </h3>
                <p className="text-gray-500 text-xs text-center mb-3 leading-relaxed">
                  {assoc.descricao}
                </p>

                {assoc.totalProdutos !== null && (
                  <p className="text-center text-xs text-blue-600 font-semibold mb-3">
                    🛍️ {assoc.totalProdutos} produto{assoc.totalProdutos !== 1 ? 's' : ''} disponíveis
                  </p>
                )}

                {/* Botões */}
                <div className="mt-auto pt-2 flex flex-col gap-2">
                  <Link
                    to={`/empresa/${assoc.slug}`}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold py-2.5 px-4 rounded-xl text-center transition-colors shadow-sm"
                  >
                    🛒 Acessar Loja
                  </Link>

                  {assoc.site && (
                    <a
                      href={assoc.site.startsWith('http') ? assoc.site : `https://${assoc.site}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-medium py-2 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Ver site oficial
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUTOS / SERVIÇOS / PROJETOS ────────────────────── */}
      <section id="sobre" className="bg-white py-16 border-t border-gray-100 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">O que oferecemos</h2>
            <p className="text-gray-500 mt-2">
              Tradição, identidade e geração de renda no Velho Chico
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Produtos */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Produtos</h3>
              </div>
              <ul className="space-y-3">
                {PRODUTOS.map((p) => (
                  <li key={p.nome} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-lg leading-tight">{p.icone}</span>
                    <span className="leading-relaxed">{p.nome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Serviços */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Serviços</h3>
              </div>
              <ul className="space-y-3">
                {SERVICOS.map((s) => (
                  <li key={s.nome} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-lg leading-tight">{s.icone}</span>
                    <span className="leading-relaxed">{s.nome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projetos Culturais */}
            <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Projetos Culturais</h3>
              </div>
              <ul className="space-y-3">
                {PROJETOS.map((p) => (
                  <li key={p.nome} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-lg leading-tight">{p.icone}</span>
                    <span className="leading-relaxed">{p.nome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO COMPRAR ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-yellow-400">
            🛒 Como Comprar
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { n: '1', icon: '🏪', titulo: 'Escolha a associação', desc: 'Clique em "Acessar Loja" na associação que deseja apoiar' },
              { n: '2', icon: '🛒', titulo: 'Monte seu carrinho', desc: 'Adicione produtos e ajuste as quantidades' },
              { n: '3', icon: '📱', titulo: 'Finalize pelo WhatsApp', desc: 'Seu pedido vai direto para o vendedor confirmar' },
            ].map((p) => (
              <div key={p.n} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-yellow-400 text-gray-900 font-black text-2xl flex items-center justify-center shadow-lg">
                  {p.n}
                </div>
                <span className="text-3xl">{p.icon}</span>
                <h3 className="font-bold text-yellow-300 text-base">{p.titulo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA para comprar */}
          <div className="text-center mt-10">
            <a
              href="#associacoes"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-full transition-all shadow-lg text-base"
            >
              <ShoppingBag className="w-5 h-5" />
              Começar a comprar agora
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex justify-center mb-4">
            <img
              src="/logos/usina_sol.jpeg"
              alt="Usina do Sol"
              className="w-12 h-12 rounded-full object-cover opacity-80"
            />
          </div>
          <p className="text-base font-semibold text-gray-200">Projeto Usina do Sol</p>
          <p className="text-sm">
            Universidade do Estado da Bahia — UNEB · DCHT · Território Velho Chico
          </p>
          <p className="text-xs mt-2">
            🌞 Tecnologia a serviço da economia solidária e da cultura popular
          </p>
          <div className="pt-4 border-t border-gray-700">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-yellow-400 transition-colors"
            >
              <Lock className="w-3 h-3" />
              Acesso ao Painel Administrativo
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
