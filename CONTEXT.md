# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Modelo de Negócio
- **SaaS:** R$47,90/mês com 200 pulses incluídos
- **Recargas:** 100 pulses R$27,90 · 200 pulses R$49,90 · 500 pulses R$99,90
- **Plano anual:** R$39,90/mês (R$478,80/ano)
- **White-label:** R$2.500–4.000 setup + retainer mensal
- **Pulses:** post standard (gpt-image-1) = 4 pulses · slide carrossel = 2 pulses · post premium (GPT Image 2) = 8 pulses
- **Stripe integrado e testado** — checkout mensal/anual e recargas (100/200/500 pulses) funcionando de ponta a ponta (checkout → webhook → crédito automático no Supabase). Onboarding manual via Pix não é mais necessário para novos clientes.
- Margem de API é saudável — custo real por geração é centavos

## Visão do Produto
**O agente é o produto.** O Pulse não é uma ferramenta de design — é um designer de bolso com IA. O usuário conversa com o agente, que instrui, orienta e executa. O agente:
- Conhece boas práticas de design e redes sociais
- Orienta antes de gerar ("posts educativos performam 3x mais no LinkedIn")
- Pesquisa informações externas (datas, tendências, dados) via web search antes de gerar
- O usuário escolhe a engine (Standard ou Premium) via botões após o agente confirmar o briefing
- Gera post, legenda e publica — tudo no mesmo lugar
- **Standard (gpt-image-1)** → resultado editável (textos, cores, logo via agente); engine apresentada como "Standard"
- **Premium (GPT Image 2)** → fotorrealista não editável; engine apresentada como "Premium" (tecnologia não mencionada ao cliente)

### Filosofia de edição pós-geração
- Posts standard: totalmente editáveis via agente (textos, cores, formato, logo, imagem de fundo)
- Posts premium: logo inserível/removível via agente **+ edição da própria imagem gerada** em dois
  modos (a imagem gerada vira a base do reprocessamento, cada edição custa 4 pulses e é confirmada
  individualmente, vale pro post único e por slide de carrossel Premium):
  - **Ajuste pontual** ("escurece o fundo", "texto branco", "mais contraste") → `editMode: 'adjust'`,
    preservação total de texto/composição/pessoa/fundo.
  - **Recomposição parcial** ("mantém a pessoa, gera um novo ambiente ao redor") → `editMode:
    'recompose'`: preserva identidade da pessoa + texto embutido, mas recria o cenário/entorno.
    `AgentChat.isRecomposeRequest()` decide o modo pela linguagem do pedido.
  - A versão editada **sobrescreve o registro na Biblioteca** (post único: thumbnail; carrossel
    restaurado: `slide_images`) — o histórico passa a mostrar o resultado, não o original.
- **Sem arrastar elementos no canvas** — toda edição é conversacional via AgentChat

## Stack
- Frontend: React + TypeScript + Vite PWA
- Backend: Vercel API Routes (Node.js) — `maxDuration: 60` em rotas de geração de imagem
- Banco: Supabase (auth + storage + postgres)
- IA Imagem Standard: gpt-image-1 (OpenAI) via `api/generate-image-ai.js`
- IA Imagem Premium: GPT Image 2 via `api/generate-premium.js`
- IA Texto/Agente: Claude Haiku 4.5 via Vercel API Routes
- Canvas: Konva (apenas para renderização e logo draggable — sem edição de elementos pelo usuário)
- Deploy: Vercel (plano free — **limitação crítica:** timeout de 55s; upgrade para Pro resolve definitivamente)

---

## Estado Atual dos Módulos

### O que está implementado ✅

| Funcionalidade | Detalhe |
|---|---|
| Agente conversacional | Claude Haiku 4.5; máx. 2 frases, max_tokens=800 (edit) / 1500 (geração); web search integrado |
| Web search no agente | Ferramenta web_search_20250305; pesquisa datas, tendências, dados antes de gerar |
| Agente consultivo | Classifica briefing vago vs completo; alertas de boas práticas bloqueantes |
| Escolha de engine pelo usuário | Agente retorna `engine: "standard"` sempre; usuário escolhe Standard ou Premium via botões; nomes sem mencionar tecnologia |
| Posts standard (gpt-image-1) | Templates Konva editáveis via agente; seleção por tema do conteúdo; variação entre gerações garantida |
| Posts premium GPT Image 2 | Fotorrealista; formato definido pelo agente; logo inserível via agente após geração |
| Ajuste pós-geração Premium | `runPremiumAdjust` no AgentChat: pedido em linguagem natural na imagem já gerada → confirma 4 pulses → `/api/generate-premium` usando a imagem como `visualReferences`. `AgentChat.isRecomposeRequest()` escolhe `editMode: 'adjust'` (preservação total — "escurece o fundo"; desde 09/09/2026 o `adjustPrompt` normal também injeta `buildTextTypographyRules()` + bloco `PRESERVE THE EXACT ORIGINAL FRAMING` — item 35) ou `editMode: 'recompose'` (preserva pessoa + texto, recria o cenário — "novo ambiente ao redor"; prompt enfático porque o modelo tende a só reenquadrar). `AgentChat.isAddTextRequest()` detecta pedido de adicionar texto e (desde a reversão de 09/09, item 33) volta a chamar `/api/generate-premium` com `addingText: true` — o `adjustPrompt` troca pra variante com `buildTextTypographyRules()` (headline 1 linha ≤ ~25 chars, safe zone por proporção 1:1 10/9/9 · 4:5 10/8/13 · 9:16 15/9/9, texto nunca sobre rosto — item 34); reusa o fluxo de ajuste, então a reativação de logo (item 31a) fica intacta. Post único + por slide de carrossel Premium (alvo = slide visível no `CarouselViewer`). Pós-sucesso, `persistAdjustedPremium` sobrescreve o registro na Biblioteca com os bytes compostos (`premiumLibraryId`/`premiumCarouselLibraryId` vindos do `EditorPage`) — carrossel gerado no Editor não tem registro e não persiste |
| Camadas de overlay do Premium (logo + texto coexistindo) | Desde 05/09/2026 o `EditorPage` é a fonte única das camadas de logo e texto do Premium (`premiumLogoLayer`/`premiumTextLayer` pro post único; logo global + texto por slide pro carrossel) e compõe `base → texto → logo` num só lugar (`src/services/premiumCompose.ts`, `composePremiumImage`). Os viewers (`PremiumResultViewer`, `CarouselViewer`) só exibem a imagem já composta e seus painéis de logo/texto só emitem callbacks. Corrigiu o bug em que aplicar logo e depois pedir texto fazia o logo sumir (cada viewer congelava seu próprio estado de logo e o reset ao trocar `slides` descartava a versão com logo) |
| Texto no Premium: modelo renderiza (09/09) + overlay manual opcional | **Reversão de 09/09/2026 (item 33), refinada no item 34:** o gpt-image-2 **volta a renderizar o texto** — `api/generate-premium.js` instrui o modelo via `slideTitle`/`slideBody` (`buildTextTypographyRules()` + `MANDATORY TEXT TO RENDER`), com **safe zone medida por proporção** (lateral/topo/base: 1:1 → 10/9/9; 4:5 → 10/8/13; 9:16 → 15/9/9; 16:9/outras → 12% em tudo), **texto nunca sobre o rosto/cabeça de uma pessoa**, e headline de **1 linha ≤ ~25 chars, sem subtítulo por padrão** (mais rígido que a versão pré-05/09). `src/services/textOverlay.ts` (`overlayTextOnImage`) **não é mais o caminho de geração** — fica como ferramenta de overlay/edição de texto **manual** no painel "Texto sobre a imagem" dos viewers (`PremiumResultViewer`/`CarouselViewer`), composto pelo `EditorPage` via `composePremiumImage`. Capacidades desse overlay manual (ainda válidas pro uso manual): `band` (topo/centro/base), `scale`, `color`, `font` (`sans`→Sora, `serif`→Playfair, + `anton`/`archivo`/`bebas`/`oswald`); auto-fit vertical por `TextMetrics` real ("Fase 2"); texto estruturado em runs coloridos + campo "destaque (trecho + cor)" via `premiumCompose.buildHighlightedHeadline` ("Fase 3"). |
| Revisão de post com IA (standard) | `PostReviewer.tsx` → `/api/review-post.js` (Claude Haiku vision, 1 pulse) — analisa o canvas exportado (contraste, hierarquia, legenda) e retorna scores + sugestões em português |
| Análise de referências visuais | Onboarding e Brand Kit → `/api/analyze-references.js` (Claude Haiku vision) — perfil de estilo/cores/composição salvo em `brand_config.visual_style`, usado como contexto nos prompts de geração |
| Modo edição pós-geração (standard) | Flag `hasGeneratedPost`; mensagens subsequentes vão direto para edit mode; AgentChat detecta do store quando `activePost` prop ainda é null |
| Agente editor — ações de edição | recolor, rewrite, resize (formato), recolor_background, overlay_opacity, overlay_color, add_logo, remove_logo, resize_logo, move_logo |
| resize_logo relativo | Agente calcula `currentLogoSize × fator`; `currentLogoSize` passado via `EditContext.logoSize` |
| move_logo com safety area | 60px de margem em todas as bordas; posições: bottom-center, top-center, center, cantos e lados |
| add_logo / remove_logo (standard) | Carrega logo do brand kit; aplica em todas as variantes |
| add_logo / remove_logo (premium) | Ativa/desativa a camada de logo do `EditorPage` (`onPremiumLogoLayerChange`); o `EditorPage` recompõe `base → texto → logo`, então o texto já adicionado é preservado |
| Overlay de loading | `GeneratingOverlay` com barra de progresso animada; Standard: 5 frases rotativas a cada 3s; Premium: 5 frases a cada 4s; canvas oculto durante geração |
| Canvas expand | Botão recolhe AgentChat via `forceCollapsed`; ResizeObserver aumenta canvas; sem modal |
| Máximo 2 rodadas de perguntas | `userMessageCount < 3` → pode perguntar; na 3ª mensagem gera obrigatoriamente |
| Brand description prompt | Se `brand_description` < 20 chars e `userMessageCount === 1`, agente pede descrição antes de gerar |
| Onboarding 8 passos | Nome → Segmento+Descrição → URL do site → Tom → Logo → Fontes → Cores → Refs visuais |
| Análise de site no onboarding | `POST /api/agent-chat { siteUrl }` → fetch + strip HTML + Claude Haiku → preenche `brandDescription`; `site_url` salvo no Supabase |
| Campo descrição destacado | Card com fundo accent, badge "Recomendado", placeholder com exemplo de clínica odontológica |
| Biblioteca restaura corretamente | `template_id` com sufixo salvo; match exato da variante; textos aplicados em todas as variantes; guard contra `useEffect([activeTemplate?.id])` sobrescrever textos |
| Logs de diagnóstico no restore | IDs no template vs IDs salvos, match count, estado final após updateElement |
| Carrossel standard | Geração via `/api/generate-carousel.js`; publicação LinkedIn com imagens comprimidas |
| Carrossel premium GPT Image 2 | Geração sequencial por slide; texto overlay pela API; retry automático; confirmação com custo |
| Legendas | Gancho, estrutura de salvamento, CTA, hashtags por nicho; Instagram ≤2200 chars, LinkedIn ≤3000 chars |
| Download PNG e ZIP | Disponível em todos os fluxos; iOS abre em tela cheia para salvar via toque longo |
| LinkedIn multi-tenant | OAuth com token salvo no Supabase; post único e carrossel; redirect flow no mobile |
| Débito de pulses | Standard (4), carrossel (2×slides), premium (8) — implementado nos três fluxos |
| PWA | manifest.webmanifest, service worker, ícones; instalável no iOS e Android |
| Mobile responsivo | Layout adaptado; PropertiesPanel como bottom sheet; touch no canvas |
| Brand Kit | Logo, cores, fontes, tom de voz; redes sociais; análise de refs visuais com IA |

