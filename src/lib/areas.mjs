// Fonte única da lista de áreas (usada pelo site e pelo validador).
// Critérios de inclusão e mapa de páginas dos planos: docs/taxonomia-temas.md.
// O slug é a URL do tema (/tema/<slug>/) e o prefixo do id das propostas (<slug>-01).
const TEMAS = [
  ['Segurança e Justiça', [
    ['seguranca-publica', 'Segurança pública e crime organizado'],
    ['prisoes-e-leis-penais', 'Prisões e leis penais'],
  ]],
  ['Saúde e cuidados', [
    ['saude', 'Saúde e atendimento no SUS'],
    ['remedios-e-vacinas', 'Remédios, vacinas e indústria da saúde'],
    ['idosos-e-cuidados', 'Idosos e cuidados'],
    ['pessoas-com-deficiencia', 'Pessoas com deficiência'],
  ]],
  ['Educação, ciência e cultura', [
    ['educacao-basica', 'Educação básica'],
    ['ensino-tecnico-e-superior', 'Ensino técnico e superior'],
    ['ciencia-tecnologia-e-ia', 'Ciência, tecnologia e IA'],
    ['cultura', 'Cultura'],
    ['esporte', 'Esporte'],
  ]],
  ['Economia', [
    ['contas-publicas-e-juros', 'Contas públicas e juros'],
    ['impostos', 'Impostos'],
    ['custo-de-vida', 'Custo de vida e endividamento'],
    ['industria-e-comercio-exterior', 'Indústria e comércio exterior'],
    ['pequenos-negocios', 'Pequenos negócios e burocracia'],
  ]],
  ['Trabalho e proteção social', [
    ['emprego-e-renda', 'Emprego e renda'],
    ['previdencia', 'Previdência e aposentados'],
    ['pobreza-e-fome', 'Combate à pobreza e fome'],
  ]],
  ['Infraestrutura, cidades e território', [
    ['infraestrutura', 'Infraestrutura e logística'],
    ['energia', 'Energia e combustíveis'],
    ['moradia', 'Moradia'],
    ['cidades-e-mobilidade', 'Cidades, mobilidade e riscos'],
    ['saneamento-e-agua', 'Saneamento e água'],
    ['governo-digital', 'Conectividade e governo digital'],
    ['desenvolvimento-regional', 'Desenvolvimento regional'],
    ['turismo', 'Turismo'],
  ]],
  ['Campo e ambiente', [
    ['agronegocio', 'Agronegócio'],
    ['agricultura-familiar', 'Agricultura familiar e terra'],
    ['meio-ambiente', 'Meio ambiente e florestas'],
    ['clima', 'Clima e transição ecológica'],
  ]],
  ['Direitos e inclusão', [
    ['mulheres', 'Mulheres'],
    ['igualdade-racial', 'Igualdade racial e combate à discriminação'],
    ['indigenas-e-quilombolas', 'Povos indígenas e quilombolas'],
    ['criancas-e-adolescentes', 'Crianças e adolescentes'],
  ]],
  ['Estado, democracia e mundo', [
    ['judiciario', 'Judiciário e Supremo'],
    ['reforma-politica', 'Reforma política e participação social'],
    ['liberdade-de-expressao', 'Liberdade de expressão e plataformas'],
    ['gestao-publica', 'Gestão pública, estatais e anticorrupção'],
    ['pacto-federativo', 'Pacto federativo e orçamento'],
    ['politica-externa', 'Política externa'],
    ['defesa', 'Defesa nacional'],
  ]],
];

export const AREAS = TEMAS.flatMap(([bloco, temas]) => temas.map(([slug, nome]) => ({ nome, slug, bloco })));
export const BLOCOS = TEMAS.map(([nome, temas]) => ({ nome, areas: temas.map(([slug]) => slug) }));

// Etiquetas transversais: o público da medida, que não vira tema (ver docs/taxonomia-temas.md).
export const ETIQUETAS = ['jovens', 'idosos', 'mulheres', 'criancas'];
