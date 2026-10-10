import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
// Caminho do repositório (padrões) e caminho informado pelo usuário (relativo ao cwd).
export const doRepo = (...partes) => path.join(RAIZ, ...partes);
export const doUsuario = (p) => path.resolve(p);