### Instagram — estado atual
- OAuth multi-tenant tecnicamente funcional (`instagram-auth.js`, `instagram-callback.js`, `instagram-post.js`)
- Bug de `accessToken`/`igUserId` hardcoded corrigido em todos os fluxos de publicação (CaptionPanel, CarouselViewer, PremiumResultViewer, CarouselPage, PremiumPage) — todos usam agora `getInstagramConnection` com credenciais reais do Supabase
- **App Review submetido ao Meta em 26/07/2026 — rejeitado por vídeo incompleto.** Reenviado em 14/08/2026 com screencast completo do fluxo de ponta a ponta (login, conexão Instagram, geração de post, publicação, confirmação no feed real) — aguardando nova análise (prazo estimado até 20 dias, ou seja até ~03/09/2026)
- **Enquanto aguarda aprovação:** funciona apenas com até 25 contas de teste; clientes beta precisam ser adicionados manualmente como **Testadores** no Meta Developer Portal antes de conseguir conectar
- **UX:** botão "Conectar" exibe **(em breve)** em cinza até aprovação do review

### Stripe — estado atual
- **Integração completa e testada de ponta a ponta:** checkout mensal/anual e recargas (100/200/500 pulses) → webhook → crédito automático de pulses no Supabase
- `api/stripe.js` consolida checkout + webhook (`?action=checkout|webhook`); `vercel.json` tem rewrites dedicados para `/api/stripe/webhook` e `/api/stripe/checkout`
- Webhook: `bodyParser` desligado, raw body lido manualmente via stream antes de `stripe.webhooks.constructEvent`; log de diagnóstico (`rawBody.length` + presença do header `stripe-signature`) antes da verificação de assinatura
- Eventos tratados: `checkout.session.completed` (assinatura e recarga avulsa), `invoice.paid` (renovação mensal), `customer.subscription.updated`, `customer.subscription.deleted`
- **Stripe Tax desativado temporariamente** (`automatic_tax` removido da Checkout Session) — a conta Stripe ainda não tem país configurado (CNPJ/dados bancários pendentes), então o Stripe Tax não está disponível. Reativar assim que a conta tiver o país configurado em Settings → Tax.
- **Pendente:** testar renovação mensal automática (`invoice.paid` com `billing_reason: subscription_cycle`) em produção com o ciclo completo de um cliente real; cadastrar CNPJ/dados bancários da TDA no Stripe para sair do modo de testes

### Aquisição via LP: checkout → provisionamento de conta → email de acesso ✅ (Resend ativo; a validar com cliente novo real)
Fluxo para quem compra pela landing page **sem ter conta no Pulse ainda**:
1. **LP** (`public/pulse-landing-page.html`) — CTAs linkam para `/checkout?plan=monthly|annual|recharge_100|recharge_200|recharge_500`; o toggle mensal/anual troca o `href` do CTA principal via JS.
2. **`/checkout`** (`src/pages/CheckoutPage.tsx`) — coleta email (+ nome opcional), chama `startCheckout(email, item, name)` → `POST /api/stripe?action=checkout`. Fora do gate de `appState` no `App.tsx` (como os callbacks OAuth). `success_url` = `/checkout/sucesso`, `cancel_url` = `/checkout?canceled=1`.
3. **Webhook `checkout.session.completed`** (`handleCheckoutSessionCompleted` em `api/stripe.js`, exportado p/ teste isolado):
   - Resolve o email por `customer_details.email` → `metadata.user_email` → `client_reference_id`.
   - `ensureUserForCheckout({ email, name })` (`api-lib/provisionAccount.js`) — cria a conta Supabase Auth já confirmada (idempotente; trata "email já existe"), garante a linha em `user_tokens` e gera um `action_link` de **recovery** com `redirectTo` `${SITE_URL}/definir-senha`. Roda **antes** de creditar (o `credit_pulses`/`upsert` dependem do email existir).
   - Ativa assinatura (`upsert` em `user_tokens`, `tokens_remaining: 200`) ou credita a recarga (`credit_pulses`).
   - `sendAccessEmail` (`api-lib/sendEmail.js`, Resend REST direto) — copy diferente p/ conta nova (definir senha) vs. cliente existente (só confirmação). **Só marca `user_tokens.access_email_sent_at` se o envio retornou `sent: true`** — se o Resend cair, um replay futuro do evento reenvia. **Guard vs. lixo de teste:** `ensureUserForCheckout` zera `access_email_sent_at` quando `isNew === true` (conta Auth recém-criada) — cobre o caso de apagar o usuário no Auth sem limpar `user_tokens` (não há cascade, ver abaixo).
