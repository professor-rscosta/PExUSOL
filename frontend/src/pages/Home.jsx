// src/pages/Home.jsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink, ShoppingBag, Wrench, Sparkles, ArrowRight, MapPin, Lock, BookOpen, Users, Target, Handshake } from 'lucide-react';
import api from '../api/axios';

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

const FASES = [
  { n: '01', titulo: 'Mapeamento', desc: 'Identificação e levantamento das associações nos municípios de Bom Jesus da Lapa, Serra do Ramalho, Paratinga e Riacho de Santana.', icone: '🗺️' },
  { n: '02', titulo: 'Capacitação', desc: 'Oficinas práticas de formação administrativa, jurídica e de gestão financeira para os membros das associações.', icone: '📚' },
  { n: '03', titulo: 'Formalização', desc: 'Apoio técnico para legalização e institucionalização das associações mapeadas pelo projeto.', icone: '📋' },
  { n: '04', titulo: 'Assessoria', desc: 'Acompanhamento contínuo e assessoria pós-formalização para garantir a sustentabilidade das associações.', icone: '🤝' },
];

const PARCEIROS = [
  { nome: 'UNEB', desc: 'Universidade do Estado da Bahia — coordenação geral', icone: '🎓' },
  { nome: 'IFBaiano', desc: 'Instituto Federal Baiano — Bom Jesus da Lapa', icone: '🏛️' },
  { nome: 'UFOB', desc: 'Universidade Federal do Oeste da Bahia', icone: '🎓' },
  { nome: 'FUNDIFRAN', desc: 'Fundação de Desenvolvimento Integrado do São Francisco', icone: '🏢' },
  { nome: 'Prefeitura', desc: 'Prefeitura Municipal de Bom Jesus da Lapa — BA', icone: '🏙️' },
];

