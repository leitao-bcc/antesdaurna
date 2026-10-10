import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seloDosTrechos } from './selo.mjs';

const base = () => ({
  fonte: { sha256_pdf: 'a'.repeat(64) },
  propostas: [{ id: 'saude-01', pagina: 3, trecho_original: 'ampliar o SUS e os hospitais', resumo: 'x' }],
});

test('selo: estável e independente do resumo', () => {
  const a = base(); const b = base(); b.propostas[0].resumo = 'outro resumo';
  assert.equal(seloDosTrechos(a), seloDosTrechos(b));
});

test('selo: muda se o trecho, a página, o id ou o PDF mudam', () => {
  const ref = seloDosTrechos(base());
  const t = base(); t.propostas[0].trecho_original += '!';
  const p = base(); p.propostas[0].pagina = 4;
  const i = base(); i.propostas[0].id = 'saude-02';
  const h = base(); h.fonte.sha256_pdf = 'b'.repeat(64);
  for (const alterado of [t, p, i, h]) assert.notEqual(seloDosTrechos(alterado), ref);
});