4. **`/checkout/sucesso`** (`CheckoutSuccessPage.tsx`) — instrui a checar o email; quem já estava logado vê atalho de volta ao app.
5. **`/definir-senha`** (`DefinirSenhaPage.tsx`) — abre a partir do link do email (sessão vem no hash da URL, `detectSessionInUrl`), faz `updateUser({ password })` e **recarrega `/` sem deslogar**. O `App.tsx` roteia no mount: sessão presente → `checkAndRoute()` → cliente novo (sem `brand_config`) cai no **onboarding**, sem re-login.
- **Migration:** `20260827230000_add_access_email_sent_at_to_user_tokens.sql` — coluna `access_email_sent_at timestamptz` (já aplicada em produção).
- **`user_tokens`/`brand_config` sem FK pra `auth.users`** (chaveadas por `user_email`, sem cascade) — apagar usuário no Auth deixa a linha órfã. Ao testar: `update user_tokens set access_email_sent_at = null where user_email = '...'` antes de refazer o checkout (ou confie no reset por `isNew`). Órfã antiga conhecida e inofensiva: `ricardo_jimenes@yahoo.com.br` (mai/2026, sem stripe).
- **Config de produção (já feito):** `RESEND_API_KEY` + `EMAIL_FROM` setados manualmente no Vercel (não via Marketplace — `vercel integration ls` fica vazio). `${SITE_URL}/definir-senha` na allowlist de Redirect URLs do Supabase Auth — confirmado; o `redirectTo` no código é exatamente `/definir-senha` (sem barra final / query), tanto em `provisionAccount.js` quanto no `resetPasswordForEmail` do `DefinirSenhaPage`.
- **Falta validar:** um checkout real de ponta a ponta com email **novo** (sem linha em `user_tokens`, sem `brand_config`) → conferir que o email chega (Resend dashboard) e que `/definir-senha` → onboarding.

### Migração Gemini → Claude Haiku 4.5
| Função | Rota Vercel | Status |
|---|---|---|
| `agentChat` | `/api/agent-chat.js` | ✅ Migrado |
| `generatePostContent` | `/api/generate-post.js` | ✅ Migrado |
| `generateCarouselContent` | `/api/generate-carousel.js` | ✅ Migrado |
| `generatePremiumCaption` | — | 🔜 Pendente (ainda usa Gemini direto do frontend) |
| `turboPrompt` / `turboPromptEditor` | — | 🔜 Pendente |
| `breakCarouselIntoSlides` | — | 🔜 Pendente |
| `analyzeVisualReferences` | `/api/analyze-references.js` | ✅ Migrado (05/09/2026 — multimodal, Claude Haiku vision) |
| `reviewPost` | `/api/review-post.js` | ✅ Migrado (05/09/2026 — multimodal, Claude Haiku vision) |

**Padrão adotado:** cada função vira uma Vercel API Route. `ANTHROPIC_API_KEY` e `OPENAI_API_KEY` exclusivamente no servidor.

### Decisão de Engine
- **Para posts:** agente sempre retorna `engine: "standard"`; usuário escolhe Standard ou Premium via botões
  - Standard → 4 pulses, gpt-image-1, resultado editável via agente
  - Premium → 8 pulses, GPT Image 2, fotorrealista, logo inserível mas imagem não editável
- **Para carrossel:** agente decide (standard = tipográfico/educativo; premium = fotorrealista/produtos)
- Nomes apresentados ao cliente: "Standard" e "Premium" — sem mencionar gpt-image-1 ou GPT Image 2

### Fluxo Standard (gpt-image-1)
1. Agente retorna `ready: true` com `prompt`
2. Botões Standard/Premium aparecem no chat
3. `generate()` → `/api/generate-image-ai.js` → gpt-image-1 com aspect ratio correto
4. Template Konva ativado com textos e accent color
5. `hasGeneratedPost = true` → próximas mensagens vão para edit mode
6. Agente editor disponível: textos, cores, formato, logo, regeneração de fundo (4 pulses)

### Fluxo Premium (GPT Image 2)
1. Usuário clica "Premium" após agente confirmar briefing
2. `generatePremium()` → `/api/generate-premium.js`; AbortController 55s
3. Formato do último template ativo usado; crop para ratio exato
4. `PremiumResultViewer` exibe a imagem composta com legenda, download, publicação e painéis de logo/texto
5. Logo: painel do viewer ou chat ("insira o logo") → ativa `premiumLogoLayer` no `EditorPage`; posição/tamanho ajustáveis no painel
6. Texto sobre a imagem: painel do viewer ou chat ("adiciona o texto '...'") → ativa `premiumTextLayer`; posição (topo/centro/base), tamanho, cor e fonte (Sora/Playfair) ajustáveis no painel
7. `EditorPage` compõe `base → texto → logo` (`composePremiumImage`) e passa o resultado aos viewers — logo e texto coexistem, nenhum sobrescreve o outro
8. Ajuste/recompose pós-geração via chat: qualquer pedido que não seja de logo → confirma 4 pulses → `runPremiumAdjust` reenvia a imagem gerada como `visualReferences` + `editMode: 'adjust'` ou `'recompose'` (decidido por `isRecomposeRequest`) → resultado substitui a base `premiumSlides` (post) ou o slide de `carouselSlides` (carrossel Premium) → `persistAdjustedPremium` sobrescreve o registro salvo na Biblioteca com os bytes compostos. "Adicionar texto" (`isAddTextRequest`) roteia por aqui também, com `addingText: true` (variante de prompt com regras de tipografia)

### Fluxo de Restauração da Biblioteca (pendingPost)
1. `PostLibraryPage.handleOpen` → `setPendingPost(post)` → `navigate('/')`
2. EditorPage: `pendingPost` useEffect dispara
3. Guard: `useEffect([activeTemplate?.id, !!pendingPost])` não roda durante restauração (evita sobrescrever textos com defaults)
4. `template_id` normalizado → match no `templateRegistry`
5. `addTemplate(v)` em todas as variantes (reset para defaults limpos)
6. `setActiveTemplate(target.id)` (match exato com sufixo antes de cair em variants[0])
7. Textos e accent_color aplicados em todas as variantes via `updateElement`
8. Logs de diagnóstico: IDs no template vs IDs salvos, campos aplicados, estado final
9. `thumbnail_url` usada como background (sem consumir pulses); gera nova imagem só se thumbnail_url for nulo

**Campos do PostRecord:** `{ id, template_id, texts, accent_color, image_prompt, thumbnail_url, created_at }`
**template_id salvo:** `activeTemplateId` completo com sufixo (ex: `tech-statement-9x16`)

---

## Status da Última Sessão (08/09/2026) — bug logo + texto + RLS no Premium

> **Atualização 09/09/2026:** os "ajustes finos do overlay" mencionados abaixo foram
> resolvidos por uma via diferente — o overlay de texto de canvas foi **revertido**
> (item 33 do Histórico de Bugs): o gpt-image-2 volta a renderizar o texto, com safe
> zone por proporção (item 34) e headline de 1 linha ≤ ~25 chars. Os 3 fixes deste commit `cd2a5f0`
> que **não** são do overlay de texto — reativação de logo (item 1), migration RLS
> (item 3) — **permanecem**. O item 2 (geometria de safe-zone do `textOverlay.ts`)
> segue no código só pro overlay manual.

**RESOLVIDO — commit `cd2a5f0` (em `main`, deployado; migration aplicada em prod via MCP):**

1. **Logo desaparecia ao adicionar texto em posts Premium restaurados da Biblioteca.**
   Causa: o `thumbnail_url` salvo tem o logo *nos pixels* e `premiumLogoLayer` volta
   inativo no restore — o scrim de `overlayTextOnImage` cobria o logo queimado.
   Fix: `runPremiumAdjust` (ramos "adicionar texto" e ajuste normal) resolve
   `premiumLogoUrl` (estado do EditorPage → brand kit, propagado por
   `onPremiumLogoUrlChange`) + reativa a camada de logo quando inativa mas há URL +
   `composePremiumImage` recompõe `base → texto → logo`, re-carimbando o logo por
   cima do scrim (mesma posição/tamanho da geração → visualmente idêntico). Props
   novas em `AgentChat`: `onPremiumLogoUrlChange`, `onPremiumCarouselLogoLayerChange`.

2. **Texto saía da safety area.** Causa: bug de geometria em `textOverlay.ts` — o
   loop de encaixe limitava só o `blockHeight` e ignorava o offset de início do
   desenho (`~0.85·headlineSize + 0.5·marginY`); headline **+ subtitle** (carrossel
   Premium) vazava a margem inferior. Fix matemático real: `firstBaselineY()` replica
   a fórmula exata do `y` do renderer por band e o loop encolhe até
   `renderedBottom() ≤ safeBottom` **e** `renderedTop() ≥ safeTop` (mesma geometria
   testada e desenhada); corta linhas se nem no `MIN_FONT_SIZE` couber. **Verificado
   por simulação: 6048 casos, 0 violações** (lógica antiga: 193 no subset bottom/medium).

