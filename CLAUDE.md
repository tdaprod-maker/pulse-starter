# Pulse Starter — Guia para Agentes de Código

Este arquivo é para quem vai *mexer no código*. Para contexto de produto, modelo de
negócio e estado de features, veja `CONTEXT.md` — não duplique isso aqui.

## Stack

- **Frontend:** React 19 + TypeScript + Vite 7, PWA via `vite-plugin-pwa` (Workbox)
- **Canvas:** Konva + `react-konva` — renderização de templates, sem lib de edição externa
- **Estado:** Zustand (`src/state/useStore.ts`) com `persist`/`createJSONStorage`
- **Backend:** Vercel Functions (Node.js) em `api/*.js` — uma função por rota, sem framework
- **Banco/Auth/Storage:** Supabase
- **Pagamentos:** Stripe (`api/stripe.js`, `bodyParser: false` para o webhook)
- **IA texto/visão:** Claude Haiku 4.5 via chamada direta à Anthropic Messages API (sem SDK) —
  inclui análise de imagem (content blocks `type: 'image'`, `source.type: 'base64'`) usada em
  `api/analyze-references.js` e `api/review-post.js`
- **IA imagem:** `gpt-image-1` (Standard, `api/generate-image-ai.js`) e `gpt-image-2.5-flare`
  (Premium, `api/generate-premium.js` — todas as chamadas: `generations` e `edits`) via OpenAI,
  chamada direta (sem SDK). O Premium usava `gpt-image-2` até 09/09/2026; o swap para o
  `2.5-flare` não exigiu mudança de schema (mesmos params `model`/`prompt`/`n`/`size`/`quality`,
  mesmo envelope de resposta). Rate card de tokens idêntico ($5/$8/$30 por 1M in-text/in-img/out-img).
- **Roteamento de API:** `vercel.json` reescreve `/api/instagram-post` etc. para
  `/api/instagram?action=post` — vários endpoints são multiplexados por `action` num único arquivo
- **Helpers server-side:** `api-lib/*.js` são módulos importados pelas rotas `/api/*` (só rodam no
  servidor, nunca no client). `supabaseAdmin.js` (client service-role), `provisionAccount.js`
  (`ensureUserForCheckout`), `sendEmail.js` (Resend via REST, sem SDK — mesmo padrão dos outros
  clientes de API externa). O Vercel empacota `api-lib/` junto com `api/` automaticamente.

## Comandos

```
npm run dev      # vite dev server
npm run build    # tsc -b && vite build — SEMPRE rodar antes de considerar uma task pronta
npm run lint      # eslint .
npm run preview   # preview do build de produção
```

Não existe suíte de testes automatizados neste projeto — `build` + `lint` são a verificação
disponível. Teste fluxos de UI manualmente quando a mudança afeta o editor/canvas.

## Padrões dos endpoints `/api/*.js`

Os endpoints de geração via IA (`agent-chat.js`, `generate-carousel.js`, `generate-post.js`)
repetem os mesmos três padrões. Eles **não são compartilhados via módulo importado** — cada
arquivo tem sua própria cópia local das funções abaixo. Ao alterar uma regra de prompt que deveria
valer em todos os lugares (ex: anti-alucinação, anti-emoji, anti-IA-tell), edite **cada arquivo que
tiver a função**, não só um.

### 1. Retry com backoff (3 tentativas)
```js
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt)) // ou 3000 * attempt
    // ... chamada à API ...
    return res.status(200).json(parsed)
  } catch (err) {
    console.error(`[endpoint] attempt ${attempt} erro:`, err)
    if (attempt === 2) return res.status(500).json({ error: err.message })
  }
}
```
Presente em `agent-chat.js` (2x), `generate-carousel.js`, `generate-post.js`, `analyze-references.js`,
`review-post.js`.

