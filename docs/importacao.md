# Importação e revisão dos planos

Fluxo para transformar o PDF de um plano de governo registrado no TSE em dados publicáveis. A IA ajuda a redigir, mas **nunca escreve direto no que é publicado**, **toda citação é conferida contra o PDF** e o build de produção só aceita conteúdo **conferido e revisado**.

## 1. Baixar o PDF (manual)

O DivulgaCandContas bloqueia download automatizado (HTTP 403), então baixe pelo navegador: abra a candidatura em https://divulgacandcontas.tse.jus.br e baixe o "Proposta de governo". Anote:

- `--url`: o link da página da candidatura.
- `--url-pdf` (se existir): o endereço **direto do arquivo PDF**. Teste no Chrome e no Safari do celular se `<url-pdf>#page=5` abre na página 5. Se `#page=` não funcionar, o requisito "link para a página exata" não está cumprido; avise antes de publicar.
- A data em que baixou (`--baixado-em`).

O PDF fica na sua máquina; não é versionado. O hash dele vai para o rascunho, e quem revisar pode recalculá-lo (`shasum -a 256 plano.pdf`) a partir do PDF baixado do TSE.

## 2. Importar

```bash
npm run importar -- --candidato a --pdf ~/Downloads/plano-a.pdf \
  --url "https://divulgacandcontas.tse.jus.br/..." --nome "Nome" --baixado-em 2026-10-12 [--url-pdf ...]
```

Cria `data/rascunho/candidato-a.json` (fonte, hash, todas as áreas "em revisão", sem propostas) e, em `fontes/` (fora do git), o texto de cada página e as páginas com palavras-chave por tema. Repita para o candidato B. As letras A e B são só rótulos.

- PDF escaneado: faça OCR antes (`ocrmypdf`) ou use `--aceitar-sem-texto`; a fonte fica marcada `ocr: true` e a citação literal é menos confiável.
- Limites de segurança: 50 MB e 2000 páginas. Rode o importador só na sua máquina.
- `--forcar` sobrescreve o rascunho; se ele já tinha propostas, uma cópia vai para `fontes/`.

**As páginas sugeridas são só orientação** (contagem de palavras-chave neutras, a mesma lista para os dois candidatos, em `scripts/lib/texto.mjs`). Elas **não** substituem a leitura: só marque um tema como "não consta" depois de ler o PDF inteiro.

## 3. Redigir as propostas

Preencha `propostas` no rascunho (com IA ou à mão). Para cada uma:

- `id` estável começando pelo slug da área (`saude-01`), `area`, `titulo`.
- `pagina`: a página **do PDF** (a que o `#page=` usa), contando a partir de 1. Pode diferir da numeração impressa; o site escreve "pág. N do PDF".
- `trecho_original`: citação **literal** da página, de 30 a poucas frases; use `[...]` para omitir pedaços (no máximo 4 pedaços, cada um com 15+ caracteres).
- `resumo`: até 280 caracteres, linguagem simples, sem adjetivos valorativos, começando com "propõe".
- `link_pdf`: o `url_pdf` (se existir) ou o link do plano no TSE; o site acrescenta `#page=N`.

Para cada área: `consta: true` (com propostas) ou `consta: false` (o plano não trata do tema), e depois `revisado: true`. Use o mesmo critério e o mesmo esforço para A e B (o validador avisa se a diferença de propostas por área passar de 2).

## 4. Conferir (grava o selo)

```bash
npm run conferir -- --candidato a --pdf ~/Downloads/plano-a.pdf
```

Relê o PDF, confere se o hash bate e se cada trecho aparece na página indicada. Se tudo ok, grava `fonte.trechos_conferidos_sha256`. Mudar qualquer trecho, página ou id depois disso invalida o selo e o `validar` falha.

O texto extraído pode misturar colunas em PDFs de duas colunas ou com tabelas. **Abra o link de cada proposta e confirme o trecho na página** antes de aprovar.

## 5. Promover por PR

1. Preencha `fonte.revisado_por` e `fonte.revisado_em`, ponha `status: "revisado"`.
2. `git mv data/rascunho/candidato-a.json data/candidato-a.json` (e o mesmo para B; os dois precisam do mesmo status).
3. `npm run validar -- --estrito` precisa passar; é a regra do build de produção.
4. No PR, mostre o quadro de propostas por área, lado a lado, e confirme "abri o link e vi o trecho".
