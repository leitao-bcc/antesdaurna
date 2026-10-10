# Dados

Dois arquivos JSON: `candidato-a.json` (`id: "a"`, `letra: "A"`) e `candidato-b.json` (`id: "b"`, `letra: "B"`). As letras são só rótulos.

```json
{
  "id": "a",
  "letra": "A",
  "nome": "Nome do candidato",
  "status": "exemplo | rascunho | revisado",
  "fonte": {
    "url_tse": "https://divulgacandcontas.tse.jus.br/...",
    "sha256_pdf": "…64 hex…",
    "baixado_em": "2026-10-12",
    "paginas_total": 80,
    "trechos_conferidos_em": "2026-10-14",
    "trechos_conferidos_sha256": "…selo gravado por npm run conferir…",
    "revisado_por": "Nome",
    "revisado_em": "2026-10-14"
  },
  "cobertura": {
    "Saúde": { "consta": true, "revisado": true },
    "Moradia": { "consta": false, "revisado": true }
  },
  "propostas": [
    {
      "area": "Saúde",
      "id": "saude-01",
      "titulo": "Título curto da proposta",
      "resumo": "Propõe X, em linguagem simples e sem adjetivos.",
      "trecho_original": "Trecho literal do plano.",
      "pagina": 12,
      "link_pdf": "https://divulgacandcontas.tse.jus.br/..."
    }
  ]
}
```

- **Áreas:** Saúde, Educação, Segurança, Economia, Emprego e renda, Meio ambiente, Moradia, Cultura e esporte (lista única em `src/lib/areas.mjs`). A `cobertura` declara as 8.
- **"Não consta no plano"** só aparece quando `consta: false` e `revisado: true`. Sem revisão, o site mostra "Em revisão".
- **`status: "revisado"`** exige, para os dois arquivos: todas as áreas revisadas, `pagina >= 1`, resumos que começam com "propõe" e sem placeholders. O build de produção (Cloudflare, branch `main`) só aceita `revisado`.
- `link_pdf` precisa ser `https` do domínio do TSE (e igual a `fonte.url_pdf`, se existir). O site acrescenta `#page=N`, onde N é a página **do PDF**.
- Conteúdo `revisado` exige o selo de conferência dos trechos (`npm run conferir`), resumos de até 280 caracteres e `pagina` dentro do total de páginas.
- A estrutura está em [`schema.json`](schema.json) (JSON Schema). `fonte` é obrigatória fora de `exemplo`; `revisado_por` e `revisado_em`, em `revisado`. Ids de proposta são únicos.
- Rascunhos do importador ficam em [`rascunho/`](rascunho/) e nunca vão para o site; veja [docs/importacao.md](../docs/importacao.md).
- `npm run validar` confere tudo; `npm run validar -- --estrito` simula a regra de produção.

Resumos são gerados com apoio de IA e revisados por uma pessoa antes de entrar aqui. Licença: CC BY 4.0.