### 2. `extractJSON` tolerante a markdown
A resposta do modelo às vezes vem envolta em ` ```json ` ou com texto antes/depois do objeto.
`generate-carousel.js`, `generate-post.js`, `analyze-references.js` e `review-post.js` têm uma
função `extractJSON(raw)` que tenta, em ordem: `JSON.parse` direto → extrair bloco
` ```json...``` ` via regex → extrair o primeiro `{...}` via regex → lançar erro. `agent-chat.js`
usa a versão mais simples inline:
`raw.replace(/\`\`\`json|\`\`\`/g, '').trim()` seguido de `JSON.parse`. Ao criar um endpoint novo
que fala com um LLM, reuse esse padrão em vez de confiar que a resposta vem em JSON puro.

### 3. Funções de regras compartilhadas por arquivo
`getCurrentDateContext()` — injeta a data real do servidor no prompt, para o modelo não usar anos
desatualizados por viés de treino (ex: "2024" em vez do ano corrente).

`buildAntiHallucinationRules(dateCtx)` — regras contra datas desatualizadas, estatísticas
inventadas, emojis e tiques de escrita de IA (ver `buildAntiSlopRules` abaixo). Presente em
`agent-chat.js`, `generate-carousel.js` e `generate-post.js`.

`buildAntiSlopRules()` — regras específicas contra tiques de texto gerado por IA em legendas:
travessão como recurso estilístico, estrutura "não é apenas X, é Y", aberturas genéricas,
adjetivos de enchimento, ritmo de frase repetitivo, voz passiva. Presente em `generate-carousel.js`
e `generate-post.js`. Em `agent-chat.js` a mesma lógica está resumida dentro de
`buildAntiHallucinationRules` (o arquivo não gera legenda final, só o briefing que alimenta os
outros endpoints).

**Histórico:** `generate-post.js` (legenda do Standard, posts únicos) ficou sem essas duas funções
por um tempo depois delas serem adicionadas a `agent-chat.js`/`generate-carousel.js` — cada arquivo
tem sua cópia local, então adicionar a regra num não propaga pros outros. Resultado: o Standard
continuou gerando legendas com emoji mesmo depois da proibição "estar implementada". Ao adicionar
uma regra global de prompt daqui pra frente, edite os **três** arquivos (`agent-chat.js`,
`generate-carousel.js`, `generate-post.js`) na mesma tarefa, não só o que motivou a mudança.

### Engine standard vs premium
`agent-chat.js` sempre retorna `engine: "standard"` no JSON — a escolha entre Standard e Premium é
do usuário na interface, nunca do agente. Não mude isso sem necessidade explícita do produto.

## Canvas: escala dinâmica (não usar caixa fixa em pixels)

Padrão canônico para caber o canvas inteiro na área visível, sem cortar, em qualquer viewport:

```js
const containerRef = useRef<HTMLDivElement>(null)
const [size, setSize] = useState({ width: 0, height: 0 })
useLayoutEffect(() => {
  const el = containerRef.current
  if (!el) return
  const update = () => setSize({ width: el.clientWidth, height: el.clientHeight })
  update()
  const ro = new ResizeObserver(update)
  ro.observe(el)
  return () => ro.disconnect()
}, [/* dependência que garante que o el já está montado, ex: `ready` */])

const scale = Math.min(
  (size.width - PADDING * 2) / template.width,
  (size.height - PADDING * 2) / template.height,
)
```

Origem: `src/pages/EditorPage.tsx` (canvas principal do editor) tem esse padrão desde o início.
`src/components/CarouselViewer.tsx` reproduzia o bug duas vezes antes de ser alinhado a esse
padrão: primeiro no modo premium (caixa calculada via proporção fixa 4:5 + ResizeObserver
manual — corrigido trocando para `object-fit: contain` puro em CSS, já que ali é uma `<img>`), e
depois no modo standard (`canvasScale = Math.min(500 / width, 600 / height)` — uma caixa
**hardcoded**, não medida). O modo standard usa Konva (não `<img>`), então `object-fit` não se
aplica — a correção certa ali é medir o container real com `ResizeObserver`, replicando o padrão
do `EditorPage.tsx`, e foi isso que foi feito.

**Regra geral:** ao construir qualquer superfície de canvas/imagem que precisa caber numa área
sem cortar, comece checando se `EditorPage.tsx` já resolveu esse problema antes de inventar um
cálculo novo. Nunca hardcode uma caixa em pixels (`500x600`, `400x500`, etc.) como scale de canvas
— ela some funciona no viewport em que foi testada.

## Sistema de templates do Standard: famílias por nicho + capacidades do CanvasEngine

O catálogo original tinha 32 templates genéricos (ver `src/templates/index.ts`). Em vez de
substituí-los, foram adicionados **10 templates novos organizados em 5 famílias por nicho** (2
variações cada), registrados junto aos 32 antigos — os antigos continuam funcionando (posts salvos
que os referenciam não quebram) mas deixaram de ser a escolha automática da IA para seus nichos
(ver `REGRA PRIORITÁRIA` em `api/generate-post.js`, que agora prioriza as famílias novas e só cai
nos templates antigos por pedido explícito do usuário pelo nome).

As 5 famílias: `clinic-light`/`clinic-dark` (saúde/odonto/estética), `estate-warm-bottom`/
`estate-warm-top` (imóveis/construção), `food-vivid`/`food-noir` (food/gastronomia),
`editorial-dark-pop`/`editorial-light-pop` (moda/tech/negócios), `warm-circle-bold`/
`warm-circle-soft` (pets/educação/fitness/esportes). Cada família tem paleta e tipografia própria
(evitando Inter genérico e a paleta bege banida) — ver os comentários no topo de cada
`variants.ts` para o racional de design.

Isso exigiu três capacidades novas no `CanvasEngine.tsx` (`src/engine/CanvasEngine.tsx`), todas
aditivas e retrocompatíveis (nenhum dos 32 templates antigos é afetado):

1. **Gradiente real em shapes** — `renderElement` (bloco `el.type === 'shape'`) lê
   `props.fillLinearGradientColorStops`/`fillRadialGradientColorStops` (+ `StartPoint`/`EndPoint`/
   `StartRadius`/`EndRadius`) e passa `fillPriority` correspondente pro `<Rect>` do Konva. Sem
   essas props, comportamento idêntico a antes (fill sólido). Para simular um gradiente de fundo
   sem foto, adicione um shape full-canvas como `elements[0]` (ver `bgGradient()` em
   `clinic-dark/variants.ts`) — ele desenha por cima do `background` sólido, antes dos outros
   elementos. Para um overlay de gradiente sobre foto (em vez do overlay chapado padrão), zere o
   `overlayOpacity` do template no `CanvasEngine.tsx` (mesmo padrão de override por prefixo já
   usado ali) e adicione o shape gradiente como `elements[0]` (ver `estate-warm-bottom/variants.ts`
   + o comentário no `overlayOpacity` do engine).

2. **Flip de texto pra branco quando há foto** — generaliza o padrão que já existia só pra
   `editorial-card`/`hero-title`. Templates com texto escuro sobre fundo claro (ex:
   `editorial-light-pop`, `warm-circle-bold/soft`) ficam **ilegíveis** se o usuário adicionar uma
   foto de fundo, porque o overlay padrão sempre escurece a foto (pensado pra texto branco) — meça
   o contraste antes de assumir que "funciona com foto" (ver `PHOTO_TEXT_FLIP_PREFIXES` em
   `CanvasEngine.tsx`). Qualquer template novo com texto escuro sobre fundo claro precisa entrar
   nessa lista, ou entrar em `PHOTO_TEXT_FLIP_EXCLUDE_IDS` se algum elemento específico (ex: uma
   palavra de destaque colorida) já tiver contraste garantido mesmo com foto e não deva virar
   branco. **Override manual do usuário:** se o usuário escolher uma cor de texto pelo
   `PropertiesPanel` (`ColorSwatch` da aba de texto), `syncElementStyle` grava `props.colorOverride
   = true` junto com `fill` — `renderElement` em `CanvasEngine.tsx` verifica esse flag primeiro e
   pula o auto-flip pra branco quando presente, senão a escolha manual do color picker parecia não
   fazer efeito nesses templates com foto de fundo (bug real, corrigido).

3. **`TEMPLATE_FIELDS` em `api/generate-post.js` é a fonte de verdade dos IDs de elemento** — cada
   template novo precisa de uma entrada lá com os nomes de campo exatamente iguais aos `id` dos
   elementos `text` no `variants.ts` (é assim que `AIPanel.tsx`/`AgentChat.tsx` aplicam
   `result.texts[fieldId]` no elemento certo via `el.id === fieldId`). Templates novos não precisam
   entrar no `ACCENT_ELEMENT` (mapa em `AIPanel.tsx`/`AgentChat.tsx`) — isso é opt-in e, se você
   quer que a família mantenha sua paleta fixa (em vez de ser sobrescrita pelas 3 cores genéricas
   que a IA sempre escolhe via `accentColor`), é melhor não registrar.

## Estado (Zustand)

`src/state/useStore.ts` define `Template`, `CanvasElement` e as ações que os manipulam
(`addTemplate`, `updateElement`, `setTemplateBackground`, `setTemplateLogo*`, etc.). Um "post" é
um `Template` com `elements[]`; um carrossel é uma lista de `Template`s com IDs
`carousel-slide-{i}`. Ao adicionar um campo novo ao `Template`, documente com um comentário
`/** ... */` acima do campo (padrão já seguido no arquivo) explicando faixa de valores e default.

## Convenções de comentário e nomenclatura

- Comentários em **português**, só quando explicam o *porquê* (uma restrição não-óbvia, um
  workaround para um bug específico, uma decisão que outra pessoa razoavelmente questionaria) —
  nunca o *o quê* (isso o código já diz). Ver exemplos reais em `CanvasEngine.tsx` e
  `CarouselViewer.tsx`.
- Arquivos de API: `kebab-case.js` (`generate-carousel.js`, `agent-chat.js`).
- Componentes React: `PascalCase.tsx`.
- Serviços/utilitários: `camelCase.ts` em `src/services/`.
- Sem testes automatizados — não crie arquivos `*.test.ts` a menos que o usuário peça
  explicitamente e configure o runner.

## Pegadinhas conhecidas

- Existem arquivos `.bak`/`.bak2`/`.bak3`/`.bak4` soltos em `src/pages/` e `src/components/`
  (ex: `PremiumPage.tsx.bak4`, `PropertiesPanel.tsx.bak`) — são backups manuais do usuário, não
  são importados em lugar nenhum. Não edite nem delete sem perguntar; não confunda com o arquivo
  ativo ao fazer busca por nome.
- **`src/services/gemini.ts` está parcialmente migrado pra Claude Haiku.** `analyzeVisualReferences`
  e `reviewPost` agora só fazem `fetch` pros endpoints server-side `api/analyze-references.js` e
  `api/review-post.js` (Claude Haiku 4.5 com content blocks de imagem) — corrigido porque as duas
  funções chamavam `generativelanguage.googleapis.com` **direto do client** com
  `VITE_GEMINI_API_KEY` embutida no bundle público, violando a regra de chave só server-side, e um
  `catch` vazio no chamador escondia qualquer falha (o botão "parecia não fazer nada"). As outras
  três funções do arquivo (`turboPrompt`, `turboPromptEditor`, `breakCarouselIntoSlides`) **ainda
  chamam Gemini direto do client** com a mesma chave exposta — não migradas nessa correção
  (fora do escopo do bug reportado). Ao mexer nelas, considere migrar pro mesmo padrão Claude
  Haiku server-side antes de estender.
- As três funções de regras de prompt (`getCurrentDateContext`, `buildAntiHallucinationRules`,
  `buildAntiSlopRules`) são cópias locais em cada um dos três arquivos de geração, não um módulo
  compartilhado — já causou um bug real (regra de "sem emoji" adicionada em dois arquivos, mas
  esquecida em `generate-post.js`, que continuou gerando legenda com emoji no Standard). Ao mudar
  uma regra "global" de prompt, grep por `buildAntiHallucinationRules\|buildAntiSlopRules` em
  `api/*.js` antes de considerar a tarefa terminada.
- `vercel.json` multiplexa vários endpoints por `?action=`: `instagram.js`, `linkedin.js`,
  `stripe.js`. Ao adicionar uma ação nova a esses arquivos, adicione também o rewrite
  correspondente em `vercel.json` se precisar de uma URL amigável.
- `CONTEXT.md` é o documento de produto (modelo de negócio, features implementadas, roadmap) —
  mantenha-o atualizado quando uma feature nova entra em produção, mas não é o lugar para
  convenções de código (isso é aqui).
- Migrations em `supabase/migrations/` documentam o schema no repo, mas **não rodam sozinhas** —
  o projeto não tem CI/CD de banco. Ao criar uma migration nova, aplique também via MCP do
  Supabase (`apply_migration`, project_id `gnqhjcmvyhhodjghpuop`, projeto "Pulse - DATA") ou
  peça pro usuário rodar manualmente; só criar o arquivo `.sql` no repo não altera produção.
- **Storage bucket `media` (`storage.objects` RLS):** policies são `INSERT` + `SELECT` (public)
  + `UPDATE` (`authenticated`, `bucket_id = 'media'`, migration `20260908010000`). A de `UPDATE`
  foi adicionada porque `uploadThumbnail` usa `upsert: true` — a 1ª gravação num path é `INSERT`
  (200), a 2ª no MESMO path é `UPDATE` e, sem policy, o Storage devolvia **HTTP 400** (RLS).
  Só apareceu quando `persistAdjustedPremium` passou a sobrescrever `thumbnails/{email}/{id}.jpg`
  depois de um ajuste Premium. Não há policy de `DELETE` de propósito (nenhum caminho apaga
  objetos). Se um upload novo der 400, cheque se a operação é overwrite e se falta policy pro `cmd`.
- Tabela `social_connections`: colunas `access_token`, `platform_user_id`, `platform_username`,
  `platform_avatar_url`, `expires_at`, `is_valid`. `platform_avatar_url` foi adicionada em
  26/ago/2026 (migration `20260826190000_add_platform_avatar_url_to_social_connections.sql`) —
  linhas gravadas **antes** dessa migration ficam com `platform_avatar_url = null` para sempre,
  porque nada reprocessa conexões antigas automaticamente. Se um campo novo desses não aparecer
  na UI, confira `updated_at` da linha antes de assumir bug de código: pode ser só uma conexão
  antiga que precisa ser refeita (desconectar + reconectar) pra popular o campo novo.
- `api/instagram.js` (`handleCallback`, passo 3) busca `id,username,profile_picture_url` em
  `graph.instagram.com/me` e repassa `avatar_url` por querystring pro
  `InstagramCallbackPage.tsx`, que reenvia por `postMessage` pro `BrandPage.tsx`, que persiste via
  `saveConnection` (`src/services/socialConnections.ts`). Há `console.log` de diagnóstico em cada
  uma dessas quatro etapas (client e server) — úteis para depurar se um campo nunca chega até a UI;
  não remover sem necessidade.
- **Texto no Premium: decisão de 05/09 (texto sempre via overlay de canvas) foi
  REVERTIDA PARCIALMENTE em 09/09/2026 — o modelo volta a renderizar o texto.**
  (O modelo do Premium é `gpt-image-2.5-flare` desde 09/09/2026 — antes `gpt-image-2`;
  as menções a "gpt-image-2" abaixo são históricas, o comportamento descrito vale igual.)
  Motivo da reversão: o resultado visual do overlay de canvas ficou aquém do esperado
  na avaliação com o usuário (texto "colado por cima", sem integração com a cena; a
  confiabilidade matemática da safe-zone não compensou a perda de qualidade estética).
  Decisão de produto explícita do usuário — não é implementação esquecida.
  **Novo estado (o que vale agora):**
  - `api/generate-premium.js` volta a instruir o modelo a renderizar texto quando há
    `slideTitle` (`buildTextTypographyRules()` + bloco `MANDATORY TEXT TO RENDER —
    OVERRIDE` em `carouselTextOverlay`), mas com **tetos MAIS rígidos que a
    versão original de antes de 05/09**: (1) **safe zone POR PROPORÇÃO** (09/09/2026),
    medida de layouts de referência reais — não mais a margem única ~6%/8% (que já
    era mais folgada que o ~3%/4.5% original). Valores (lateral / topo / base, % das
    dimensões do canvas): **1:1 → 10% / 9% / 9%**; **4:5 → 10% / 8% / 13%**;
    **9:16 → 15% / 9% / 9%**; **16:9 ou outras → 12% em todas as bordas** (fallback
    conservador, sem medição). São MÍNIMOS, não alvos. (2) **headline de 1 linha, ~25
    caracteres no máximo** (teto validado em `scripts/test-model-text.mjs`), **sem
    subtítulo** salvo quando `slideBody` é explicitamente passado. (3) **texto NUNCA
    sobre o rosto/cabeça de uma pessoa** (09/09/2026) — regra `CRITICAL — TEXT NEVER
    OVER A FACE`: posiciona o headline em espaço livre; se só couber cruzando um
    rosto, encolhe o sujeito ou recompõe. As regras são fonte única em
    `buildTextTypographyRules()`, consumida pelo bloco inline de `MANDATORY RULES`,
    por `carouselTextOverlay` e pela variante `addingText` do `adjustPrompt`. Ao
    mudar qualquer uma delas, é só nessa função — os 3 caminhos herdam.
  - `adjustPremiumImage` (`src/services/gemini.ts`) reganhou o param `addingText`; o
    ramo `addingText` de `runPremiumAdjust` (`AgentChat.tsx`) volta a chamar
    `/api/generate-premium` (variante `addingText` do `adjustPrompt`, com as regras de
    tipografia), **não mais** montando camada de texto no `EditorPage`. A lógica de
    logo do `cd2a5f0` (resolver `premiumLogoUrl` + reativar `premiumLogoLayer` +
    `composePremiumImage` pros bytes da Biblioteca) fica intacta — o `addingText`
    reusa o mesmo fluxo do ajuste normal.
  - `PremiumPage.tsx` (rota `/premium`, sem link na UI — órfã, ver Pendentes
    Não-Críticos do CONTEXT.md) volta a pedir o texto ao modelo pelas strings de
    prompt (`MANDATORY TEXT TO DISPLAY` / `THE HEADLINE FOR THIS SLIDE IS EXACTLY`),
    com os mesmos tetos rígidos embutidos. Ela usa `generateImage` →
    `/api/generate-image-ai` (gpt-image-1 Standard), **não** `/api/generate-premium` —
    por isso as regras foram espelhadas inline, não herdadas de
    `buildTextTypographyRules()`.
  - **`textOverlay.ts` / `premiumCompose.ts` continuam no código**, agora só como
    ferramenta de overlay/edição de texto **manual pós-geração** (painéis "Texto
    sobre a imagem" do `PremiumResultViewer` / `CarouselViewer`, compostos pelo
    `EditorPage`) — não são mais o caminho automático de geração. Podem ser removidos
    numa limpeza futura, a decidir. As sub-notas abaixo descrevem essa maquinaria
    (medição de safe-zone, runs coloridos etc.) — ainda vale para o uso manual, mas
    não é mais o que roda na geração.
  - **Antes de reverter esta reversão** (voltar a texto sempre via overlay, ou o
    contrário), confirme com o usuário — os dois lados desta decisão já foram
    avaliados e trocados uma vez.
  - **`src/services/textOverlay.ts`** (`overlayTextOnImage`) desenha o headline/subtitle
    num `<canvas>` — mesmo padrão que `logoOverlay.ts`
    já usava pro logo. Margens de safe-zone (3% lateral / 4.5% vertical) são
    **constantes de código**, não texto de prompt — a garantia é matemática (auto-fit
    reduzindo o tamanho até caber, com truncamento de linhas como último recurso), não
    uma instrução que o modelo pode ignorar. Desde 05/set a assinatura aceita
    `band` (`'top'|'center'|'bottom'`), `scale` (`'small'|'medium'|'large'`), `color`
    e `font` (`'sans'`→Sora, `'serif'`→Playfair Display) — todos opcionais, defaults
    retrocompatíveis com as chamadas de geração. A fonte deixou de ser Helvetica/Arial
    genérica: default agora é **Sora 700** (as duas famílias já vêm do `index.html`);
    `ensureFontLoaded` aguarda `document.fonts.load` antes de desenhar, senão a
    primeira renderização sai no fallback. Chamado de `PremiumPage.tsx` (post único +
    cada slide do carrossel, na geração) e — via `composePremiumImage` — pelo
    `EditorPage` na composição de camadas.
  - **Composição de camadas do Premium (05/set, arquitetura nova):**
    `src/services/premiumCompose.ts` define `PremiumLogoLayer` / `PremiumTextLayer` e
    `composePremiumImage(base, { text, logo, logoUrl })` que aplica **base → texto →
    logo** nessa ordem (logo por último de propósito: fica *sobre* o scrim do texto,
    nunca soterrado). O `EditorPage` é a **fonte única** dessas camadas
    (`premiumLogoLayer`/`premiumTextLayer` pro post único; `premiumCarouselLogoLayer`
    global + `premiumCarouselTextLayers` por índice pro carrossel) e é o **único**
    lugar que compõe — dois `useEffect` recompõem `premiumComposedSlides` /
    `premiumCarouselComposedSlides` e os viewers só exibem. Isso substituiu o modelo
    antigo em que cada viewer congelava seu próprio estado de logo em `useState` e um
    `useEffect([slides])` resetava esse estado — era exatamente isso que fazia **o
    logo sumir quando o usuário pedia pra adicionar texto** (o overlay de texto vinha
    da base sem logo e o reset descartava a versão com logo). Os painéis de logo/texto
    do `PremiumResultViewer` e do `CarouselViewer` agora só chamam callbacks pra cima;
    o chat (`AgentChat`: "adiciona logo", "adiciona o texto '...'") também só mexe nas
    camadas via callback, nunca mais assa bytes com overlay direto. Para persistir na
    Biblioteca, `runPremiumAdjust` compõe localmente (`composePremiumImage`) só pra
    obter os bytes finais — o display fica por conta do efeito do `EditorPage`.
  - **Texto literal vem sempre de uma fonte determinística**, nunca do que o modelo
    "decidiu" escrever: `slideContent` já calculado por `breakCarouselIntoSlides` pro
    carrossel, ou `extractQuotedText(prompt)` (texto citado entre aspas no brief) pro
    post único — sem aspas, nenhum texto é forçado na imagem. Desde a reversão de
    09/09 esse texto vai pro modelo como `slideTitle`/`slideBody` (não mais pra um
    overlay de canvas).
  - **`runPremiumAdjust` em `AgentChat.tsx`** decide `editMode: 'adjust'` vs
    `'recompose'` via `isRecomposeRequest(msg)` pra ajustes visuais pontuais (cor,
    luz, fundo) — esses dois modos chamam `/api/generate-premium` com prompts de
    preservação total (`adjustPrompt`/`recomposePrompt`, sem regra de texto).
    **Desde a reversão de 09/09, "adicionar texto" (`isAddTextRequest(msg)`) volta a
    chamar o mesmo endpoint** com `addingText: true` — o `adjustPrompt` troca pra
    variante que injeta `buildTextTypographyRules()` (headline 1 linha ≤ ~25 chars,
    safe zone por proporção 1:1 10/9/9 · 4:5 10/8/13 · 9:16 15/9/9, texto nunca
    sobre rosto). `extractQuotedText` ainda exige o texto entre aspas (sem aspas,
    o agente pede pro usuário especificar). O ramo `addingText` cai no fluxo normal de
    ajuste, então a reativação de logo do `cd2a5f0` (resolver `premiumLogoUrl` +
    reativar `premiumLogoLayer` + `composePremiumImage` pros bytes) é reusada. Debita
    `PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE` — e agora tem custo real de API de novo.
    (Os props `onPremiumTextLayerChange` / `onPremiumCarouselTextLayerChange` deixaram
    de ser passados pro `AgentChat` — quem edita a camada de texto manual são só os
    painéis dos viewers.)
  - Custo do ajuste visual (não-texto): `PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE` (4), post
    único ou por slide de carrossel. O slide-alvo do carrossel é sempre o
    `carouselCurrentSlide` visível no `CarouselViewer` (passado via
    `premiumCarouselCurrentIndex`), nunca inferido por texto.
  - **Overlay de texto manual (`composePremiumImage` / `overlayTextOnImage`) continua
    disponível** pros painéis "Texto sobre a imagem" dos viewers e pra editar texto de
    um post restaurado da Biblioteca sem a base "limpa" — só não é mais o caminho de
    geração. Histórico: entre 05/09 e 09/09 essa foi a **única** via de texto no
    Premium ("NÃO reintroduza texto via prompt do gpt-image-2"); a reversão de 09/09
    desfez isso porque o resultado visual do overlay decepcionou na avaliação.
  - **Logo "queimado" em imagem restaurada da Biblioteca vs. camada de logo (08/set).**
    A arquitetura de camadas (Opção B) só resolve o caso 100% gerado no Editor. Posts
    Premium **restaurados da Biblioteca** (e os gerados pela `PremiumPage`) têm o logo
    *nos pixels* do `thumbnail_url` — `premiumLogoLayer` volta inativo no restore. Ao
    passar essa imagem pelo gpt-image-2 (ajuste ou "adicionar texto"), o modelo
    devolve a imagem **sem** o logo nítido ("logo some ao adicionar texto", de novo).
    Fix: `runPremiumAdjust` (ramos `addingText` e ajuste normal — que hoje são o mesmo
    fluxo) resolve a URL do logo (`premiumLogoUrl` →
    brand kit → `onPremiumLogoUrlChange`) e, se a camada estiver inativa mas houver
    URL, **reativa** a camada (`onPremiumLogoLayerChange` / `onPremiumCarouselLogoLayerChange`).
    `composePremiumImage` então redesenha `base → texto → logo` e re-carimba o logo
    *por cima*. Como `PremiumPage.overlayLogo` queima o logo na MESMA posição
    e tamanho do `DEFAULT_PREMIUM_LOGO_LAYER` (bottom-right, `0.20·W`), o re-carimbo é
    visualmente idêntico. Efeito colateral aceito: post Premium salvo *sem* logo, ao
    receber texto/ajuste por chat, ganha o logo da marca (Premium = branded).
  - **`overlayTextOnImage`: safe-zone vertical é matemática, não aproximação (08/set).**
    O loop de encaixe antigo limitava só `blockHeight ≤ 0.32·H − 1.5·marginY` e
    ignorava o offset de início do desenho (`~0.85·headlineSize + 0.5·marginY` na base).
    Com headline **+ subtitle** (que o carrossel Premium sempre passa) o bloco vazava a
    margem inferior em `~0.2–0.35·headlineSize` + descenders. Agora `firstBaselineY()`
    replica *exatamente* o `y` que o renderer usa por band, e o loop encolhe até
    `renderedBottom() ≤ safeBottom` **e** `renderedTop() ≥ safeTop` — a mesma
    geometria testada e desenhada. Fallback: se nem no `MIN_FONT_SIZE` couber (canvas
    pequeno + 3+2 linhas), corta linhas (subtitle→headline) até caber. Verificado por
    simulação (`scratchpad/sim-textoverlay.mjs`, não versionado): 0 violações em 6048
    casos (8 headlines × 4 subtitles × 7 tamanhos de canvas × 3 bands × 3 scales × 3
    modelos de largura); a lógica antiga tinha 193 no subset bottom/medium. Ao mexer
    no `y` de qualquer band, ajuste `firstBaselineY()` na mesma edição — os dois têm
    que continuar idênticos ou a garantia quebra.
  - **Medição vertical por `TextMetrics` real, não constante calibrada (08/set, "Fase 2").**
    `ASCENT_RATIO`/`DESCENT_RATIO`/`lineHeight = size*1.25` (fixos, calibrados na Sora)
    saíram. `inkExtent()` usa `ctx.measureText(line).actualBoundingBoxAscent/Descent` —
    tinta real por fonte E por conteúdo. `firstBaselineY`/`renderedTop`/`renderedBottom`/
    `lineHeight` consomem esses valores; fallback pras razões só se a API faltar
    (nunca em Chrome/Safari atuais). `ctx.textBaseline='alphabetic'` é setado **antes**
    de qualquer `measureText` (a bbox é relativa à baseline). `FONT_WEIGHTS` por família
    (Anton/Bebas/Archivo em 400, sem faux-bold) pra `measureText` bater com o desenho.
    `INK_PAD=3`/`TOP_PAD=4` absorvem ~1.5px de antialias. Verificado em `sim-textoverlay-v2.mjs`
    (não versionado): 36.288 casos (6 fontes × sweep × métrica perturbada ±6%), 0 violações,
    folga mínima +1.5px base / +2.5px topo.
  - **Texto estruturado em runs coloridos (08/set, "Fase 3").** `overlayTextOnImage`
    aceita `headline`/`subtitle` como `TextContent = string | StyledLine[]`, onde
    `StyledLine = string | TextRun[]` e `TextRun = { text; color? }`. **Só COR varia
    por run** — peso continua sendo do bloco (`FONT_WEIGHTS`). Como o peso é uniforme,
    `wrapTokenLine`/`toRenderLine`/`inkExtent` rodam no **texto achatado** (`RenderLine.flat`)
    — largura, ascent/descent e nº de linhas saem idênticos aos de uma string simples
    (validado em `scratchpad/sim-runs-neutrality.mjs`, 972 casos, 0 divergências → a
    garantia de safe-zone da Fase 2 transfere sem reexecução). Runs só mudam o desenho:
    `drawFittedBlock` usa o caminho **centrado byte-idêntico à Fase 2** para linha sem
    cor de run, e alinhamento à esquerda + avanço por run (troca de `fillStyle`) quando
    há cor. `premiumCompose.buildHighlightedHeadline(headline, hlText, hlColor)` (UI opção
    A) monta o `StyledLine[]` a partir de um trecho literal — **match só em fronteira de
    palavra** (mid-word introduziria espaços e quebraria a neutralidade). Sem os dois
    campos de highlight → string simples → caminho Fase 2. **Ao evoluir o overlay: peso
    por run e drag NÃO existem ainda** (Fase 3.1+); a geometria vertical (`firstBaselineY`/
    `renderedTop`/`renderedBottom`) segue intocada desde a Fase 2 — não mexer sem
    re-rodar as duas simulações.
- **Persistência do ajuste na Biblioteca:** depois de um ajuste/recompose/overlay bem-sucedido,
  `runPremiumAdjust` chama `persistAdjustedPremium` para **sobrescrever o registro que já existe** na
  Biblioteca (senão o histórico continuaria mostrando o original). Desde 05/set os bytes salvos
  passam por `composePremiumImage` primeiro, pra a Biblioteca guardar a imagem **com** as camadas de
  texto/logo ativas (não só a base). Post único → `uploadThumbnail` +
  `updatePostThumbnail` no mesmo `premiumLibraryId` (path determinístico `thumbnails/{email}/{id}.jpg`
  com `upsert` → mesmo URL público, só troca os bytes). Carrossel restaurado da Biblioteca →
  `updateCarouselSlideImages(premiumCarouselLibraryId, ...)` reescreve `carousels.slide_images`.
  O id vem do `EditorPage` (`premiumLibraryId` / `premiumCarouselLibraryId`): setado na restauração
  de `pendingPost`/`pendingCarousel` e, na geração nova, devolvido pelo `generatePremium` via 3º
  argumento de `onPremiumGenerated`. **Carrossel Premium gerado no fluxo do Editor não tem registro**
  (só `PremiumPage.saveToLibrary` salva carrossel) → nesse caso `persistAdjustedPremium` retorna
  `false` e a mensagem do chat omite "Biblioteca atualizada".
- **Não exibir `image_prompt` cru nos cards:** para posts Premium, `posts.image_prompt` é
  `JSON.stringify({ prompt, caption })` — renderizar direto vaza `{"prompt":"..."}` na tela.
  `PostLibraryPage.tsx` e `LibraryPage.tsx` têm `postCardLabel(post)` que, pra Premium, mostra a 1ª
  linha da legenda do Instagram (fallback: prompt de imagem, depois `template_id`). Qualquer card
  novo que liste posts deve usar esse helper, não `post.image_prompt` direto.
- **`PremiumResultViewer` e `CarouselViewer` (ramo `engine === 'premium'`) NÃO têm mais estado de
  camada congelado** (05/set). Antes cada um congelava `originalSlides`/`originalPremiumSlides` em
  `useState` no mount + um `useEffect([slides])` com `didMountRef` que ressincronizava e **resetava o
  logo** — isso era a origem do bug "logo some ao adicionar texto". Agora o `EditorPage` compõe
  `base → texto → logo` num só lugar e os viewers só exibem a prop `slides` já composta (ver a
  entrada de composição de camadas do Premium acima). Ao mexer nesses viewers: os painéis de
  logo/texto só emitem callbacks pra cima, nenhuma composição de imagem acontece dentro deles.
- **Aquisição via LP (checkout → provisionamento → email):** o `checkout.session.completed` do
  webhook chama `ensureUserForCheckout` (`api-lib/provisionAccount.js`) **antes** de creditar —
  `credit_pulses`/`upsert` de `user_tokens` dependem do email já existir. A lógica do handler está
  em `handleCheckoutSessionCompleted({ session, stripe, admin })`, **exportada** de `api/stripe.js`
  pra poder ser testada com stubs (não há runner; ver `scratchpad/smoke-webhook.mjs` de referência).
  O email de acesso (`sendAccessEmail`) só marca `user_tokens.access_email_sent_at` se
  `sendEmail` retornou `{ sent: true }` — sem `RESEND_API_KEY` o envio é no-op e um replay do
  evento reenvia. `sendEmail` **nunca lança**: o webhook não pode devolver 500 pro Stripe só
  porque o email falhou (conta e pulses já foram provisionados).
- **`user_tokens` / `brand_config` não têm FK pra `auth.users`** — são chaveadas por `user_email`
  (texto), sem coluna `user_id`, então **não existe cascade**: apagar um usuário no Auth (dashboard
  ou `admin.deleteUser`) deixa a linha em `user_tokens` órfã, com `access_email_sent_at` e
  assinatura pendurados. Em teste, isso faz o email de acesso **não reenviar** no próximo checkout
  (o guard `if (!tokRow?.access_email_sent_at)` pula em silêncio). Mitigação no código:
  `ensureUserForCheckout` zera `access_email_sent_at` quando `isNew === true` (conta Auth recém
  criada ⇒ flag anterior é lixo). Se precisar limpar à mão: `update user_tokens set
  access_email_sent_at = null where user_email = '...'` (não delete a linha se ela tiver
  `stripe_subscription_id` — perde o vínculo da assinatura).
- **Roteamento no mount do `App.tsx`:** há um `useEffect([])` que, se `getSession()` retorna sessão
  (e o pathname não é uma das telas standalone), chama `checkAndRoute()` direto — usuário
  autenticado **não vê mais o intro** nem passa por `signOut → re-login`. Isso reverte de propósito
  o "vídeo sempre vai pro login" (commit 42cd8c2): era ele que fazia o cliente recém-saído de
  `/definir-senha` (já autenticado) ser deslogado e ter que logar de novo, e às vezes pular o
  onboarding. Sem sessão, o fluxo `intro → login` continua igual.
- **Telas do fluxo de aquisição ficam fora do gate de `appState`** em `src/App.tsx` — `/checkout`,
  `/checkout/sucesso` e `/definir-senha` são checadas por `window.location.pathname` antes de
  `if (appState === 'intro')`, igual aos callbacks OAuth (`/auth/*/done`, `/privacy`). Cliente que
  pagou pela LP ainda não tem sessão nem onboarding — essas telas precisam renderizar sem isso.
- **`public/sample/` são as imagens da LP** (`public/pulse-landing-page.html`) — JPEGs otimizados
  (~1200px, ~2MB no total). Os PNGs originais eram ~72MB (um de 24MB/4608×8192) e travavam a LP no
  mobile. Se trocar/adicionar exemplo, redimensione antes de commitar; não volte pra PNG cru.

## Limites

- Nunca commitar `.env` / `.env.local` ou segredos.
- Chaves de API (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) só no servidor (`api/*.js`), nunca
  expostas ao client.
- Rode `npm run build` antes de git push — o deploy é automático no Vercel a cada push em `main`.

## Encerramento de Sessão (automático)

Ao final de qualquer sessão de trabalho, sem precisar que o usuário peça,
execute a skill session-sync (~/.claude/skills/session-sync/SKILL.md):
atualize este CLAUDE.md e o CONTEXT.md correspondente em
~/Library/CloudStorage/GoogleDrive-tdaprod@gmail.com/Meu Drive/Agente17-Contexto/. Se a sessão não teve mudança relevante,
não faça nada.
