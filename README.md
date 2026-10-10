# Antes da Urna

Site independente e apartidário que compara, lado a lado, os planos de governo dos dois candidatos do 2º turno presidencial de 2026 (25/10/2026). Endereço: **antesdaurna.com.br**.

Este repositório é público de propósito: qualquer pessoa pode conferir de onde veio cada texto, como foi resumido e corrigir erros.

## Princípios

- **Fonte única:** planos de governo registrados no TSE (DivulgaCandContas), com link para a página exata de cada proposta.
- **Mesmo tratamento:** mesmo espaço, mesmos temas, mesmo tom para os dois candidatos. A ordem é sorteada a cada visita.
- **Sem lacunas escondidas:** se um plano não trata de um tema, aparece "não consta no plano".
- **Linguagem simples e sem adjetivos:** os resumos dizem "propõe X".
- **IA com revisão humana:** os resumos usam IA e são revisados por uma pessoa (veja [docs/metodologia.md](docs/metodologia.md)).
- **Sem recomendação de voto:** o quiz "às cegas" é só um espelho das escolhas de quem usa.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `data/` | Propostas em JSON, um arquivo por candidato ([formato](data/README.md)) |
| `docs/` | Metodologia e critérios editoriais |
| `prototipo/` | Protótipo visual aprovado (referência, não é código de produção) |
| `src/`, `public/` | Site Astro (em construção) |

## Stack

Astro (site 100% estático) + Pagefind (busca no cliente), hospedado na Cloudflare Pages.

## Encontrou um erro?

Abra uma [issue](../../issues) indicando o tema, a proposta e a página do plano original. Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licenças

- **Código:** [MIT](LICENSE)
- **Conteúdo** (resumos e dados em `data/`, textos do site): [CC BY 4.0](LICENSE-CONTEUDO.txt). Os trechos originais dos planos pertencem às respectivas candidaturas e são citados como registrados no TSE.
