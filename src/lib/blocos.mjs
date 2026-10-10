import { AREAS, BLOCOS } from './areas.mjs';

const slugar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Blocos com número (1..N), âncora (#bloco-...) e os temas completos, na ordem de exibição.
export const BLOCOS_COM_TEMAS = BLOCOS.map((b, i) => ({
  numero: i + 1,
  nome: b.nome,
  ancora: `bloco-${slugar(b.nome)}`,
  temas: b.areas.map((slug) => {
    const tema = AREAS.find((a) => a.slug === slug);
    if (!tema) throw new Error(`bloco "${b.nome}" lista um tema inexistente: ${slug}`);
    return tema;
  }),
}));

export const blocoDoTema = (area) => BLOCOS_COM_TEMAS.find((b) => b.nome === area.bloco);

// Tema anterior e próximo na ordem do índice (atravessa blocos).
export function vizinhos(slug) {
  const i = AREAS.findIndex((a) => a.slug === slug);
  return { anterior: AREAS[i - 1] ?? null, proximo: AREAS[i + 1] ?? null };
}