3. **Erro HTTP 400 no upload de thumbnail.** Não era das mudanças — `storage.objects`
   do bucket `media` só tinha policy de `INSERT`/`SELECT`. `uploadThumbnail` usa
   `upsert: true`; a 2ª gravação no mesmo path é `UPDATE` e era negada por RLS.
   Fix: migration `20260908010000_add_media_update_rls_policy.sql` (aplicada em prod).

**TESTADO EM PRODUÇÃO PELO USUÁRIO (08/09/2026):** resultado **melhorou
significativamente** — os 3 bugs estão funcionalmente resolvidos. Porém **restam
ajustes finos** de acabamento que só dá para definir com **análise visual
(screenshots)**. Provável (não confirmado sem ver as imagens): posicionamento /
tamanho / estética do texto ou do logo.

**RESOLUÇÃO (09/09/2026):** a discussão visual concluiu que o overlay de texto de
canvas em si era o problema (texto "colado por cima", sem integração com a cena) —
não um ajuste fino de posição/tamanho. Decisão: **reverter** o overlay de texto e
deixar o gpt-image-2 renderizar de novo, com regras mais rígidas que o original
(safe zone por proporção + texto nunca sobre rosto — item 34; headline 1 linha ≤ ~25 chars). Ver itens 33 e 34 do Histórico de Bugs.
A camada de **logo** e os fixes de RLS não foram tocados.

---

## Pendentes Críticos (afetam UX em produção)

| Item | Detalhe |
|---|---|
| **Vercel Pro** | $120/mês — resolve timeout do Premium definitivamente (maxDuration até 300s). Fazer upgrade ao fechar primeiro cliente pago. |
| **Stripe** | ✅ Integração completa e testada — checkout mensal/anual, recargas (100/200/500) e crédito automático via webhook funcionando de ponta a ponta. LP + `/checkout` + provisionamento automático de conta + email de acesso pós-pagamento (Resend) implementados; falta validar com um checkout real de email novo. Pendente: testar renovação mensal automática, cadastrar CNPJ/dados bancários da TDA (Stripe Tax desativado até lá). |
| **Instagram OAuth multi-tenant** | App Review rejeitado (vídeo incompleto) — reenviado ao Meta em 14/08/2026 com screencast completo do fluxo de ponta a ponta (login, conexão Instagram, geração de post, publicação, confirmação no feed real). Aguardando nova análise (prazo até 20 dias). Enquanto isso, adicionar clientes beta manualmente como Testadores no Meta Developer Portal antes de conseguirem conectar. OAuth tecnicamente funcional; bug de accessToken/igUserId no CaptionPanel/CarouselViewer/PremiumResultViewer já corrigido. |
| **Testar: texto desconfigurado ao restaurar** | Regressão suspeita; logs de diagnóstico adicionados no pendingPost effect — verificar no console ao restaurar da biblioteca. |
| **Testar: premium sem logo automático** | Verificar que `generatePremium` não sobrepõe logo automaticamente; testar add/remove logo via chat. |
| **Testar em produção: ajuste/recompose pós-geração Premium** | Fluxo não testável localmente (`vite` não serve `/api/*`; `gpt-image-2` é pago). Após deploy: (1) gerar post Premium → "escurece o fundo" → confirmar 4 pulses → só o fundo muda, texto/layout/pessoa preservados, saldo −4; (2) mesmo post → "usa a foto como referência da pessoa mas gera um novo ambiente ao redor" → msg de confirmação diz "recompor o cenário" → pessoa e texto preservados, cenário novo de fato (não só reenquadrado); (3) carrossel Premium → navegar até slide 3 → pedir ajuste → msg cita "slide 3", só o slide 3 muda, navegação fica no 3; (4) encadear 2 edições seguidas; (5) abrir a Biblioteca depois → card sem JSON bruto, thumbnail = versão editada; (6) conferir que o resultado aparece no viewer. (7) aplicar logo → depois "adiciona o texto 'Promoção'" → **o logo continua visível** (não é mais resetado); mexer em posição/tamanho/cor do texto no painel e ver a imagem recompor. (8) **restaurar** um post Premium com logo da Biblioteca → "adiciona o texto 'X'" → logo NÃO some (é re-carimbado por cima do scrim — fix 08/set); a 2ª gravação da thumbnail no mesmo path precisa da policy RLS de UPDATE no bucket `media` (migration `20260908010000`) senão dá 400. (9) [obsoleto após reversão de 09/09 — texto do carrossel agora é do modelo, ver linha "Validar em produção: reversão do overlay" abaixo]. |
| **Validar em produção: reversão do overlay de texto Premium (09/09, itens 33 + 34)** | Após deploy: (1) gerar post Premium com `"texto entre aspas"` no brief → o texto aparece renderizado pelo modelo, 1 linha, dentro da safe zone com folga; (2) carrossel Premium → cada slide com headline do modelo, sem vazar a margem — conferir por proporção (4:5 tem base 13%, maior que topo 8%); (3) `"adiciona o texto 'X'"` num post Premium → chama o endpoint com `addingText`, texto entra, logo (se havia) permanece; (4) restaurar post Premium com logo da Biblioteca → adicionar texto → logo re-carimbado (fix item 31a intacto); (5) **regra de rosto (item 34):** gerar post Premium com foto de pessoa + texto → o headline NÃO cai sobre o rosto (fica em espaço livre; sujeito encolhe/recompõe se necessário). Como a garantia de safe-zone agora é do modelo, **amostrar vários casos** e observar vazamentos/quebra de linha/texto sobre rosto. |
| **Limpeza futura: `textOverlay.ts` / `premiumCompose.ts`** | Após a reversão de 09/09 (item 33) só servem ao overlay de texto **manual** nos painéis dos viewers. Se esse overlay manual não for usado na prática, avaliar remover os dois módulos + os painéis "Texto sobre a imagem" numa limpeza. |
| **Testar: análise de site no onboarding** | `/api/agent-chat { siteUrl }` → fetch + Claude → brand_description preenchido automaticamente. |
| **Testar: máximo 2 perguntas antes de gerar** | `userMessageCount < 3` → pode perguntar; na 3ª mensagem gera obrigatoriamente. |

## Pendentes Não-Críticos

- `generatePremiumCaption` ainda chama Gemini direto do frontend — migrar para API Route
- Remover `console.log` de debug após estabilização
- `CarouselPage.tsx` e `PremiumPage.tsx` antigas — remover rotas `/carousel` e `/premium` do App.tsx
- Overlay de texto/logo do Premium: controles por âncora discreta (topo/centro/base, S/M/G), sem drag livre nem x/y arbitrário

---

## Decisões de Produto Tomadas

- Standard = gpt-image-1, Premium = GPT Image 2 — tecnologia não é mencionada ao cliente
- 200 pulses no plano base R$47,90/mês (não 50–100 como antes)
- Recargas: 100 pulses R$27,90 · 200 pulses R$49,90 · 500 pulses R$99,90
- Plano anual: R$39,90/mês (R$478,80/ano)
- Sem edição de elementos no canvas pelo usuário — toda edição é conversacional via AgentChat
- Logo é o único elemento editável pelo usuário (via agente), sem arrastar no canvas
- Lançamento beta com 3–5 clientes antes de decisões arquiteturais maiores
- Templates existentes mantidos para MVP — não investir em novos agora
- **Texto no Premium: decisão de 05/09 (overlay de canvas) REVERTIDA PARCIALMENTE em
  09/09/2026 — o modelo volta a renderizar o texto.** A decisão de 05/09 trocava
  qualidade estética por confiabilidade matemática da safe-zone (texto sempre via
  `overlayTextOnImage`, nunca pelo gpt-image-2). Na avaliação com o usuário o
  resultado visual do overlay ficou aquém do esperado — texto "colado por cima", sem
  integração com a cena — e a garantia de safe-zone não compensou. **Novo estado:** o
  gpt-image-2 volta a renderizar texto (via `slideTitle`/`slideBody` e o param
  `addingText` no ajuste), mas sob regras **mais rígidas que a versão original de
  antes de 05/09**: safe zone **~6% lateral / 8% vertical** (era ~3% / 4.5%) e
  headline de **1 linha, ~25 caracteres no máximo, sem subtítulo por padrão**. Regra
  única em `buildTextTypographyRules()` (`api/generate-premium.js`). `overlayTextOnImage`/
  `premiumCompose.ts` seguem no código só como ferramenta de overlay **manual** nos
  painéis dos viewers. Ver itens 29 e 32 do Histórico de Bugs e CLAUDE.md. Antes de
  reverter de novo (pra qualquer lado), reconfirmar com o usuário — os dois lados já
  foram avaliados.

