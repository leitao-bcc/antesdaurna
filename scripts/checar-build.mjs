// Depois do build + pagefind: confere o contrato entre as páginas de tema e a busca.
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { AREAS } from '../src/lib/areas.mjs';
import { LADOS, ancoraPlano } from '../src/lib/ancoras.mjs';

const raiz = new URL('../dist/', import.meta.url);
const erros = [];
if (!existsSync(new URL('pagefind/pagefind.js', raiz))) erros.push('dist/pagefind/pagefind.js não existe');
for (const { slug } of AREAS) {
  const f = new URL(`tema/${slug}/index.html`, raiz);
  if (!existsSync(f)) { erros.push(`falta dist/tema/${slug}/index.html`); continue; }
  const html = readFileSync(f, 'utf8');
  if (!html.includes('data-pagefind-body')) erros.push(`tema/${slug}: sem data-pagefind-body`);
  for (const l of LADOS) {
    if (!html.includes(`id="${ancoraPlano(l)}"`)) erros.push(`tema/${slug}: sem âncora ${ancoraPlano(l)}`);
  }
}
// A busca precisa devolver um sub-resultado por plano (âncora) no mesmo tema.
if (!erros.length) {
  const dist = fileURLToPath(raiz);
  const lerArquivo = async (u) => {
    const f = String(u).split('?')[0];
    return new Response(await readFile(f.startsWith(dist) ? f : dist + f.replace(/^\//, '')));
  };
  globalThis.fetch = lerArquivo;
  const pf = await import(new URL('pagefind/pagefind.js', raiz).href);
  await pf.options({ basePath: `${dist}pagefind/` });
  // Cada cabeçalho de coluna tem só o nome do candidato; buscar o nome tem que achar a âncora dele.
  for (const l of LADOS) {
    const nome = JSON.parse(readFileSync(new URL(`../data/candidato-${l}.json`, import.meta.url), 'utf8')).nome;
    const r = await pf.search(nome);
    const urls = (await Promise.all(r.results.slice(0, 20).map((x) => x.data()))).flatMap((d) => (d.sub_results ?? []).map((x) => x.url));
    if (!urls.some((u) => u.endsWith(`#${ancoraPlano(l)}`))) erros.push(`busca: sem sub-resultado ${ancoraPlano(l)} ao buscar "${nome}"`);
  }
}
if (erros.length) { console.error('Build inconsistente:\n- ' + erros.join('\n- ')); process.exit(1); }
console.log('Build ok (âncoras e índice de busca presentes).');
