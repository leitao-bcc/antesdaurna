# Antes da Urna — antesdaurna.com.br

Site independente e apartidário que compara, lado a lado, os planos de governo dos dois candidatos do 2º turno presidencial de 2026 (25/10/2026). Público: eleitores indecisos, com foco em jovens, mas inclusivo para todas as idades.

## Regras de neutralidade (inegociáveis)
- Fonte única: planos de governo registrados no TSE (DivulgaCandContas), com link para a página exata de cada proposta.
- Mesmo espaço, mesmos temas, mesmo tom para os dois. A ordem dos candidatos é sorteada a cada visita.
- Se um plano não trata de um tema, mostrar "não consta no plano" em vez de deixar vazio.
- Resumos em linguagem simples, sem adjetivos valorativos ("propõe X").
- Cores neutras, longe das cores das campanhas: roxo #6B4EE6 (A) e verde-petróleo #0F7A7A (B), fundo #F4F2FA, texto #17142B.
- Página "Como fizemos" com fontes, critérios e aviso de uso de IA nos resumos (com revisão humana).
- Quiz "às cegas" não é recomendação de voto; deixar isso explícito.
- Não fazer impulsionamento pago (restrito a candidatos/partidos).

## Seções
1. Comparador por tema: 42 temas em 9 blocos (Segurança e Justiça; Saúde e cuidados; Educação, ciência e cultura; Economia; Trabalho e proteção social; Infraestrutura, cidades e território; Campo e ambiente; Direitos e inclusão; Estado, democracia e mundo). Lista única em `src/lib/areas.mjs`; critérios e mapa de páginas em `docs/taxonomia-temas.md`. Até 2 propostas por tema e por candidato; públicos transversais (jovens, idosos, mulheres, crianças) são etiquetas, não temas.
2. Busca por palavra/tema com trechos dos dois planos.
3. Quiz às cegas: propostas sem nome, revela no fim.
4. Como fizemos (metodologia) + rodapé "encontrou um erro?".
- Acessibilidade: mobile first, botão A+ para texto maior, contraste alto, leitor de tela, alvos ≥44px.
- Fontes: Bricolage Grotesque (títulos) e Atkinson Hyperlegible (texto).

## Arquitetura
- Site 100% estático: Astro + Pagefind (busca no cliente).
- Dados em `data/` como JSON por candidato. Cada proposta tem:
  `area`, `titulo`, `resumo`, `trecho_original`, `pagina`, `link_pdf`.
- Imagens OG geradas no build, uma por tema (para compartilhar no WhatsApp/Stories).
- Repositório público no GitHub (transparência).

## Hospedagem e métricas
- Cloudflare Pages (plano Free), com deploy automático a cada push no GitHub.
- Domínio antesdaurna.com.br no Registro.br (R$ 40/ano), com DNS apontado para a Cloudflare.
- Cloudflare Web Analytics (sem cookies, sem banner LGPD).
- Eventos (buscas, temas clicados, quiz concluído): Cloudflare Worker + Analytics Engine, só contagens agregadas, sem IP.

## Cronograma
- Até 11/10: domínio + esqueleto no ar
- 12–14/10: extrair, resumir e revisar os planos
- 15/10: lançamento
- até 24/10: divulgação e correções

## Referência
`prototipo/Main.dc.html` é o protótipo visual aprovado (formato de canvas de design, não é código de produção). Use-o como referência de layout, cores e textos.

## Próximos passos
1. Criar o esqueleto Astro com a estrutura acima e o deploy no Cloudflare Pages.
2. Baixar os dois planos de governo no TSE, extrair o texto e montar os JSONs para revisão humana.
