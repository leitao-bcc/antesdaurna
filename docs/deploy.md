# Deploy (Cloudflare Pages, plano Free)

1. Cloudflare > Workers & Pages > Create > Pages > Connect to Git > `leitao-bcc/antesdaurna`.
2. Build command: `npm run build` · Output directory: `dist` · Variável `NODE_VERSION=24`.
3. Branch de produção: `main`. Cada PR gera um preview automático.
4. Domínio: adicionar `antesdaurna.com.br` em Custom domains e apontar o DNS do Registro.br para os nameservers da Cloudflare.
5. Web Analytics: ativar em Analytics & Logs (sem cookies, sem banner). Se ativar o beacon, ele já é permitido no CSP de `public/_headers`.

O `npm run build` valida os JSONs em `data/` (`scripts/validar-dados.mjs`), gera o site com Astro e indexa a busca com Pagefind.
