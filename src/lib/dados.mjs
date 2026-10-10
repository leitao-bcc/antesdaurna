import a from '../../data/candidato-a.json';
import b from '../../data/candidato-b.json';
import { AREAS } from './areas.mjs';

// Contrato: os dois arquivos têm id "a" e "b" (checado por scripts/validar-dados.mjs).
export const candidatos = [a, b];

export const propostasDe = (cand, area) => cand.propostas.filter((p) => p.area === area);

// 'tem' | 'nao-consta' (revisado e o plano não trata do tema) | 'em-revisao'
export function situacao(cand, area) {
  if (propostasDe(cand, area).length > 0) return 'tem';
  const c = cand.cobertura[area];
  return c && c.consta === false && c.revisado === true ? 'nao-consta' : 'em-revisao';
}

export const emExemplo = candidatos.some((c) => c.status !== 'revisado');

export { AREAS };
