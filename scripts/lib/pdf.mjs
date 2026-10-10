import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extractText, getDocumentProxy } from 'unpdf';

const MAX_BYTES = 50 * 1024 * 1024;
const MAX_PAGINAS = 2000;

// Lê o PDF e devolve o hash, o total de páginas e o texto de cada página (a partir de 1).
// PDF é entrada não confiável: limita tamanho e páginas e devolve erro claro.
export async function lerPdf(caminho) {
  const { size } = await stat(caminho);
  if (size > MAX_BYTES) throw new Error(`PDF grande demais (${Math.round(size / 1e6)} MB; limite ${MAX_BYTES / 1e6} MB)`);
  const bytes = await readFile(caminho);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  let totalPages, text;
  try {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    ({ totalPages, text } = await extractText(pdf, { mergePages: false }));
  } catch (e) {
    throw new Error(`não foi possível ler o PDF (corrompido ou protegido por senha?): ${e.message}`);
  }
  if (!(totalPages >= 1)) throw new Error('o PDF não tem páginas');
  if (totalPages > MAX_PAGINAS) throw new Error(`PDF com páginas demais (${totalPages}; limite ${MAX_PAGINAS})`);
  return { sha256, totalPages, paginas: text.map((texto, i) => ({ pagina: i + 1, texto })) };
}