---

## Roadmap — Próximos Itens (ordem de prioridade)

### 1. Stripe + Monetização ✅ (testar renovação + produção real)
- ✅ Pagamento recorrente R$47,90/mês + plano anual
- ✅ Recargas de pulses (100/200/500)
- ✅ Webhook → crédito automático no Supabase
- 🔜 Testar renovação mensal automática em produção
- 🔜 Cadastrar CNPJ/dados bancários da TDA no Stripe (necessário para reativar Stripe Tax e sair do modo de testes)
- 🔜 Portal do cliente para gerenciar assinatura
- ✅ Landing page com os fluxos de checkout (`/checkout` + `/checkout/sucesso` + `/definir-senha`)
- ✅ Provisionamento automático de conta + email de acesso pós-pagamento via Resend (roteamento no mount do App + reset de `access_email_sent_at` por `isNew`); falta validar com checkout real de email novo — ver seção "Aquisição via LP"

### 2. Vercel Pro 🔜
- $120/mês; `maxDuration` até 300s — elimina falhas ocasionais no carrossel premium
- Fazer upgrade ao fechar primeiro cliente pago

### 3. Instagram OAuth multi-tenant 🔜 *(bloqueador para escalar)*
- App Review submetido ao Meta em 26/07/2026 — **rejeitado por vídeo incompleto**
- Reenviado em 14/08/2026 com screencast completo do fluxo de ponta a ponta (login, conexão Instagram, geração de post, publicação, confirmação no feed real) — aguardando nova análise (prazo até 20 dias)
- Enquanto isso: adicionar clientes beta manualmente como Testadores no Developer Portal antes de conseguirem conectar
- OAuth multi-tenant tecnicamente funcional; bug de accessToken/igUserId corrigido em todos os fluxos de publicação

### 4. Landing page de vendas 🔜
- Proposta de valor, demo do agente em ação, planos e preços, CTA

### 5. Redesign do painel de edição direito 🔜
- PropertiesPanel atual tem UX plana — redesign com grupos colapsáveis, controles inline
- Não bloqueia vendas mas impacta percepção de qualidade

---

## Arquivos Principais

- `src/components/AgentChat.tsx` — agente conversacional; fluxos standard, premium, carrossel; modo edição pós-geração; `applyEditActions` (recolor, rewrite, resize, add/remove/resize/move_logo); `forceCollapsed`/`onCollapsedChange` para expand do canvas
- `src/pages/EditorPage.tsx` — tela principal; `GeneratingOverlay` com frases rotativas; renderiza PremiumResultViewer > CarouselViewer > GeneratingOverlay > Canvas; pendingPost restore com guard contra re-registration
- `src/pages/OnboardingPage.tsx` — 8 passos; passo 3 analisa URL do site via `/api/agent-chat { siteUrl }`; campo descrição destacado com badge "Recomendado"
- `src/components/PremiumResultViewer.tsx` — exibe resultado GPT Image 2; download e publicação
- `src/components/CarouselViewer.tsx` — carrossel integrado; publicação LinkedIn com imagens comprimidas
- `src/components/CaptionPanel.tsx` — legenda + publicação LinkedIn/Instagram para posts Konva
- `src/engine/CanvasEngine.tsx` — Konva stage; logo draggable; onTap/onDblTap para seleção no mobile
- `src/services/brandKit.ts` — BrandConfig (inclui `site_url`); loadBrandConfig, saveBrandConfig, savePost, loadPosts
- `src/services/gemini.ts` — thin wrappers HTTP para as API Routes; `EditContext` (inclui `logoSize`); `EditAction` (inclui `move_logo`, `position`)
- `src/services/tokens.ts` — PULSE_COSTS, debitToken, notifyBalanceUpdate
- `src/state/useStore.ts` — Zustand v5 + persist v3; `activeTemplateId` NÃO persistido; `pendingPost` NÃO persistido; `addTemplate` preserva logo mas reseta elementos para defaults
- `src/templates/index.ts` — registry de templates
- `api/agent-chat.js` — Claude Haiku + web search; modo fetch-site (`{ siteUrl }` sem `messages`); modo edição (`editContext`); modo geração; brand_description prompt; 2-round question limit
- `api/generate-post.js` — seleção de template por tema + geração de campos; Claude Haiku
- `api/generate-carousel.js` — slides + legendas melhoradas; Claude Haiku
- `api/generate-premium.js` — GPT Image 2; `maxDuration: 60`
- `api/generate-image-ai.js` — gpt-image-1 (OpenAI); suporte a `aspectRatio`; retorna b64_json
- `api/linkedin-auth.js` / `api/linkedin-callback.js` / `api/linkedin-post.js` — OAuth LinkedIn
- `api/instagram-auth.js` / `api/instagram-callback.js` / `api/instagram-post.js` — OAuth Instagram
- `api/stripe.js` — checkout + webhook consolidados (`?action=checkout|webhook`); crédito automático de pulses no Supabase; provisiona conta + dispara email de acesso no `checkout.session.completed`
- `api-lib/provisionAccount.js` — `ensureUserForCheckout` (conta Supabase Auth + linha `user_tokens` + `action_link` de recovery); idempotente
- `api-lib/sendEmail.js` — `sendEmail`/`sendAccessEmail` via Resend REST; no-op silencioso sem `RESEND_API_KEY`
- `vercel.json` — rewrites para `/api/*`, `/api/stripe/webhook`, `/api/stripe/checkout`, `/auth/linkedin/*`, `/auth/instagram/*` e `/*`

---

## Funções Vercel (12 — NO limite free do Hobby; próxima função nova exige consolidar alguma existente por `?action=` antes de criar arquivo novo)

Tabela corrigida em 05/09/2026 — a versão anterior listava nomes de arquivo antigos
(`instagram-auth.js`, `instagram-callback.js`, `linkedin-auth.js` etc.) que não existem mais desde
que esses fluxos foram consolidados em `instagram.js`/`linkedin.js` por `?action=` (ver
`vercel.json` e a seção de Pegadinhas no CLAUDE.md); a tabela não tinha sido atualizada quando isso
aconteceu, então o contador de "dentro do limite" já estava desatualizado antes mesmo dos 2
arquivos novos abaixo.

| Arquivo | Função |
|---|---|
| `api/agent-chat.js` | Agente conversacional + fetch-site (branch `{ siteUrl }`) |
| `api/generate-post.js` | Geração de post standard (Claude Haiku) |
| `api/generate-carousel.js` | Geração de carrossel + legendas (Claude Haiku) |
| `api/generate-premium.js` | Post premium (GPT Image 2) |
| `api/generate-image-ai.js` | Geração de imagem standard (gpt-image-1) |
| `api/edit-image-ai.js` | Edição de imagem com IA |
| `api/analyze-references.js` | Análise de referências visuais (Claude Haiku vision) — novo, 05/09/2026 |
| `api/review-post.js` | Revisão de post com IA (Claude Haiku vision) — novo, 05/09/2026 |
| `api/instagram.js` | OAuth + callback + publicação Instagram, multiplexado por `?action=auth\|callback\|post` |
| `api/linkedin.js` | OAuth + callback + publicação LinkedIn, multiplexado por `?action=auth\|callback\|post` |
| `api/stripe.js` | Checkout + webhook Stripe, multiplexado por `?action=checkout\|webhook` |
| `api/cron/credit-annual-pulses.js` | Cron diário de crédito de pulses anuais (`vercel.json` → `crons`) |

---

## Templates

Mantém os existentes para o MVP. Com GPT Image 2, templates se tornam menos relevantes no longo prazo.

**Regra para novos templates — sempre registrar em 3 lugares:**
1. `TEMPLATE_FIELDS` em `api/generate-post.js` e `api/generate-carousel.js`
2. Seção TEMPLATES DISPONÍVEIS no prompt (descrição + campos)
3. Regras de seleção no prompt (quando usar)

**Regra de seleção:** template é escolhido pelo TEMA DO CONTEÚDO, não pelo segmento da empresa. Templates `tech-*` são exclusivos para posts cujo assunto seja tecnologia, IA ou digital.

**Templates no registry (`src/templates/index.ts`):** tech-statement, editorial-card, tech-product, tech-minimal, food-promo, tech-news, sport-arena, business-statement, business-card e outros. NÃO existem neste repo: hero-title, big-statement, big-number (são do app Pulse principal).

---

## Custos de API (referência)

