// Funções puras de texto usadas pelo importador e pelo conferidor de trechos.
import { AREAS } from '../../src/lib/areas.mjs';

// Palavras-chave só para SUGERIR páginas por tema. Quem decide o que vira proposta é a revisão humana.
// Casam no INÍCIO de palavra; as curtas (até 4 letras) casam a palavra inteira ("sus" não casa "sustentável").
export const PALAVRAS_CHAVE = {
  'Segurança pública e crime organizado': ['seguranca publica', 'policia', 'crime organizado', 'faccao', 'faccoes', 'milicia', 'fronteira', 'armas', 'camera', 'celular'],
  'Prisões e leis penais': ['presidio', 'penitenciar', 'prisional', 'maioridade penal', 'progressao de regime', 'pena', 'carcerari'],
  'Saúde e atendimento no SUS': ['saude', 'sus', 'hospital', 'prontuario', 'atencao basica', 'atencao especializada', 'telessaude', 'saude mental'],
  'Remédios, vacinas e indústria da saúde': ['medicamento', 'remedio', 'farmacia', 'vacina', 'imuniza', 'complexo industrial da saude', 'hemoderivado'],
  'Idosos e cuidados': ['idoso', 'envelhec', 'cuidado', 'cuidador', 'longa permanencia', 'centro-dia'],
  'Pessoas com deficiência': ['deficiencia', 'autismo', 'espectro autista', 'acessibilidade', 'libras', 'paralimp', 'neurodivergen'],
  'Educação básica': ['educacao basica', 'escola', 'alfabetiza', 'creche', 'professor', 'tempo integral', 'ensino medio', 'pe-de-meia', 'ensino fundamental'],
  'Ensino técnico e superior': ['ensino tecnico', 'ensino superior', 'universidade', 'instituto federal', 'financiamento estudantil', 'fies', 'prouni', 'pos-graduacao'],
  'Ciência, tecnologia e IA': ['ciencia', 'pesquisa', 'inovacao', 'inteligencia artificial', 'data center', 'datacenter', 'tecnologia', 'soberania digital'],
  'Cultura': ['cultura', 'cultural', 'artista', 'cinema', 'audiovisual', 'patrimonio', 'rouanet', 'biblioteca'],
  'Esporte': ['esporte', 'esportiv', 'atleta', 'olimp', 'paralimp', 'futebol'],
  'Contas públicas e juros': ['fiscal', 'divida publica', 'juros', 'superavit', 'deficit', 'teto de gastos', 'arcabouco', 'inflacao'],
  'Impostos': ['imposto', 'tribut', 'iva', 'imposto de renda', 'cashback', 'aliquota'],
  'Custo de vida e endividamento': ['custo de vida', 'endividamento', 'endividad', 'credito', 'apostas', 'inadimpl', 'preco'],
  'Indústria e comércio exterior': ['industria', 'industrial', 'comercio exterior', 'exporta', 'importa', 'ocde', 'minerais criticos', 'terras raras', 'acordo comercial'],
  'Pequenos negócios e burocracia': ['pequeno negocio', 'micro e pequen', 'microempreendedor', 'mei', 'empreendedor', 'burocracia', 'abrir empresa', 'licenca'],
  'Emprego e renda': ['emprego', 'salario', 'trabalhador', 'jornada', 'desemprego', 'escala 6x1', 'sindic', 'trabalhista', 'plataforma'],
  'Previdência e aposentados': ['aposentad', 'previdenc', 'inss', 'pension', 'beneficio'],
  'Combate à pobreza e fome': ['pobreza', 'fome', 'bolsa familia', 'assistencia social', 'transferencia de renda', 'cadastro unico', 'inseguranca alimentar', 'suas'],
  'Infraestrutura e logística': ['infraestrutura', 'logistic', 'rodovia', 'ferrovia', 'porto', 'aeroporto', 'hidrovia', 'concess', 'pac'],
  'Energia e combustíveis': ['energia', 'eletric', 'petroleo', 'petrobras', 'gas natural', 'combustivel', 'biocombustivel', 'renovavel', 'conta de luz', 'nuclear'],
  'Moradia': ['moradia', 'habitac', 'casa propria', 'minha casa', 'casa verde', 'aluguel', 'regularizacao fundiaria urbana'],
  'Cidades, mobilidade e riscos': ['mobilidade', 'transporte coletivo', 'metro', 'onibus', 'encosta', 'drenagem', 'defesa civil', 'deslizamento', 'enchente'],
  'Saneamento e água': ['saneamento', 'esgoto', 'agua tratada', 'residuos', 'lixao', 'seguranca hidrica', 'cisterna'],
  'Conectividade e governo digital': ['internet', 'conectividade', 'gov.br', 'governo digital', 'servicos digitais', 'identidade digital', '5g', 'fibra'],
  'Desenvolvimento regional': ['desenvolvimento regional', 'nordeste', 'norte', 'amazonia', 'semiarido', 'regioes'],
  'Turismo': ['turismo', 'turista', 'turistic'],
  'Agronegócio': ['agronegocio', 'agropecuaria', 'credito rural', 'plano safra', 'seguro rural', 'fertilizante', 'safra', 'irrigac'],
  'Agricultura familiar e terra': ['agricultura familiar', 'reforma agraria', 'titulacao', 'pronaf', 'assentamento', 'regularizacao fundiaria', 'assistencia tecnica'],
  'Meio ambiente e florestas': ['meio ambiente', 'desmatamento', 'floresta', 'fiscalizacao ambiental', 'licenciamento', 'servicos ambientais', 'bioma', 'queimada'],
  'Clima e transição ecológica': ['mudanca do clima', 'clima', 'carbono', 'descarboniza', 'transicao ecologica', 'transicao energetica', 'ndc', 'emissoes', 'adaptacao climatica'],
  'Mulheres': ['mulher', 'feminicidio', 'violencia domestica', 'medida protetiva', 'igualdade salarial', 'maria da penha'],
  'Igualdade racial e combate à discriminação': ['racial', 'racismo', 'cotas', 'lgbt', 'xenofobia', 'discriminacao', 'migrante', 'refugiado', 'populacao negra'],
  'Povos indígenas e quilombolas': ['indigena', 'quilombola', 'demarcacao', 'terra indigena', 'povos tradicionais'],
  'Crianças e adolescentes': ['crianca', 'adolescente', 'eca', 'pedofilia', 'infancia', 'telas'],
  'Judiciário e Supremo': ['stf', 'supremo', 'judiciario', 'tribunal', 'cnj', 'decisoes monocraticas', 'corte constitucional'],
  'Reforma política e participação social': ['reforma politica', 'reeleicao', 'sistema eleitoral', 'participacao social', 'conselho', 'conferencia', 'partidos'],
  'Liberdade de expressão e plataformas': ['liberdade de expressao', 'censura', 'desinformacao', 'redes sociais', 'plataformas digitais', 'transparencia algoritmica'],
  'Gestão pública, estatais e anticorrupção': ['servidor', 'reforma administrativa', 'estatal', 'estatais', 'corrupcao', 'integridade', 'transparencia', 'gestao publica'],
  'Pacto federativo e orçamento': ['pacto federativo', 'federativ', 'emendas', 'orcamento', 'municipios', 'repasse'],
  'Política externa': ['politica externa', 'diplomacia', 'itamaraty', 'mercosul', 'brics', 'onu', 'multilateral', 'cooperacao internacional'],
  'Defesa nacional': ['defesa nacional', 'forcas armadas', 'defesa', 'militar', 'soberania'],
};

