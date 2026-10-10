// Valida os JSONs em data/ antes do build. Falha com mensagem clara.
// 1) forma: data/schema.json (JSON Schema; o enum de áreas vem de src/lib/areas.mjs)
// 2) regras cruzadas e de neutralidade (abaixo)
// Modo estrito (--estrito, ou build de produção na Cloudflare): só publica conteúdo revisado e conferido.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { AREAS, ETIQUETAS } from '../src/lib/areas.mjs';
import { seloDosTrechos } from './lib/selo.mjs';

const estrito = process.argv.includes('--estrito') || process.env.CF_PAGES_BRANCH === 'main';
const raiz = new URL('../data/', import.meta.url);
const erros = [];
const avisos = [];
const NOMES = AREAS.map((a) => a.nome);
const slugDe = Object.fromEntries(AREAS.map((a) => [a.nome, a.slug]));
const RESUMO_MAX = 280;
// Adjetivos valorativos mais comuns; só aviso (a revisão humana decide).
const VALORATIVAS = /\b(ambicios[oa]s?|inovador(?:a|es|as)?|hist[óo]ric[oa]s?|revolucion[áa]ri[oa]s?|importante[s]?|essencial|fundamental|excelente|ousad[oa]s?|moderno|moderna)\b/i;

// O schema fica estático; a lista de áreas é injetada para não existir em dois lugares.
const schema = JSON.parse(readFileSync(new URL('schema.json', raiz), 'utf8'));
schema.properties.cobertura = {
  type: 'object',
  additionalProperties: false,
  required: NOMES,
  properties: Object.fromEntries(NOMES.map((n) => [n, { $ref: '#/$defs/cobertura' }])),
};
schema.$defs.proposta.properties.area = { enum: NOMES };
schema.$defs.proposta.properties.etiquetas.items = { enum: ETIQUETAS };
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const estrutura = ajv.compile(schema);

function ler(caminho, rotulo) {
  try {
    return JSON.parse(readFileSync(new URL(caminho, raiz), 'utf8'));
  } catch (e) {
    erros.push(`${rotulo}: não foi possível ler o JSON (${e.message})`);
    return null;
  }
}

function conferir(d, rotulo, idEsperado, letraEsperada, { publicado }) {
  if (!estrutura(d)) {
    for (const e of estrutura.errors) erros.push(`${rotulo}: ${e.instancePath || '/'} ${e.message}`);
    return;
  }
  if (d.id !== idEsperado) erros.push(`${rotulo}: "id" deve ser "${idEsperado}"`);
  if (d.letra !== letraEsperada) erros.push(`${rotulo}: "letra" deve ser "${letraEsperada}"`);
  if (!publicado && d.status !== 'rascunho') erros.push(`${rotulo}: arquivos em data/rascunho/ devem ter status "rascunho"`);
  if (/[<>]/.test(d.nome) || /[<>]/.test(JSON.stringify(d.fonte ?? {}))) erros.push(`${rotulo}: "nome" e "fonte" não podem ter < ou >`);
  const revisado = d.status === 'revisado';

  // Cobertura: "consta: false" só com zero propostas; "revisado" exige coerência.
  for (const nome of NOMES) {
    const c = d.cobertura[nome];
    const n = d.propostas.filter((p) => p.area === nome).length;
    if (c.consta === false && n > 0) erros.push(`${rotulo}: "${nome}" marcada como não consta, mas tem ${n} proposta(s)`);
    if (c.consta === true && c.revisado && n === 0) erros.push(`${rotulo}: "${nome}" revisada como "consta", mas sem propostas`);
    if (revisado && !c.revisado) erros.push(`${rotulo}: status "revisado", mas "${nome}" não foi revisada`);
  }

  const ids = new Set();
  d.propostas.forEach((p, i) => {
    const onde = `${rotulo} propostas[${i}] (${p.id})`;
    if (ids.has(p.id)) erros.push(`${onde}: id repetido`);
    ids.add(p.id);
    if (!p.id.startsWith(`${slugDe[p.area]}-`)) erros.push(`${onde}: o id deve começar com "${slugDe[p.area]}-" (área ${p.area})`);
    for (const c of ['titulo', 'resumo', 'trecho_original']) {
      if (/[<>]/.test(p[c])) erros.push(`${onde}: "${c}" não pode ter < ou >`);
    }
    if (d.fonte?.url_pdf && p.link_pdf !== d.fonte.url_pdf) erros.push(`${onde}: "link_pdf" deve ser igual a "fonte.url_pdf"`);
    if (revisado) {
      for (const c of ['titulo', 'resumo']) {
        if (/\[(exemplo|revisar|todo|xxx)[^\]]*\]|\bTODO\b|\blorem\b/i.test(p[c])) erros.push(`${onde}: "${c}" parece placeholder`);
      }
      if (p.pagina < 1) erros.push(`${onde}: "pagina" deve ser >= 1 em conteúdo revisado`);
      if (p.pagina > d.fonte.paginas_total) erros.push(`${onde}: "pagina" maior que o total de páginas do plano (${d.fonte.paginas_total})`);
      if (p.resumo.length > RESUMO_MAX) erros.push(`${onde}: "resumo" com ${p.resumo.length} caracteres (máximo ${RESUMO_MAX}, o mesmo para os dois candidatos)`);
      if (!/^(não )?propõe/i.test(p.resumo)) avisos.push(`${onde}: resumo não começa com "propõe" (confira o tom neutro)`);
      const m = p.resumo.match(VALORATIVAS);
      if (m) avisos.push(`${onde}: resumo tem termo valorativo "${m[0]}"`);
    }
  });

  // Conteúdo revisado precisa do selo de conferência dos trechos contra o PDF.
  if (revisado && d.propostas.length > 0) {
    if (!d.fonte.trechos_conferidos_sha256) erros.push(`${rotulo}: falta o selo de conferência (rode "npm run conferir")`);
    else if (d.fonte.trechos_conferidos_sha256 !== seloDosTrechos(d)) erros.push(`${rotulo}: trechos ou páginas mudaram depois da conferência (rode "npm run conferir" de novo)`);
  }
}