- Claude Haiku 4.5: $1/$5 por milhão de tokens input/output
- gpt-image-1: ~$0.04 por imagem (1024px, standard quality)
- GPT Image 2: ~$0.04 por imagem (medium quality)
- Custo total por geração standard: ~R$0,25
- Custo total por geração premium: ~R$0,25
- Margem no plano R$47,90/200 pulses: saudável em ambos os casos

---

## PWA — Estado Atual

- ✅ manifest.webmanifest com nome, ícone, cores da marca
- ✅ Service Worker (vite-plugin-pwa v1.3.0, generateSW mode)
- ✅ Ícones gerados a partir do logo-pulse.svg
- ✅ Service worker configurado para excluir `/api/*` e `/auth/*` do NavigationRoute
- ✅ Layout responsivo — Chrome e Safari mobile
- ✅ Touch no canvas Konva (onTap/onDblTap)
- ✅ PropertiesPanel como bottom sheet no mobile
- ✅ Download nativo iOS via blob URL (toque longo → salvar na galeria)
- 🔜 Teste em dispositivo real para validar fluxo completo mobile

---

## Histórico de Bugs Corrigidos (referência)

1. **Clicar fora do canvas reiniciava o post** → `onClick` no `canvas-area` trocado para `setSelectedElement(null)`
2. **Post da biblioteca não carregava no canvas** → `template_id` normalizado no lookup e na gravação
3. **Restauração gerava nova imagem consumindo pulses** → usa `thumbnail_url` salva; só chama `generateImage()` se nula
4. **Proporção sempre voltava como 1x1** → `activeTemplateId` completo salvo (com sufixo); match exato antes de cair em variants[0]
5. **Text overlays ausentes no carrossel premium** → instruções GPT Image 2 corrigidas
6. **Parâmetro de tamanho inválido no GPT Image 2** → corrigido em `generate-premium.js`
7. **URL OAuth do Instagram incorreta** → corrigido de `api.instagram.com` para `www.instagram.com/oauth/authorize`
8. **LinkedIn publicava como organização** → corrigido para `urn:li:person:${linkedinSub}`
9. **Download não funcionava no iOS** → dataURL convertido para blob URL; nova aba para toque longo
10. **LinkedIn OAuth travava no mobile** → redirect flow no mobile; callback detecta ausência de window.opener
11. **Canvas não respondia ao toque** → onTap/onDblTap em todos os nós Konva
12. **Alucinações anatômicas no FAL.ai** → prompt defensivo automático quando keywords de pessoas detectadas
13. **Textarea perdia foco após enviar mensagem** → removido `disabled={isDisabled}` do `<textarea>`
14. **Modo edição não ativava após geração standard** → `hasGeneratedPost` flag; `effectiveActivePost` reconstruído do store
15. **Template sempre repetia o último gerado** → `activeTemplateBase` só passado quando `activeBase !== lastUsedTemplateRef.current`
16. **add_logo bloqueado em posts premium** → keyword detection; `overlayLogoOnImage` em todos os slides; `onPremiumSlidesUpdate`
17. **Logo saindo do canvas ao redimensionar** → clamp `Math.max(0, ...)` nos quatro cantos em `resize_logo`
18. **Overlay de loading mostrando texto "Aju:"** → removida abordagem `position: absolute`; GeneratingOverlay e canvas são mutuamente exclusivos
19. **resize_logo com percentual drástico** → agente calcula `currentLogoSize × fator`; `logoSize` passado via `EditContext`
20. **Texto desconfigurado ao restaurar da biblioteca** → guard `if (pendingPost) return` no `useEffect([activeTemplate?.id])` evita re-registration sobrescrever textos aplicados
21. **fetch-site ultrapassando limite de funções Vercel** → lógica incorporada em `agent-chat.js` via branch `{ siteUrl }`
22. **Publicação no Instagram falhava (400) em todos os fluxos** → `igUserId` hardcoded e `accessToken` ausente em CaptionPanel, CarouselViewer, PremiumResultViewer, CarouselPage e PremiumPage; corrigido usando `getInstagramConnection` para credenciais OAuth reais do Supabase
23. **Imagens do Standard sempre escuras, slider "Opacidade" só piorava** → overlay preto sobre a foto era hardcoded (`overlayOpacity` até 0.65 no `CanvasEngine.tsx`) e independente do slider, que só controlava a opacidade da própria foto; reduzir opacidade revelava mais do overlay escuro por trás, então "menos opacidade" ficava mais escuro em vez de mais claro. Corrigido: defaults do overlay reduzidos por família de template e novo campo `Template.overlayOpacity` + slider "Escurecimento" no `ImagePanel.tsx` (independente da opacidade da foto)
24. **Zoom da imagem mudava sozinho ao rolar o mouse no canvas** → `onWheel` no `Stage` do `CanvasEngine.tsx` alterava `backgroundZoom` a cada scroll, interferindo na navegação da página; removido — zoom agora só é alterado pelo slider "Zoom" no `ImagePanel.tsx`
25. **Seletor de fonte do Standard tinha poucas opções (10)** → `index.html` já carregava 15 fontes do Google Fonts mas o dropdown em `PropertiesPanel.tsx` só expunha 10; adicionadas as que já estavam carregadas (Sora, DM Sans, Plus Jakarta Sans, Lato, Cormorant Garamond) + 7 fontes modernas novas (Manrope, Outfit, Bricolage Grotesque, Syne, Unbounded, Instrument Serif, Fraunces), totalizando 21 opções
26. **`PremiumResultViewer`/`CarouselViewer` não reagiam a troca de `slides`** (bug latente, exposto ao implementar o ajuste pós-geração Premium em 27/08/2026) → ambos inicializavam `originalSlides`/`originalPremiumSlides` com `useState` sem setter, congelando as imagens no mount; trocar a prop `slides` não atualizava nada. Corrigido com `useEffect([slides])` + guard `didMountRef` que ressincroniza `original*`/`display*` e reseta o estado do logo
27. **Ajuste Premium só reenquadrava quando o pedido era "trocar o cenário"; Biblioteca mostrava o original + JSON bruto no card** (27/08/2026) → (a) o `adjustPrompt` era rígido demais ("preserve everything else exactly as is") e não distinguia ajuste pontual de recomposição parcial. Adicionado `editMode: 'recompose'` em `api/generate-premium.js` (prompt enfático que preserva pessoa + texto mas manda recriar o entorno) + `AgentChat.isRecomposeRequest()` para rotear pelo texto do pedido. (b) `runPremiumAdjust` só atualizava estado em memória; `persistAdjustedPremium` agora sobrescreve o registro salvo (`premiumLibraryId`/`premiumCarouselLibraryId` vindos do `EditorPage` — restauração ou 3º arg de `onPremiumGenerated`). (c) `PostLibraryPage`/`LibraryPage` renderizavam `post.image_prompt` cru, vazando `{"prompt":...}` em posts Premium; novo helper `postCardLabel()` mostra a 1ª linha da legenda
28. **5 bugs reais encontrados em teste de uso (05/09/2026):**
    - **Onboarding "Analisar referências" não fazia nada** → `analyzeVisualReferences`/`reviewPost` (`src/services/gemini.ts`) chamavam Gemini **direto do client** com `VITE_GEMINI_API_KEY` exposta e um `catch` vazio escondia qualquer falha. Migrados para `api/analyze-references.js`/`api/review-post.js` (Claude Haiku vision, server-side, padrão retry+extractJSON dos outros endpoints); erros agora aparecem de verdade na UI, e o Onboarding mostra um resumo real (estilo/cores/composição) em vez de só um "✓ salvo" genérico.
    - **AccountPage mostrava custos em pulses desatualizados** (valores hardcoded sem relação com `PULSE_COSTS`) → agora importa `PULSE_COSTS` de `src/services/tokens.ts` e desmembra Standard vs Premium (post: 4/8, slide: 2/4, edição: 3, revisão: 1, ajuste premium: 4).
    - **Cor da fonte não aplicava no Standard (Konva)** → `CanvasEngine.tsx` forçava texto branco incondicionalmente nos templates `editorial-light-pop`/`warm-circle-bold`/`warm-circle-soft` com foto de fundo (lógica de contraste automático), ignorando a cor escolhida no `PropertiesPanel`. Corrigido com `props.colorOverride: true` setado pelo color picker — o auto-flip de legibilidade só roda quando o usuário não mexeu manualmente.
    - **"Revisão de Post" (Standard) dava erro** → mesma causa do bug do Onboarding (Gemini client-side + catch vazio); corrigido junto com a migração acima.
    - **Premium: post sem texto mesmo pedindo, e ajuste pós-geração adicionava texto serifado/cortado** → tentativa inicial foi reforçar as regras de prompt (safe-zone, sans-serif, `buildTextTypographyRules()`). **Superado pelo item 29** — o problema voltou mesmo com essas regras, e a causa raiz era estrutural (confiar em prompt pra tipografia), não uma questão de regra faltando.
