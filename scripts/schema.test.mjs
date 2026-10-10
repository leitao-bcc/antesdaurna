import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const valida = ajv.compile(JSON.parse(readFileSync(new URL('../data/schema.json', import.meta.url), 'utf8')));

const base = () => ({ id: 'a', letra: 'A', nome: 'X', status: 'exemplo', cobertura: {}, propostas: [] });
const fonte = () => ({ url_tse: 'https://divulgacandcontas.tse.jus.br/x', sha256_pdf: 'a'.repeat(64), baixado_em: '2026-10-12', paginas_total: 10 });

test('schema: exemplo não precisa de fonte', () => assert.equal(valida(base()), true));
test('schema: status ausente ou inválido falha', () => {
  const { status, ...semStatus } = base();
  assert.equal(valida(semStatus), false);
  assert.equal(valida({ ...base(), status: 'qualquer' }), false);
});
test('schema: rascunho exige fonte', () => {
  assert.equal(valida({ ...base(), status: 'rascunho' }), false);
  assert.equal(valida({ ...base(), status: 'rascunho', fonte: fonte() }), true);
});
test('schema: revisado exige revisado_por e revisado_em', () => {
  assert.equal(valida({ ...base(), status: 'revisado', fonte: fonte() }), false);
  assert.equal(valida({ ...base(), status: 'revisado', fonte: { ...fonte(), revisado_por: 'Ana', revisado_em: '2026-10-14' } }), true);
});
test('schema: hash e url inválidos falham', () => {
  assert.equal(valida({ ...base(), status: 'rascunho', fonte: { ...fonte(), sha256_pdf: 'zz' } }), false);
  assert.equal(valida({ ...base(), status: 'rascunho', fonte: { ...fonte(), url_tse: 'http://x.com' } }), false);
});

test('schema: url fora do domínio do TSE ou com credenciais falha', () => {
  const ruim = ['https://exemplo.com/x', 'https://divulgacandcontas.tse.jus.br.evil.com/x', 'https://user@divulgacandcontas.tse.jus.br/x'];
  for (const url_tse of ruim) assert.equal(valida({ ...base(), status: 'rascunho', fonte: { ...fonte(), url_tse } }), false, url_tse);
});

test('schema: aceita os dois endereços oficiais do TSE', () => {
  for (const url_tse of ['https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-pt', 'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/1']) {
    assert.equal(valida({ ...base(), status: 'rascunho', fonte: { ...fonte(), url_tse } }), true, url_tse);
  }
});
