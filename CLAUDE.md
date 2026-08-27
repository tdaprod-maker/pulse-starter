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
- **IA texto:** Claude Haiku 4.5 via chamada direta à Anthropic Messages API (sem SDK)
- **IA imagem:** `gpt-image-1` (Standard, `api/generate-image-ai.js`) e GPT Image 2 (Premium,
  `api/generate-premium.js`) via OpenAI, chamada direta (sem SDK)
- **Roteamento de API:** `vercel.json` reescreve `/api/instagram-post` etc. para
  `/api/instagram?action=post` — vários endpoints são multiplexados por `action` num único arquivo

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
Presente em `agent-chat.js` (2x), `generate-carousel.js`, `generate-post.js`.

### 2. `extractJSON` tolerante a markdown
A resposta do modelo às vezes vem envolta em ` ```json ` ou com texto antes/depois do objeto.
`generate-carousel.js` e `generate-post.js` têm uma função `extractJSON(raw)` que tenta, em ordem:
`JSON.parse` direto → extrair bloco ` ```json...``` ` via regex → extrair o primeiro `{...}` via
regex → lançar erro. `agent-chat.js` usa a versão mais simples inline:
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
   branco.

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
- **Ajuste pós-geração Premium (`editMode` em `api/generate-premium.js`):** quando o
  usuário pede uma mudança numa imagem Premium já gerada, `AgentChat.tsx` (`runPremiumAdjust`) manda
  a **imagem gerada** como `visualReferences[0]` + um `editMode`. Há **dois modos**, decididos por
  `isRecomposeRequest(msg)` em `AgentChat.tsx`:
  - `editMode: 'adjust'` (default — "escurece o fundo", "texto branco"): troca o `fullPrompt` inteiro
    por um `adjustPrompt` curto de **preservação total**.
  - `editMode: 'recompose'` ("mantém a pessoa, gera um novo ambiente ao redor" — a regex casa
    verbo de troca/criação + `ambiente|cenário|fundo|local|lugar|paisagem|background|entorno`, e
    **exclui** ajustes pontuais de fundo tipo `escure|clarei|desfoc|satur...` + `fundo`): usa o
    `recomposePrompt`, que preserva identidade da(s) pessoa(s) + texto já embutido mas **manda
    recriar o entorno**. A linguagem é deliberadamente enfática ("you MUST replace the entire
    surrounding environment") porque o gpt-image-2 em `images/edits` tende a só reenquadrar.
  Os dois modos **pulam de propósito** as seções de safe-zone / `CAROUSEL SLIDE TEXT OVERLAY` /
  letterboxing / `SUBJECT_RULE_BY_STYLE` — elas foram feitas pra *gerar cena nova* e, numa imagem
  que já tem texto renderizado, fazem o gpt-image-2 reposicionar/reescrever o texto. Não reintroduza
  essas regras em nenhum dos dois caminhos. Custo: `PULSE_COSTS.PREMIUM_CAROUSEL_SLIDE` (4), tanto
  pro post único quanto por slide de carrossel. O slide-alvo do carrossel é sempre o
  `carouselCurrentSlide` visível no `CarouselViewer` (passado via `premiumCarouselCurrentIndex`),
  nunca inferido por texto.
- **Persistência do ajuste na Biblioteca:** depois de um ajuste/recompose bem-sucedido,
  `runPremiumAdjust` chama `persistAdjustedPremium` para **sobrescrever o registro que já existe** na
  Biblioteca (senão o histórico continuaria mostrando o original). Post único → `uploadThumbnail` +
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
- **`PremiumResultViewer` e `CarouselViewer` (ramo `engine === 'premium'`) congelam os slides em
  `useState` no mount** (`originalSlides` / `originalPremiumSlides`) — é intencional pra preservar a
  versão sem logo. Mas isso significa que trocar a prop `slides` **não** atualiza a imagem exibida
  sozinho. Cada viewer tem um `useEffect([slides])` com guard de `didMountRef` que ressincroniza
  `original*`/`display*` e reseta o estado do logo quando o pai troca os slides (é o que faz o
  resultado do ajuste aparecer). Se adicionar outro fluxo que muda `premiumSlides`/`carouselSlides`
  de fora, conte com esse reset de logo.

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