29. **Texto do Premium vazando da safe-zone voltou mesmo após reforçar as regras de prompt pela enésima vez (05/09/2026, mesmo dia do item 28)** → decisão estrutural: o gpt-image-2 **nunca mais é instruído a renderizar texto**, em nenhum caminho (geração normal, carrossel, ajuste). `api/generate-premium.js` passa a dizer sempre "não desenhe texto nenhum" (regra `CRITICAL — NO TEXT` incondicional) e, quando há `slideTitle`, só pede pra deixar a faixa inferior "limpa" visualmente. O headline/subtitle de verdade é desenhado **depois**, via `overlayTextOnImage` (`src/services/textOverlay.ts`, novo — mesmo padrão canvas que `logoOverlay.ts` já usava pro logo): safe-zone (3%/4.5%) e fonte sans-serif viram constantes de código com auto-fit, não texto de prompt — garantia matemática em vez de instrução que o modelo podia ignorar. `AgentChat.isAddTextRequest()` também para de chamar o gpt-image-2 pra adicionar texto — vira um `overlayTextOnImage` direto na imagem em memória, instantâneo. Removido o código morto de `buildTextTypographyRules()`/branch `addingText` do `adjustPrompt` (item 28) — a solução de reforçar o prompt tinha sido descartada por não ser "estruturalmente confiável", exatamente a lição que motivou essa reescrita. **↩ REVERTIDO PARCIALMENTE (09/09/2026):** na avaliação visual com o usuário o overlay de canvas decepcionou (texto "colado por cima", sem integração com a cena) e a garantia matemática de safe-zone não compensou. O gpt-image-2 **volta a renderizar o texto** — `buildTextTypographyRules()` e o branch `addingText` do `adjustPrompt` foram restaurados (base `abb9ae7`), agora com dois tetos **mais rígidos que o original**: safe zone ~6%/8% (era ~3%/4.5%) e headline de 1 linha ≤ ~25 chars, sem subtítulo salvo `slideBody` explícito. `isAddTextRequest` volta a chamar `/api/generate-premium` com `addingText: true` (reusando o fluxo de ajuste, então a reativação de logo do item 31a fica intacta). `textOverlay.ts`/`premiumCompose.ts` **não** foram apagados — viram ferramenta de overlay manual nos painéis dos viewers. Ver item 33.
30. **Logo do Premium sumia ao adicionar texto depois; fonte do overlay genérica; sem controle pós-inserção (05/09/2026)** → (a) **causa raiz:** cada viewer (`PremiumResultViewer`, `CarouselViewer`) congelava seu próprio estado de logo em `useState` e um `useEffect([slides])` resetava esse estado quando a prop `slides` mudava — o overlay de texto vinha da base sem logo e o reset descartava a versão com logo. Refatorado para **centralizar as camadas no `EditorPage`** (fonte única `premiumLogoLayer`/`premiumTextLayer`; carrossel: logo global + texto por slide) com um único ponto de composição `base → texto → logo` (`src/services/premiumCompose.ts`, `composePremiumImage`); os viewers passaram a só exibir a imagem composta e emitir callbacks, e o `AgentChat` ("adiciona logo"/"adiciona o texto '...'") mexe nas camadas em vez de assar bytes. (b) `overlayTextOnImage` deixou de ser Helvetica/Arial fixa — ganhou `band`/`scale`/`color`/`font` (default **Sora 700**, alternativa Playfair Display; `document.fonts.load` aguardado antes de desenhar). (c) painel "Texto sobre a imagem" nos dois viewers com posição/tamanho/cor/fonte, espelhando os controles de logo; `ColorSwatch` extraído de `PropertiesPanel.tsx` pra `src/components/ColorSwatch.tsx`. (d) mensagem de espera da geração/ajuste Premium deixou de prometer "até 60s" (quebrava expectativa quando passava disso) — agora "capricho leva tempo" / "pode levar alguns instantes", sem número.
31. **Os 3 problemas do item 30 voltaram no teste real mesmo com a Opção B (07–08/09/2026)** → a Opção B só cobria o post 100% gerado no Editor; três lacunas restavam. (a) **Logo some ao adicionar texto (posts restaurados da Biblioteca):** o `thumbnail_url` salvo tem o logo *nos pixels* e `premiumLogoLayer` volta inativo no restore — o scrim de texto cobria o logo queimado. Fix: `runPremiumAdjust` (ramos "adicionar texto" e ajuste normal) resolve a URL do logo (`premiumLogoUrl` → brand kit) e reativa a camada quando ela está inativa mas há URL, então `composePremiumImage` re-carimba o logo por cima do scrim (mesma posição/tamanho da geração → idêntico). Props novas: `onPremiumLogoUrlChange`, `onPremiumCarouselLogoLayerChange`. (b) **Texto fora da safe area:** bug de geometria no `overlayTextOnImage` — o loop de encaixe limitava só o `blockHeight` e ignorava o offset de início do desenho, então headline **+ subtitle** (carrossel Premium) vazava a margem inferior. Fix: o loop agora replica a fórmula exata do `y` do renderer (`firstBaselineY()` por band) e encolhe até `renderedBottom() ≤ safeBottom` **e** `renderedTop() ≥ safeTop`; corta linhas se nem no `MIN_FONT_SIZE` couber. Verificado por simulação: 0 violações em 6048 casos (antes: 193 no subset bottom/medium). (c) **Upload de thumbnail 400:** não era das mudanças — `storage.objects` do bucket `media` só tinha policy de `INSERT`/`SELECT`. `uploadThumbnail` usa `upsert: true`; a 2ª gravação no mesmo path é `UPDATE` e era negada por RLS. Surgiu quando `persistAdjustedPremium` passou a sobrescrever `thumbnails/{email}/{id}.jpg`. Fix: migration `20260908010000_add_media_update_rls_policy.sql` (aplicada em prod via MCP).
32. **Pacote de melhorias do overlay de texto Premium — Fases 1–3 (08/09/2026)** → **Fase 1:** bug da âncora "Centro superior" do logo (`overlayLogoOnImage` usava `y = img.height/3 - logoH/2` em vez de `y = margin` — logo caía a ~1/3 da altura em vez da margem do topo). **Fase 2:** 4 fontes impact/condensadas (Anton, Archivo Black, Bebas Neue, Oswald) + peso por família; e a verificação vertical do auto-fit trocou as constantes calibradas na Sora (`ASCENT_RATIO=0.93`, `DESCENT_RATIO=0.30`, `lineHeight=size*1.25`) por **medição real via `TextMetrics.actualBoundingBoxAscent/Descent`** — `inkExtent()` mede a tinta de verdade por fonte e por conteúdo; `firstBaselineY`/`renderedTop`/`renderedBottom` consomem esses valores; `ctx.textBaseline='alphabetic'` setado antes de qualquer `measureText`; `INK_PAD` 2→3, `TOP_PAD`=4; passo-2 (corte de linhas) passou a checar `renderedTop` também (necessário na band `center`). Verificado: 36.288 casos (6 fontes × sweep × métrica perturbada ±6% + 1.5px de antialias), 0 violações, folga mínima +1.5px base / +2.5px topo. **Fase 3:** `overlayTextOnImage` aceita texto estruturado — `headline`/`subtitle` como `string | StyledLine[]` com runs `{ text, color? }` (só cor varia por run; peso é do bloco). `wrapTokenLine`/`toRenderLine`/`inkExtent` rodam no texto achatado → largura/ascent/descent/nº-de-linhas idênticos aos de uma string simples (validado: `sim-runs-neutrality.mjs`, 972 casos, 0 divergências → garantia da Fase 2 transfere sem reexecução). `drawFittedBlock`: linha sem cor de run = caminho centrado byte-idêntico à Fase 2; com cor = alinha à esquerda e avança x por run. UI opção A: campo "Destaque (trecho + cor)" nos viewers → `premiumCompose.buildHighlightedHeadline` monta o `StyledLine[]` (match só em fronteira de palavra). Peso por run e drag ficam pra Fase 3.1+. Fases 1–2 commitadas separadamente (`5e87eaf`, `f43ef9a`); Fase 3 neste commit. Scripts de simulação em `scratchpad/` (não versionados). **↩ Parcialmente obsoleto (09/09/2026, ver item 33):** a reversão do overlay de texto Premium tirou as Fases 2–3 do caminho de geração — elas seguem valendo só pro overlay manual nos painéis dos viewers. A Fase 1 (fix do logo "Centro superior", `5e87eaf`) **não** foi afetada: é do overlay de logo, permanece.

