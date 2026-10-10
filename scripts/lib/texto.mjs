// Funções puras de texto usadas pelo importador e pelo conferidor de trechos.
import { AREAS } from '../../src/lib/areas.mjs';

// Palavras-chave só para SUGERIR páginas por tema. Quem decide o que vira proposta é a revisão humana.
// Casam no INÍCIO de palavra; as curtas (até 4 letras) casam a palavra inteira ("sus" não casa "sustentável").
export const PALAVRAS_CHAVE = {
  'Saúde': ['saude', 'sus', 'hospital', 'medic', 'remedio', 'vacina', 'atencao basica'],
  'Educação': ['educacao', 'escola', 'professor', 'ensino', 'universidade', 'creche', 'alfabetiza'],
  'Segurança': ['seguranca', 'policia', 'crime', 'violencia', 'presidio', 'penitenciar'],
  'Economia': ['economia', 'imposto', 'tribut', 'inflacao', 'juros', 'fiscal', 'divida', 'orcamento'],
  'Emprego e renda': ['emprego', 'salario', 'trabalho', 'renda', 'desemprego', 'previdencia'],
  'Aposentados e previdência': ['aposentad', 'previdenc', 'inss', 'pension', 'salario minimo', 'bpc'],
  'Combate à pobreza': ['pobreza', 'vulnerabilidade', 'fome', 'assistencia social', 'transferencia de renda', 'cadastro unico', 'inseguranca alimentar'],
  'Mulheres': ['mulher', 'feminicidio', 'violencia domestica', 'igualdade de genero', 'maria da penha'],
  'Minorias e direitos': ['racial', 'racismo', 'indigena', 'quilombola', 'lgbt', 'deficiencia', 'povos tradicionais', 'direitos humanos'],
  'Juventude': ['jovem', 'jovens', 'juventude', 'primeiro emprego'],
  'Meio ambiente': ['meio ambiente', 'clima', 'desmatamento', 'amazonia', 'carbono', 'energia renovavel', 'sustentabil', 'sustentavel'],
  'Moradia': ['moradia', 'habitac', 'casa propria', 'aluguel', 'saneamento', 'urbano'],
  'Cultura e esporte': ['cultura', 'esporte', 'artista', 'lazer', 'patrimonio', 'cinema', 'atleta'],
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