const publicados = [];
for (const [arq, id, letra] of [['candidato-a.json', 'a', 'A'], ['candidato-b.json', 'b', 'B']]) {
  const d = ler(arq, arq);
  if (!d) continue;
  publicados.push(d);
  conferir(d, arq, id, letra, { publicado: true });
}
if (publicados.length === 2) {
  const [a, b] = publicados;
  if (a.status !== b.status) erros.push(`os dois candidatos precisam ter o mesmo "status" (${a.status} x ${b.status})`);
  // Simetria de esforço: diferença grande de propostas por área merece atenção humana.
  for (const nome of NOMES) {
    const na = a.propostas?.filter((p) => p.area === nome).length ?? 0;
    const nb = b.propostas?.filter((p) => p.area === nome).length ?? 0;
    if (Math.abs(na - nb) > 2) avisos.push(`"${nome}": ${na} proposta(s) em A x ${nb} em B (confira o mesmo espaço para os dois)`);
  }
}
if (estrito && publicados.some((c) => c.status !== 'revisado')) {
  erros.push('modo estrito: publicar só com "status": "revisado" nos dois arquivos');
}

// Rascunhos do importador: só forma e coerência; nunca vão para o site.
const dirRascunho = new URL('rascunho/', raiz);
if (existsSync(dirRascunho)) {
  for (const arq of readdirSync(dirRascunho).filter((f) => f.endsWith('.json'))) {
    const m = arq.match(/^candidato-([ab])\.json$/);
    if (!m) { erros.push(`rascunho/${arq}: nome deve ser candidato-a.json ou candidato-b.json`); continue; }
    // Convivem enquanto o publicado é só de exemplo; depois da promoção o rascunho deve sumir.
    const publicado = publicados.find((c) => c.id === m[1]);
    if (publicado && publicado.status !== 'exemplo') {
      erros.push(`rascunho/${arq}: já existe data/candidato-${m[1]}.json publicado; depois de promover, apague o rascunho (git mv)`);
    }
    const d = ler(`rascunho/${arq}`, `rascunho/${arq}`);
    if (d) conferir(d, `rascunho/${arq}`, m[1], m[1].toUpperCase(), { publicado: false });
  }
}

for (const a of avisos) console.warn(`aviso: ${a}`);
if (erros.length) {
  console.error('Dados inválidos:\n- ' + erros.join('\n- '));
  process.exit(1);
}
console.log(`Dados ok${estrito ? ' (estrito)' : ''}.`);