33. **Reversão parcial do overlay de texto Premium — o modelo volta a renderizar texto (09/09/2026)** → decisão de produto do usuário: o overlay de canvas dos itens 29/32 foi avaliado visualmente e **decepcionou** — texto "colado por cima", sem integração com a cena; a confiabilidade matemática da safe-zone não compensou a perda estética. Edição cirúrgica (não `git revert`): (a) `api/generate-premium.js` — prompt restaurado da base `abb9ae7` (`buildTextTypographyRules()` como fonte única + `MANDATORY TEXT TO RENDER — OVERRIDE` em `carouselTextOverlay` + variante `addingText` do `adjustPrompt`), com **dois tetos mais rígidos que o original**: safe zone **~6% lateral / 8% vertical** (era ~3%/4.5%) e headline de **1 linha, ~25 caracteres no máximo** (teto de `scripts/test-model-text.mjs`), **sem subtítulo** salvo `slideBody` explícito. (b) `adjustPremiumImage` (`gemini.ts`) reganhou o param `addingText`; o ramo `addingText` de `runPremiumAdjust` volta a chamar o endpoint (reusando o fluxo de ajuste normal → a reativação de logo do item 31a fica intacta), em vez de montar camada de texto no `EditorPage`. (c) overlay pós-geração removido em `AgentChat` (post único + carrossel) e `PremiumPage.tsx` (que usa `generateImage`→`/api/generate-image-ai`, não o endpoint premium — regras espelhadas inline nas strings de prompt). (d) `textOverlay.ts`/`premiumCompose.ts` **mantidos** como ferramenta de overlay/edição de texto **manual** (painéis "Texto sobre a imagem" dos viewers); podem ser removidos numa limpeza futura. **Preservados intactos:** fix do logo `5e87eaf`, migration RLS `20260908010000`, e toda a camada de **logo** do `EditorPage`. Validação: `build` + `lint` OK (0 erros novos); a garantia de safe-zone agora depende do modelo, não de geometria determinística — validação é visual, em produção, com amostragem.

34. **Safe zone do texto Premium por proporção + regra de "texto nunca sobre rosto" (09/09/2026)** → refinamento das regras de prompt restauradas no item 33, ambas em `buildTextTypographyRules()` de `api/generate-premium.js` (fonte única — herda pelos 3 caminhos: `MANDATORY RULES` inline do `fullPrompt`, `carouselTextOverlay`, variante `addingText` do `adjustPrompt`). **(1) Safe zone por proporção:** a margem única `~6% lateral / 8% vertical` do item 33 foi substituída por margens **medidas de layouts de referência reais** (fundo vermelho = proibido / retângulo amarelo = permitido), distintas por aspect ratio — lateral / topo / base, em % das dimensões do canvas: **1:1 → 10% / 9% / 9%**; **4:5 → 10% / 8% / 13%**; **9:16 → 15% / 9% / 9%**; **16:9 ou outras → 12% em todas as bordas** (fallback conservador, sem medição). Enquadradas como MÍNIMOS ("err well inside… never sit against the boundary"). **(2) Regra de rosto** (`CRITICAL — TEXT NEVER OVER A FACE`): quando a imagem tem pessoas, o texto renderizado **não pode** sobrepor/tocar/cruzar rosto ou cabeça — posiciona o headline em espaço livre (fundo, céu, parede, chão, área vazia); se só couber cruzando um rosto, encolhe o sujeito ou recompõe. É distinta do bloco `CRITICAL FACE AND IDENTITY PRESERVATION` já existente (aquele é sobre *preservar identidade* de foto de referência; este é sobre *posição do texto*). Validação: `build` + `lint` OK; garantia continua sendo do modelo (não determinística) → validar visualmente em produção. **Junto neste commit:** o Premium migrou de `gpt-image-2` para **`gpt-image-2.5-flare`** em `api/generate-premium.js` (todas as chamadas — `generations` e `edits`). Sem mudança de schema: mesmos params (`model`/`prompt`/`n`/`size`/`quality` — `quality: 'medium'` e `size` `1024x1024`/`1024x1536` seguem válidos), mesmo envelope de resposta, rate card de tokens idêntico ($5/$8/$30 por 1M in-text/in-img/out-img). Prompt rico mantido inteiro (headline+subtitle, hierarquia, safe zone por proporção, regra de rosto) — o objetivo é testar o mesmo prompt com o modelo novo por trás, não afrouxar as regras de texto. `scripts/test-model-text.mjs` (fora do repo versionado, não commitado) também roda com `gpt-image-2.5-flare` para comparação offline de custo/latência/qualidade contra o `gpt-image-2`.

35. **`adjustPrompt` normal (ajuste pontual) não tinha regras de texto nem trava de enquadramento (09/09/2026)** → teste real: um pedido de ajuste geral ("destacar mais o texto" — edição de ênfase, não texto literal entre aspas) resultou em texto **quase vazando a safe zone** E na **foto levemente ampliada/recomposta**, apesar da doc do modelo prometer preservar o resto da imagem em edições. O ramo `addingText` do `adjustPrompt` já tinha `buildTextTypographyRules()` + anti-crop; o ramo normal (cor/luz/fundo/ênfase) não. Fix em `api/generate-premium.js`: o ramo normal agora (a) inclui `buildTextTypographyRules()` (safe zone por proporção + regra de rosto + tipografia/acentuação) sob um header `TEXT ALREADY IN THE IMAGE` com **guard**: "o texto visível está correto — não adicione/remova/encurte/reescreva; as regras abaixo governam só POSIÇÃO e legibilidade" (neutraliza os sub-itens de `≤25 chars`/`sem subtítulo` que senão apagariam um headline+subtítulo válido num ajuste); (b) ganha o bloco `CRITICAL — PRESERVE THE EXACT ORIGINAL FRAMING` (não ampliar, não zoom in/out, não crop/re-crop/re-center/pan/pad/letterbox, não mudar aspect ratio — "the photo must not grow, shrink, or shift even slightly"). Como o payload de ajuste (`adjustPremiumImage` em `gemini.ts`) **não manda `slideTitle`/`slideBody`**, não há sinal server-side de "tem texto" → as regras entram **sempre** no ramo de ajuste (são auto-condicionais no próprio texto). `recomposePrompt` **não** foi tocado (ali reenquadrar o cenário é o objetivo). `build` + `lint` OK.

36. **`SecurityError` (canvas tainted) ao editar post Premium restaurado da Biblioteca (09/09/2026)** → console: `SecurityError: The operation is insecure. at toDataURL`. Post gerado na hora tem a base como data URL em `premiumSlides[0].image`; **restaurado**, a base é a `thumbnail_url` (URL cross-origin do Supabase Storage — `EditorPage.tsx` restore de `premium-single`). Os helpers de canvas do `AgentChat.tsx` (`compressReferenceImage`, `cropImageToRatio`, `measureForAdjust`) rodavam com `new Image()` **sem `crossOrigin`** → `ctx.drawImage` contaminava o canvas → `toDataURL()` lançava. Pior: o throw acontecia **dentro do `img.onload`**, e o `reject` só estava ligado ao `onerror` — a Promise ficava pendente pra sempre → `await` nunca voltava → `setGenerating(false)` do `finally` nunca rodava → **spinner "gerando..." infinito** (falha silenciosa). Fix (`AgentChat.tsx` + 2 viewers, só client): (a) helper compartilhado `loadImageForCanvas(url)` — `crossOrigin='anonymous'` antes do `src`, cache-bust `?cors=1` em URLs http(s), e **rejeita** em erro de load; (b) `toDataURL()` em `try/catch` que lança `Error` com mensagem clara → o `catch` do `runPremiumAdjust` mostra no chat e libera o spinner; (c) `crossOrigin="anonymous"` nos `<img>` de display de `PremiumResultViewer` e `CarouselViewer` (ramo premium) — senão o cache sem-CORS do display envenena o load do canvas. Bucket `media` já serve `access-control-allow-origin: *` — nada a mudar no Supabase. **Bug pré-existente** (restore+adjust+overwrite coexistem desde itens 27/31), exposto agora pelo teste; **não** relacionado ao swap `gpt-image-2.5-flare` (server-side, devolve data URL). `build` + `lint` OK (erros de lint restantes são pré-existentes).
