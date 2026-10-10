import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, contemTrecho, problemaNoTrecho, sugerirPaginas, PALAVRAS_CHAVE } from './texto.mjs';
import { AREAS } from '../../src/lib/areas.mjs';

test('normalizar: acentos, espaços, aspas e hifenização', () => {
  assert.equal(normalizar('  Educação\n  “básica”  '), 'educacao "basica"');
  assert.equal(normalizar('amplia-\nção do SUS'), 'ampliacao do sus');
  assert.equal(normalizar('2020 – 2024'), '2020 - 2024');
});

test('normalizar: ligaduras de PDF e hífen mantido', () => {
  assert.equal(normalizar('ﬁnanciamento da saúde'), 'financiamento da saude');
  assert.equal(normalizar('pré-\nescolar', { mantemHifen: true }), 'pre-escolar');
  assert.equal(normalizar('pré-\nescolar'), 'preescolar');
});

test('contemTrecho: trecho literal, tolerante a quebras de linha', () => {
  const pagina = 'Vamos ampliar o SUS e\nos hospitais regionais para reduzir filas.';
  assert.equal(contemTrecho(pagina, 'ampliar o SUS e os hospitais regionais'), true);
  assert.equal(contemTrecho(pagina, 'extinguir o SUS e os hospitais'), false);
});

test('contemTrecho: composto quebrado no hífen casa com e sem hífen', () => {
  const pagina = 'Ampliar a rede de ensino pré-\nescolar em todo o país.';
  assert.equal(contemTrecho(pagina, 'rede de ensino pré-escolar em todo'), true);
  assert.equal(contemTrecho(pagina, 'rede de ensino preescolar em todo'), true);
});

test('contemTrecho: fragmentos com [...] ou "..." precisam estar em ordem', () => {
  const pagina = 'Criar creches em todos os bairros. Valorizar o professor. Ampliar o ensino técnico integral.';
  assert.equal(contemTrecho(pagina, 'Criar creches em todos [...] ensino técnico integral'), true);
  assert.equal(contemTrecho(pagina, 'Criar creches em todos... ensino técnico integral'), true);
  assert.equal(contemTrecho(pagina, 'ensino técnico integral [...] Criar creches em todos'), false);
});

test('contemTrecho: exige palavras inteiras (sem casar dentro de outra palavra)', () => {
  assert.equal(contemTrecho('Energia sustentável para todos os brasileiros', 'energia sustentável para todos os'), true);
  assert.equal(contemTrecho('Energia sustentável para todos os brasileiros', 'tentável para todos os brasileiros'), false);
});

test('problemaNoTrecho: vazio, curto demais ou ok', () => {
  assert.match(problemaNoTrecho('[...]'), /vazio/);
  assert.match(problemaNoTrecho('SUS'), /pelo menos/);
  assert.match(problemaNoTrecho('uma frase longa o bastante [...] curta'), /pelo menos 15/);
  assert.match(problemaNoTrecho('aaaaaaaaaaaaaaa [...] bbbbbbbbbbbbbbb [...] ccccccccccccccc [...] ddddddddddddddd [...] eeeeeeeeeeeeeee'), /no máximo/);
  assert.equal(problemaNoTrecho('ampliar o SUS e os hospitais regionais'), null);
  assert.equal(contemTrecho('SUS aqui, sustentável', 'SUS'), false);
});

test('sugerirPaginas: cobre todas as áreas e ordena por acertos', () => {
  assert.deepEqual(Object.keys(PALAVRAS_CHAVE), AREAS.map((a) => a.nome));
  const s = sugerirPaginas([
    { pagina: 1, texto: 'Apresentação geral' },
    { pagina: 2, texto: 'Saúde: SUS, hospital e vacina' },
    { pagina: 3, texto: 'O SUS' },
    { pagina: 4, texto: 'Energia sustentável' },
  ]);
  assert.deepEqual(s['Saúde'].map((x) => x.pagina), [2, 3]);
  assert.deepEqual(s['Moradia'], []);
  assert.deepEqual(s['Meio ambiente'].map((x) => x.pagina), [4]);
});

test('sugerirPaginas: lista vazia e limite por área', () => {
  assert.deepEqual(sugerirPaginas([])['Saúde'], []);
  const muitas = Array.from({ length: 10 }, (_, i) => ({ pagina: i + 1, texto: 'saude' }));
  assert.equal(sugerirPaginas(muitas, 3)['Saúde'].length, 3);
});
