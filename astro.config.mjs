import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://antesdaurna.com.br',
  output: 'static',
  integrations: [sitemap()],
  trailingSlash: 'always',
  build: { format: 'directory' },
});
