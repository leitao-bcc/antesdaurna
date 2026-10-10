// Fonte única da lista de áreas (usada pelo site e pelo validador).
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const AREAS = [
  'Saúde', 'Educação', 'Segurança', 'Economia',
  'Emprego e renda', 'Meio ambiente', 'Moradia', 'Cultura e esporte',
].map((nome) => ({ nome, slug: slug(nome) }));
