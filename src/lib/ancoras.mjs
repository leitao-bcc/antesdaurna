// Contrato entre as páginas de tema e a busca: cada coluna de candidato tem um id
// de âncora, e o Pagefind devolve um sub-resultado por âncora.
export const LADOS = ['a', 'b'];
export const ancoraPlano = (id) => `plano-${id}`;
