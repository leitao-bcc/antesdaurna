// Confere se cada "trecho_original" é uma citação literal da página indicada, relendo o PDF.
// Se tudo bate, grava o "selo de conferência" em fonte (usado por `validar --estrito`).
//
//   npm run conferir -- --candidato a --pdf ~/Downloads/plano-a.pdf [--arquivo data/candidato-a.json] [--sem-selo]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { doRepo, doUsuario } from './lib/caminhos.mjs';
import { lerPdf } from './lib/pdf.mjs';
import { seloDosTrechos } from './lib/selo.mjs';
import { contemTrecho, problemaNoTrecho } from './lib/texto.mjs';

const falha = (msg) => { console.error(`Erro: ${msg}`); process.exit(1); };

let v;
try {
  ({ values: v } = parseArgs({ options: { candidato: { type: 'string' }, pdf: { type: 'string' }, arquivo: { type: 'string' }, 'sem-selo': { type: 'boolean' } } }));
} catch (e) {
  falha(e.message);
}
if (!['a', 'b'].includes(v.candidato)) falha('--candidato deve ser "a" ou "b"');
if (!v.pdf || !existsSync(doUsuario(v.pdf))) falha('--pdf aponta para um arquivo que não existe (a conferência relê o PDF)');

const id = v.candidato;
const padrao = ['data/rascunho', 'data'].map((d) => doRepo(d, `candidato-${id}.json`)).find((f) => existsSync(f));
const arquivo = v.arquivo ? doUsuario(v.arquivo) : padrao;
if (!arquivo || !existsSync(arquivo)) falha(`não achei o arquivo de dados do candidato ${id} (use --arquivo)`);

let dados;
try {
  dados = JSON.parse(readFileSync(arquivo, 'utf8'));
} catch (e) {
  falha(`JSON inválido em ${arquivo}: ${e.message}`);
}
if (!Array.isArray(dados.propostas) || !dados.fonte?.sha256_pdf) falha('o arquivo precisa ter "propostas" e "fonte.sha256_pdf"');
if (dados.propostas.length === 0) { console.log('Nenhuma proposta para conferir ainda.'); process.exit(0); }

let pdf;
try {
  pdf = await lerPdf(doUsuario(v.pdf));
} catch (e) {
  falha(e.message);
}

const erros = [];
if (dados.fonte.sha256_pdf !== pdf.sha256) erros.push('o hash do PDF não bate com "fonte.sha256_pdf": este não é o PDF importado');
for (const p of dados.propostas) {
  const onde = p.id ?? '(sem id)';
  if (!Number.isInteger(p.pagina) || typeof p.trecho_original !== 'string') { erros.push(`${onde}: faltam "pagina" ou "trecho_original"`); continue; }
  const problema = problemaNoTrecho(p.trecho_original);
  if (problema) { erros.push(`${onde}: ${problema}`); continue; }
  const pagina = pdf.paginas.find((x) => x.pagina === p.pagina);
  if (!pagina) { erros.push(`${onde}: a página ${p.pagina} não existe no PDF`); continue; }
  if (!contemTrecho(pagina.texto, p.trecho_original)) erros.push(`${onde}: o trecho não aparece na página ${p.pagina}`);
}
if (erros.length) { console.error('Trechos não conferem:\n- ' + erros.join('\n- ')); process.exit(1); }

console.log(`Trechos ok: ${dados.propostas.length} proposta(s) de ${dados.nome} conferidas contra o PDF.`);
if (!v['sem-selo']) {
  dados.fonte.trechos_conferidos_em = new Date().toISOString().slice(0, 10);
  dados.fonte.trechos_conferidos_sha256 = seloDosTrechos(dados);
  writeFileSync(arquivo, JSON.stringify(dados, null, 2) + '\n');
  console.log(`Selo de conferência gravado em ${path.relative(process.cwd(), arquivo)}.`);
}
console.log('Lembrete: o texto extraído pode misturar colunas. Abra o link de cada proposta e confirme o trecho na página.');
