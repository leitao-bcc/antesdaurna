import { createHash } from 'node:crypto';

// "Selo de conferência": resume o PDF e todos os trechos/páginas citados. `npm run conferir` grava;
// `npm run validar -- --estrito` recalcula. Mudou um trecho ou uma página depois da conferência, o selo quebra.
export function seloDosTrechos(dados) {
  const itens = dados.propostas.map((p) => [p.id, p.pagina, p.trecho_original]);
  return createHash('sha256').update(JSON.stringify({ pdf: dados.fonte.sha256_pdf, itens })).digest('hex');
}
