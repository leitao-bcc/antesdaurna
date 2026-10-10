// Valida os JSONs em data/ antes do build. Falha com mensagem clara.
// Modo estrito (--estrito, ou build de produção na Cloudflare): só publica conteúdo revisado.
import { readFileSync } from 'node:fs';
import { AREAS } from '../src/lib/areas.mjs';

const estrito = process.argv.includes('--estrito') || process.env.CF_PAGES_BRANCH === 'main';
const HOSTS_TSE = ['divulgacandcontas.tse.jus.br'];
const erros = [];
const avisos = [];
const cands = [];

for (const [arq, id, letra] of [['candidato-a.json', 'a', 'A'], ['candidato-b.json', 'b', 'B']]) {
  let d;
  try {
    d = JSON.parse(readFileSync(new URL(`../data/${arq}`, import.meta.url), 'utf8'));
  } catch (e) {
    erros.push(`${arq}: não foi possível ler o JSON (${e.message})`);
    continue;
  }
  cands.push(d);
  if (d.id !== id) erros.push(`${arq}: "id" deve ser "${id}"`);
  if (d.letra !== letra) erros.push(`${arq}: "letra" deve ser "${letra}"`);
  if (typeof d.nome !== 'string' || !d.nome.trim()) erros.push(`${arq}: falta "nome"`);
  if (!['exemplo', 'rascunho', 'revisado'].includes(d.status)) erros.push(`${arq}: status inválido "${d.status}"`);
  const revisado = d.status === 'revisado';
  const props = Array.isArray(d.propostas) ? d.propostas : (erros.push(`${arq}: "propostas" deve ser lista`), []);

  // Cobertura: as 8 áreas declaradas; "consta: false" só com zero propostas.
  for (const { nome } of AREAS) {
    const c = d.cobertura?.[nome];
    const n = props.filter((p) => p.area === nome).length;
    if (!c || typeof c.consta !== 'boolean' || typeof c.revisado !== 'boolean') {
      erros.push(`${arq}: "cobertura" precisa de {consta, revisado} para "${nome}"`);
      continue;
    }
    if (c.consta === false && n > 0) erros.push(`${arq}: "${nome}" marcada como não consta, mas tem ${n} proposta(s)`);
    if (c.consta === true && c.revisado && n === 0) erros.push(`${arq}: "${nome}" revisada como "consta", mas sem propostas`);
    if (revisado && !c.revisado) erros.push(`${arq}: status "revisado", mas "${nome}" não foi revisada`);
  }

  props.forEach((p, i) => {
    const onde = `${arq} propostas[${i}]`;
    if (!AREAS.some((a) => a.nome === p.area)) erros.push(`${onde}: área desconhecida "${p.area}"`);
    for (const c of ['titulo', 'resumo', 'trecho_original', 'link_pdf']) {
      if (typeof p[c] !== 'string' || !p[c].trim()) { erros.push(`${onde}: campo "${c}" vazio`); continue; }
      if (c !== 'link_pdf' && /[<>]/.test(p[c])) erros.push(`${onde}: "${c}" não pode ter < ou >`);
      if (revisado && (c === 'titulo' || c === 'resumo') && /^\s*\[|\[(exemplo|revisar|todo|xxx)[^\]]*\]|\bTODO\b|\blorem\b/i.test(p[c])) erros.push(`${onde}: "${c}" parece placeholder`);
    }
    if (!Number.isInteger(p.pagina) || p.pagina < 0) erros.push(`${onde}: "pagina" deve ser inteiro`);
    if (revisado && !(p.pagina >= 1)) erros.push(`${onde}: "pagina" deve ser >= 1 em conteúdo revisado`);
    if (revisado && !/^(não )?propõe/i.test(p.resumo ?? '')) avisos.push(`${onde}: resumo não começa com "propõe" (confira o tom neutro)`);
    try {
      const u = new URL(p.link_pdf);
      if (u.protocol !== 'https:' || !HOSTS_TSE.includes(u.hostname)) erros.push(`${onde}: "link_pdf" deve ser https em ${HOSTS_TSE.join(', ')}`);
    } catch {
      erros.push(`${onde}: "link_pdf" não é uma URL válida`);
    }
  });
}

if (cands.length === 2 && cands[0].status !== cands[1].status) {
  erros.push(`os dois candidatos precisam ter o mesmo "status" (${cands[0].status} x ${cands[1].status})`);
}
if (estrito && cands.some((c) => c.status !== 'revisado')) {
  erros.push('modo estrito: publicar só com "status": "revisado" nos dois arquivos');
}

for (const a of avisos) console.warn(`aviso: ${a}`);
if (erros.length) {
  console.error('Dados inválidos:\n- ' + erros.join('\n- '));
  process.exit(1);
}
console.log(`Dados ok${estrito ? ' (estrito)' : ''}.`);
