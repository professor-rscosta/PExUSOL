// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── CATEGORIAS ─────────────────────────────────────────
  const categorias = await Promise.all([
    prisma.categoria.upsert({ where: { nome: 'Alimentos' },     update: {}, create: { nome: 'Alimentos',    descricao: 'Biscoitos, doces, licores e produtos da culinária tradicional' } }),
    prisma.categoria.upsert({ where: { nome: 'Artesanato' },    update: {}, create: { nome: 'Artesanato',   descricao: 'Peças artesanais feitas à mão pelas comunidades' } }),
    prisma.categoria.upsert({ where: { nome: 'Têxtil' },        update: {}, create: { nome: 'Têxtil',       descricao: 'Crochê, tapeçaria, bordado e pintura em tecido' } }),
    prisma.categoria.upsert({ where: { nome: 'Bolsas e Cestos'},update: {}, create: { nome: 'Bolsas e Cestos', descricao: 'Bolsas de palha de banana, milho e materiais naturais' } }),
    prisma.categoria.upsert({ where: { nome: 'Bonecas' },       update: {}, create: { nome: 'Bonecas',      descricao: 'Bonecas de palha, tecido e materiais regionais' } }),
    prisma.categoria.upsert({ where: { nome: 'Mel e Extração'}, update: {}, create: { nome: 'Mel e Extração', descricao: 'Mel silvestre, própolis e produtos da apicultura' } }),
    prisma.categoria.upsert({ where: { nome: 'Hortaliças' },    update: {}, create: { nome: 'Hortaliças',   descricao: 'Legumes, frutas e verduras frescas da roça' } }),
  ]);
  console.log(`✅ ${categorias.length} categorias criadas`);

  const catAlimentos  = categorias[0];
  const catArtesanato = categorias[1];
  const catTextil     = categorias[2];
  const catBolsas     = categorias[3];
  const catBonecas    = categorias[4];
  const catMel        = categorias[5];
  const catHortalicas = categorias[6];

  // ── EMPRESAS ───────────────────────────────────────────
  const agropastoril = await prisma.empresa.upsert({
    where: { slug: 'agropastoril' },
    update: {
      nome: 'Agropastoril Quilombolas de Mangal e Barro Vermelho',
      descricao: 'Associação agropastoril quilombola que preserva a cultura e os saberes tradicionais das comunidades de Mangal e Barro Vermelho.',
      whatsapp: '5577999990001',
      site: 'https://projetosmario.com/mangal/',
      logo: 'logos/agropastoril.jpeg',
    },
    create: {
      nome: 'Agropastoril Quilombolas de Mangal e Barro Vermelho',
      slug: 'agropastoril',
      descricao: 'Associação agropastoril quilombola que preserva a cultura e os saberes tradicionais das comunidades de Mangal e Barro Vermelho.',
      whatsapp: '5577999990001',
      site: 'https://projetosmario.com/mangal/',
      logo: 'logos/agropastoril.jpeg',
      ativo: true,
    },
  });

  const aebs = await prisma.empresa.upsert({
    where: { slug: 'aebs' },
    update: {
      nome: 'AEBS – Associação Evangélica de Sítio do Mato',
      descricao: 'Associação com foco em mel, extrativismo e produtos naturais da região de Sítio do Mato, fortalecendo a economia local.',
      whatsapp: '5577999990002',
      site: 'https://projetosmario.com/aebsv6/',
      logo: 'logos/aebs.jpeg',
    },
    create: {
      nome: 'AEBS – Associação Evangélica de Sítio do Mato',
      slug: 'aebs',
      descricao: 'Associação com foco em mel, extrativismo e produtos naturais da região de Sítio do Mato, fortalecendo a economia local.',
      whatsapp: '5577999990002',
      site: 'https://projetosmario.com/aebsv6/',
      logo: 'logos/aebs.jpeg',
      ativo: true,
    },
  });

  const amesim = await prisma.empresa.upsert({
    where: { slug: 'amesim' },
    update: {
      nome: 'AME SIM – Associação de Mulheres Empreendedoras de Sítio do Mato',
      descricao: 'Associação que empodera mulheres por meio do artesanato, culinária tradicional e projetos culturais.',
      whatsapp: '5577999990003',
      site: 'https://www.amesim.com.br',
      logo: 'logos/amesim.jpeg',
    },
    create: {
      nome: 'AME SIM – Associação de Mulheres Empreendedoras de Sítio do Mato',
      slug: 'amesim',
      descricao: 'Associação que empodera mulheres por meio do artesanato, culinária tradicional e projetos culturais.',
      whatsapp: '5577999990003',
      site: 'https://www.amesim.com.br',
      logo: 'logos/amesim.jpeg',
      ativo: true,
    },
  });

  const candeeiro = await prisma.empresa.upsert({
    where: { slug: 'candeeiro' },
    update: {
      nome: 'Casa Candeeiro do Oeste',
      descricao: 'Espaço cultural e comercial que valoriza produtos artesanais, hortaliças orgânicas e a identidade cultural do sertão baiano.',
      whatsapp: '5577999990004',
      site: 'https://www.casacandeeirodoeste.com',
      logo: 'logos/candeeiro.jpeg',
    },
    create: {
      nome: 'Casa Candeeiro do Oeste',
      slug: 'candeeiro',
      descricao: 'Espaço cultural e comercial que valoriza produtos artesanais, hortaliças orgânicas e a identidade cultural do sertão baiano.',
      whatsapp: '5577999990004',
      site: 'https://www.casacandeeirodoeste.com',
      logo: 'logos/candeeiro.jpeg',
      ativo: true,
    },
  });

  const empresas = [agropastoril, aebs, amesim, candeeiro];
  console.log(`✅ ${empresas.length} empresas criadas/atualizadas`);

  // ── ADMIN ──────────────────────────────────────────────
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@usinado.sol' },
    update: {},
    create: {
      nome: 'Admin UNEB',
      email: 'admin@usinado.sol',
      senha: senhaAdmin,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // ── VENDEDORES ─────────────────────────────────────────
  const senhaVendedor = await bcrypt.hash('vendedor123', 10);

  const vendedores = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'vendedor@agropastoril.com' },
      update: { empresaId: agropastoril.id },
      create: { nome: 'Vendedor Agropastoril', email: 'vendedor@agropastoril.com', senha: senhaVendedor, role: 'VENDEDOR', empresaId: agropastoril.id },
    }),
    prisma.usuario.upsert({
      where: { email: 'vendedor@aebs.com' },
      update: { empresaId: aebs.id },
      create: { nome: 'Vendedor AEBS', email: 'vendedor@aebs.com', senha: senhaVendedor, role: 'VENDEDOR', empresaId: aebs.id },
    }),
    prisma.usuario.upsert({
      where: { email: 'vendedor@amesim.com' },
      update: { empresaId: amesim.id },
      create: { nome: 'Vendedora AME SIM', email: 'vendedor@amesim.com', senha: senhaVendedor, role: 'VENDEDOR', empresaId: amesim.id },
    }),
    prisma.usuario.upsert({
      where: { email: 'vendedor@candeeiro.com' },
      update: { empresaId: candeeiro.id },
      create: { nome: 'Vendedor Candeeiro', email: 'vendedor@candeeiro.com', senha: senhaVendedor, role: 'VENDEDOR', empresaId: candeeiro.id },
    }),
  ]);
  console.log(`✅ ${vendedores.length} vendedores criados`);

  // ── PRODUTOS ───────────────────────────────────────────
  const produtos = [
    // Agropastoril
    { nome: 'Mel Silvestre 500g', descricao: 'Mel puro coletado nas flores nativas do cerrado quilombola.', preco: 32.00, estoque: 40, ativo: true, empresaId: agropastoril.id, categoriaId: catMel.id },
    { nome: 'Mel com Própolis 250g', descricao: 'Blend artesanal de mel e própolis com propriedades naturais.', preco: 28.00, estoque: 30, ativo: true, empresaId: agropastoril.id, categoriaId: catMel.id },
    { nome: 'Farinha de Mandioca 1kg', descricao: 'Farinha artesanal produzida na casa de farinha comunitária.', preco: 12.00, estoque: 80, ativo: true, empresaId: agropastoril.id, categoriaId: catAlimentos.id },
    { nome: 'Bolsa Palha de Milho', descricao: 'Bolsa trançada à mão com palha de milho seco, resistente e única.', preco: 55.00, estoque: 12, ativo: true, empresaId: agropastoril.id, categoriaId: catBolsas.id },

    // AEBS
    { nome: 'Biscoito de Polvilho Artesanal', descricao: 'Biscoito crocante feito com polvilho da roça, receita de família.', preco: 14.00, estoque: 50, ativo: true, empresaId: aebs.id, categoriaId: catAlimentos.id },
    { nome: 'Licor de Umbu', descricao: 'Licor artesanal de umbu, fruta típica do sertão baiano.', preco: 30.00, estoque: 20, ativo: true, empresaId: aebs.id, categoriaId: catAlimentos.id },
    { nome: 'Doce de Leite Caseiro 400g', descricao: 'Doce cremoso produzido com leite fresco e receita tradicional.', preco: 18.00, estoque: 35, ativo: true, empresaId: aebs.id, categoriaId: catAlimentos.id },
    { nome: 'Licor de Jenipapo', descricao: 'Licor artesanal feito com jenipapo, sabor único do Velho Chico.', preco: 35.00, estoque: 15, ativo: true, empresaId: aebs.id, categoriaId: catAlimentos.id },

    // AME SIM
    { nome: 'Tapete de Crochê 60cm', descricao: 'Tapete colorido feito à mão em crochê, ideal para decoração.', preco: 70.00, estoque: 8, ativo: true, empresaId: amesim.id, categoriaId: catTextil.id },
    { nome: 'Bordado Ponto Cruz – Quadro', descricao: 'Quadro bordado em ponto cruz com motivos do sertão baiano.', preco: 90.00, estoque: 6, ativo: true, empresaId: amesim.id, categoriaId: catTextil.id },
    { nome: 'Boneca de Palha Tradição', descricao: 'Boneca artesanal confeccionada com palha e tecido reciclado.', preco: 45.00, estoque: 15, ativo: true, empresaId: amesim.id, categoriaId: catBonecas.id },
    { nome: 'Caminho de Mesa Pintado', descricao: 'Caminho de mesa com pintura em tecido, motivos florais regionais.', preco: 65.00, estoque: 10, ativo: true, empresaId: amesim.id, categoriaId: catTextil.id },

    // Casa Candeeiro do Oeste
    { nome: 'Cesta de Palha de Banana', descricao: 'Cesta multiuso trançada à mão com palha de bananeira seca.', preco: 48.00, estoque: 18, ativo: true, empresaId: candeeiro.id, categoriaId: catBolsas.id },
    { nome: 'Bolsa de Fibra Natural', descricao: 'Bolsa artesanal em fibra de sisal, resistente e sustentável.', preco: 62.00, estoque: 10, ativo: true, empresaId: candeeiro.id, categoriaId: catBolsas.id },
    { nome: 'Tapeçaria Regional', descricao: 'Tapeçaria feita em tear manual com fios coloridos, peça única.', preco: 120.00, estoque: 4, ativo: true, empresaId: candeeiro.id, categoriaId: catTextil.id },
    { nome: 'Kit Hortaliças Orgânicas', descricao: 'Cesta com coentro, cebolinha, alface e tomate frescos da roça.', preco: 22.00, estoque: 25, ativo: true, empresaId: candeeiro.id, categoriaId: catHortalicas.id },
  ];

  let criados = 0;
  for (const p of produtos) {
    await prisma.produto.upsert({
      where: { nome_empresaId: { nome: p.nome, empresaId: p.empresaId } },
      update: { preco: p.preco, estoque: p.estoque, descricao: p.descricao },
      create: p,
    });
    criados++;
  }
  console.log(`✅ ${criados} produtos criados/atualizados`);

  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║         CREDENCIAIS DE ACESSO          ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║ Admin:  admin@usinado.sol / admin123   ║');
  console.log('║ Agrop.: vendedor@agropastoril.com      ║');
  console.log('║ AEBS:   vendedor@aebs.com              ║');
  console.log('║ AME:    vendedor@amesim.com            ║');
  console.log('║ Cand.:  vendedor@candeeiro.com         ║');
  console.log('║         (todas: vendedor123)           ║');
  console.log('╚════════════════════════════════════════╝');
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