const TAM_MIN_FRAGMENTO = 15;
const TAM_MIN_TOTAL = 30;
const MAX_FRAGMENTOS = 4;

// Sem acento, minúsculas (NFKD também desfaz ligaduras como "ﬁ"), aspas e travessões unificados.
// Por padrão junta palavras hifenizadas na quebra de linha ("amplia-\nção" -> "ampliacao");
// com mantemHifen, preserva o hífen ("pré-\nescolar" -> "pre-escolar").
export function normalizar(texto, { mantemHifen = false } = {}) {
  return String(texto)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/­/g, '')
    .replace(/(\p{L})-[^\S\n]*\n\s*(\p{L})/gu, mantemHifen ? '$1-$2' : '$1$2')
    .replace(/[“”«»„]/g, '"').replace(/[‘’‚`´]/g, "'").replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const ehLetra = (c) => c !== undefined && /[\p{L}\p{N}]/u.test(c);

// Primeira ocorrência de `f` em `texto` a partir de `de`, só nas fronteiras de palavra.
function acharPalavra(texto, f, de) {
  let i = texto.indexOf(f, de);
  while (i >= 0) {
    if (!ehLetra(texto[i - 1]) && !ehLetra(texto[i + f.length])) return i;
    i = texto.indexOf(f, i + 1);
  }
  return -1;
}

const separar = (trecho) => String(trecho).split(/\[\s*\.\.\.\s*\]|\[\s*…\s*\]|…|\.\.\./);

// Mensagem de problema no trecho (curto demais, vazio) ou null se estiver apto a ser conferido.
export function problemaNoTrecho(trecho) {
  const frags = separar(trecho).map((f) => normalizar(f)).filter(Boolean);
  if (!frags.length) return 'o trecho está vazio (só reticências)';
  if (frags.length > MAX_FRAGMENTOS) return `use no máximo ${MAX_FRAGMENTOS} pedaços separados por [...]`;
  if (frags.some((f) => f.length < TAM_MIN_FRAGMENTO)) return `cada pedaço do trecho precisa ter pelo menos ${TAM_MIN_FRAGMENTO} caracteres`;
  if (frags.join('').length < TAM_MIN_TOTAL) return `o trecho precisa ter pelo menos ${TAM_MIN_TOTAL} caracteres`;
  return null;
}

// O trecho citado precisa aparecer na página, em palavras inteiras. "[...]" e "…" separam
// fragmentos, que devem aparecer na mesma ordem. Aceita a página com ou sem o hífen de quebra de linha.
export function contemTrecho(textoPagina, trecho) {
  if (problemaNoTrecho(trecho)) return false;
  const frags = separar(trecho).map((f) => normalizar(f)).filter(Boolean);
  return [false, true].some((mantemHifen) => {
    const pagina = normalizar(textoPagina, { mantemHifen });
    let pos = 0;
    for (const f of frags) {
      const i = acharPalavra(pagina, f, pos);
      if (i < 0) return false;
      pos = i + f.length;
    }
    return true;
  });
}

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regexChave = (chave) => new RegExp(`(?<![a-z0-9])${escapar(chave)}${chave.length <= 4 ? '(?![a-z0-9])' : ''}`, 'g');

// Páginas mais prováveis para cada tema (contagem de palavras-chave). Só sugestão.
export function sugerirPaginas(paginas, porArea = 6) {
  const norm = paginas.map((p) => ({ pagina: p.pagina, texto: normalizar(p.texto) }));
  return Object.fromEntries(AREAS.map(({ nome }) => {
    const chaves = PALAVRAS_CHAVE[nome].map((c) => regexChave(normalizar(c)));
    const ranque = norm
      .map(({ pagina, texto }) => ({ pagina, acertos: chaves.reduce((n, re) => n + (texto.match(re)?.length ?? 0), 0) }))
      .filter((x) => x.acertos > 0)
      .sort((a, b) => b.acertos - a.acertos || a.pagina - b.pagina)
      .slice(0, porArea);
    return [nome, ranque];
  }));
}
