// Importa um plano de governo (PDF baixado do TSE) e gera um RASCUNHO para revisão humana.
//
//   npm run importar -- --candidato a --pdf ~/Downloads/plano.pdf \
//     --url "https://divulgacandcontas.tse.jus.br/..." --nome "Nome" [--url-pdf ...] [--baixado-em 2026-10-12]
//     [--sq 123] [--numero 13] [--partido XX] [--aceitar-sem-texto] [--forcar]
//
// Saídas:
//   data/rascunho/candidato-<x>.json    metadados da fonte; propostas vazias; status "rascunho" (versionado)
//   fontes/candidato-<x>.paginas.json   texto de cada página, para leitura (fora do git)
//   fontes/candidato-<x>.sugestoes.json páginas prováveis por tema (fora do git)
// Nada daqui vai para o site: promover para data/ só por PR, depois da revisão humana.
import { existsSync, readFileSync } from 'node:fs';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { AREAS } from '../src/lib/areas.mjs';
import { doRepo, doUsuario } from './lib/caminhos.mjs';
import { lerPdf } from './lib/pdf.mjs';
import { sugerirPaginas } from './lib/texto.mjs';

const falha = (msg) => { console.error(`Erro: ${msg}`); process.exit(1); };

let v;
try {
  ({ values: v } = parseArgs({
    options: {
      candidato: { type: 'string' }, pdf: { type: 'string' }, url: { type: 'string' }, 'url-pdf': { type: 'string' },
      nome: { type: 'string' }, sq: { type: 'string' }, numero: { type: 'string' }, partido: { type: 'string' },
      'baixado-em': { type: 'string' }, 'aceitar-sem-texto': { type: 'boolean' }, forcar: { type: 'boolean' },
    },
  }));
} catch (e) {
  falha(e.message);
}

const TSE = /^https:\/\/divulgacandcontas\.tse\.jus\.br\/[^@\s]*$/;
if (!['a', 'b'].includes(v.candidato)) falha('--candidato deve ser "a" ou "b"');
if (!v.pdf || !existsSync(doUsuario(v.pdf))) falha('--pdf aponta para um arquivo que não existe');
if (!v.url || !TSE.test(v.url)) falha('--url deve ser o link https da candidatura em divulgacandcontas.tse.jus.br');
if (v['url-pdf'] && !TSE.test(v['url-pdf'])) falha('--url-pdf deve ser https em divulgacandcontas.tse.jus.br');
if (v['baixado-em'] && !/^\d{4}-\d{2}-\d{2}$/.test(v['baixado-em'])) falha('--baixado-em deve estar no formato AAAA-MM-DD');

const id = v.candidato;
const saida = doRepo('data', 'rascunho', `candidato-${id}.json`);
const dirFontes = doRepo('fontes');

if (existsSync(saida)) {
  const atual = JSON.parse(readFileSync(saida, 'utf8'));
  if (!v.forcar) falha(`${path.relative(process.cwd(), saida)} já existe (use --forcar para sobrescrever)`);
  if (atual.propostas?.length) {
    await mkdir(dirFontes, { recursive: true });
    const backup = path.join(dirFontes, `candidato-${id}.rascunho.bak-${Date.now()}.json`);
    await copyFile(saida, backup);
    console.warn(`Aviso: o rascunho tinha ${atual.propostas.length} proposta(s); cópia em ${path.relative(process.cwd(), backup)}`);
  }
}

let pdf;
try {
  pdf = await lerPdf(doUsuario(v.pdf));
} catch (e) {
  falha(e.message);
}
const { sha256, totalPages, paginas } = pdf;
const comTexto = paginas.filter((p) => p.texto.trim().length > 20).length;
const semTexto = comTexto < totalPages / 2;
if (semTexto && !v['aceitar-sem-texto']) {
  falha(`só ${comTexto} de ${totalPages} páginas têm texto: o PDF parece escaneado. Faça OCR antes (ex.: ocrmypdf) ou use --aceitar-sem-texto. Obs.: com OCR a citação literal fica menos confiável.`);
}

const fonte = {
  url_tse: v.url,
  ...(v['url-pdf'] && { url_pdf: v['url-pdf'] }),
  sha256_pdf: sha256,
  baixado_em: v['baixado-em'] ?? new Date().toISOString().slice(0, 10),
  paginas_total: totalPages,
  ...(semTexto && { ocr: true }),
  ...(v.sq && { tse_sq_candidato: v.sq }),
  ...(v.numero && { numero: v.numero }),
  ...(v.partido && { partido: v.partido }),
};
const rascunho = {
  id,
  letra: id.toUpperCase(),
  nome: v.nome?.trim() || '[informar nome]',
  status: 'rascunho',
  fonte,
  cobertura: Object.fromEntries(AREAS.map((a) => [a.nome, { consta: false, revisado: false }])),
  propostas: [],
};

await mkdir(path.dirname(saida), { recursive: true });
await mkdir(dirFontes, { recursive: true });
await writeFile(saida, JSON.stringify(rascunho, null, 2) + '\n');
await writeFile(path.join(dirFontes, `candidato-${id}.paginas.json`), JSON.stringify({ sha256_pdf: sha256, paginas }, null, 2));
const sugestoes = sugerirPaginas(paginas);
await writeFile(path.join(dirFontes, `candidato-${id}.sugestoes.json`), JSON.stringify(sugestoes, null, 2));

console.log(`Rascunho: ${path.relative(process.cwd(), saida)}  (${totalPages} páginas, sha256 ${sha256.slice(0, 12)}…)`);
console.log('Páginas com palavras-chave por tema (só orientação):');
for (const [area, lista] of Object.entries(sugestoes)) {
  console.log(`  ${area.padEnd(18)} ${lista.length ? lista.map((x) => `p.${x.pagina}`).join(', ') : '(nenhuma)'}`);
}
console.log('\nAtenção: a sugestão NÃO vale como leitura. Só marque um tema como "não consta" depois de ler o PDF inteiro.');