export default function Home() {
  const { data: empresasApi } = useQuery({
    queryKey: ['empresas-home'],
    queryFn: async () => {
      const { data } = await api.get('/empresas');
      return data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const associacoes = ASSOCIACOES.map((est) => {
    const apiData = empresasApi?.find((e) => e.slug === est.slug);
    return { ...est, totalProdutos: apiData?._count?.produtos ?? null };
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0f1f5c] via-[#1a2f7a] to-[#1e40af] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-5">
            <img src="/logos/usina_sol.jpeg" alt="Logo Usina do Sol"
              className="w-28 h-28 rounded-full object-cover ring-4 ring-yellow-400 shadow-2xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">☀️ Usina do Sol</h1>
          <p className="text-yellow-300 font-bold text-base sm:text-lg mb-1 tracking-widest uppercase">
            Projeto de Extensão · UNEB · Território Velho Chico
          </p>
          <p className="text-blue-100 text-sm font-medium mb-3 max-w-3xl mx-auto leading-relaxed">
            Assistência Técnica Sócio-Produtiva para Institucionalização de Associações da Sociedade Civil
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-blue-300 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Bom Jesus da Lapa · Serra do Ramalho · Paratinga · Riacho de Santana — BA</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#associacoes"
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-7 py-3 rounded-full transition-all shadow-lg flex items-center gap-2 text-base">
              <ShoppingBag className="w-5 h-5" /> Ver Associações
            </a>
            <a href="#como-comprar"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3 rounded-full transition-all flex items-center gap-2 text-base">
              🛒 Como Comprar
            </a>
            <a href="#sobre"
              className="border-2 border-blue-300 hover:bg-blue-800 text-white px-7 py-3 rounded-full transition-all flex items-center gap-2 text-base">
              Sobre o Projeto <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── ASSOCIAÇÕES ───────────────────────────────────────── */}
      <section id="associacoes" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">🏘️ Nossas Associações</h2>
          <p className="text-gray-500 mt-2">Conheça cada comunidade e acesse a loja para realizar sua compra</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {associacoes.map((assoc) => (
            <div key={assoc.slug}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col hover:-translate-y-1 duration-200">
              <div className={`bg-gradient-to-br ${assoc.cor} p-6 flex flex-col items-center gap-3`}>
                <img src={assoc.logo} alt={assoc.nome}
                  className="w-24 h-24 rounded-full object-contain bg-white p-1.5 shadow-lg"
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-center leading-snug text-sm mb-2">{assoc.nome}</h3>
                <p className="text-gray-500 text-xs text-center mb-3 leading-relaxed">{assoc.descricao}</p>
                {assoc.totalProdutos !== null && (
                  <p className="text-center text-xs text-blue-600 font-semibold mb-3">
                    🛍️ {assoc.totalProdutos} produto{assoc.totalProdutos !== 1 ? 's' : ''} disponíveis
                  </p>
                )}
                <div className="mt-auto pt-2 flex flex-col gap-2">
                  <Link to={`/empresa/${assoc.slug}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl text-center transition-colors shadow-sm">
                    🛒 Acessar Loja
                  </Link>
                  {assoc.site && (
                    <a href={assoc.site.startsWith('http') ? assoc.site : `https://${assoc.site}`}
                      target="_blank" rel="noreferrer"
                      className="border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-medium py-2 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-1">
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
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">O que oferecemos</h2>
            <p className="text-gray-500 mt-2">Tradição, identidade e geração de renda no Velho Chico</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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
      <section id="como-comprar" className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-14 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2 text-yellow-400">🛒 Como Comprar</h2>
          <p className="text-center text-gray-400 text-sm mb-10">Simples, rápido e direto com o vendedor pelo WhatsApp</p>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { n: '1', icon: '🏪', titulo: 'Escolha a associação', desc: 'Clique em "Acessar Loja" na associação que deseja apoiar' },
              { n: '2', icon: '🛒', titulo: 'Monte seu carrinho', desc: 'Adicione produtos e ajuste as quantidades desejadas' },
              { n: '3', icon: '📱', titulo: 'Finalize pelo WhatsApp', desc: 'Seu pedido vai direto para o vendedor confirmar' },
            ].map((p) => (
              <div key={p.n} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-yellow-400 text-gray-900 font-black text-2xl flex items-center justify-center shadow-lg">{p.n}</div>
                <span className="text-3xl">{p.icon}</span>
                <h3 className="font-bold text-yellow-300 text-base">{p.titulo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="#associacoes"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-full transition-all shadow-lg text-base">
              <ShoppingBag className="w-5 h-5" /> Começar a comprar agora
            </a>
          </div>
        </div>
      </section>

      {/* ── SOBRE O PROJETO ───────────────────────────────────── */}
      <section id="sobre" className="py-16 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">

          {/* Cabeçalho */}
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-4 py-1.5 rounded-full mb-3 tracking-wider uppercase">
              Projeto de Extensão Universitária
            </span>
            <h2 className="text-3xl font-bold text-gray-800 leading-snug max-w-3xl mx-auto">
              Usina do Sol: Assistência Técnica Sócio-Produtiva para Institucionalização de Associações do Território Velho Chico
            </h2>
            <div className="w-16 h-1 bg-yellow-400 mx-auto mt-4 rounded-full" />
          </div>

          {/* Texto principal */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-3">Sobre o Projeto</h3>
                <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                  <p>
                    As Associações são uma alternativa à inserção de pessoas no mundo do trabalho. O projeto de extensão
                    <strong className="text-blue-700"> Usina do Sol</strong> tem como objetivo capacitar e formalizar as associações
                    das cidades de <strong>Bom Jesus da Lapa, Serra do Ramalho, Paratinga e Riacho de Santana</strong>.
                  </p>
                  <p>
                    O projeto levará, por meio de cursos e oficinas de capacitação, o aprendizado prático dos processos
                    administrativos de formalização, manutenção e assessoria das associações mapeadas. A formação está alinhada
                    à <strong>Política Nacional de Extensão Universitária (2012)</strong>, que tem como objetivo a solução de
                    problemas sociais do país.
                  </p>
                  <p>
                    Para além das necessidades econômicas e sociais, o projeto abordará temas como tecnologias atuais, alimentação
                    saudável, qualidade de vida, relações interpessoais e práticas sustentáveis — conteúdo que garantirá a
                    mudança social como objetivo fim do projeto.
                  </p>
                  <p>
                    Empreender é um processo experimental e social que transforma o indivíduo em suas habilidades para a mudança
                    do seu meio. As associações são empreendimentos sociais que transformam a sociedade, gerando trabalho, renda
                    e qualidade de vida.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de info */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-blue-600 text-white rounded-2xl p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
              <h4 className="font-bold text-lg mb-2">Objetivo</h4>
              <p className="text-blue-100 text-sm leading-relaxed">
                Capacitar e formalizar associações da sociedade civil no Território Velho Chico, gerando trabalho e renda sustentável.
              </p>
            </div>
            <div className="bg-green-600 text-white rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
              <h4 className="font-bold text-lg mb-2">Público</h4>
              <p className="text-green-100 text-sm leading-relaxed">
                Associações dos municípios de Bom Jesus da Lapa, Serra do Ramalho, Paratinga e Riacho de Santana — BA.
              </p>
            </div>
            <div className="bg-rose-600 text-white rounded-2xl p-6 text-center">
              <Handshake className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
              <h4 className="font-bold text-lg mb-2">Impacto</h4>
              <p className="text-rose-100 text-sm leading-relaxed">
                Inclusão produtiva, valorização cultural, sustentabilidade e qualidade de vida para comunidades sertanejas.
              </p>
            </div>
          </div>

          {/* 4 Fases */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-6">📋 As 4 Fases do Projeto</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FASES.map((fase) => (
                <div key={fase.n} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-black flex items-center justify-center flex-shrink-0">
                      {fase.n}
                    </span>
                    <span className="text-2xl">{fase.icone}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">{fase.titulo}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{fase.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parceiros */}
          <div className="bg-gray-800 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold text-center mb-6 text-yellow-400">🤝 Parceiros Institucionais</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {PARCEIROS.map((p) => (
                <div key={p.nome} className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                    {p.icone}
                  </div>
                  <p className="font-bold text-yellow-300 text-sm">{p.nome}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-snug">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="flex justify-center mb-4">
            <img src="/logos/usina_sol.jpeg" alt="Usina do Sol"
              className="w-12 h-12 rounded-full object-cover opacity-80" />
          </div>
          <p className="text-base font-semibold text-gray-200">Projeto Usina do Sol</p>
          <p className="text-sm">Universidade do Estado da Bahia — UNEB · DCHT · Território Velho Chico</p>
          <p className="text-xs">🌞 Tecnologia a serviço da economia solidária e da cultura popular</p>
          <div className="pt-4 border-t border-gray-700">
            <Link to="/login"
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-yellow-400 transition-colors">
              <Lock className="w-3 h-3" /> Acesso ao Painel Administrativo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
