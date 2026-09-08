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
| Ajuste pós-geração Premium | `runPremiumAdjust` no AgentChat: pedido em linguagem natural na imagem já gerada → confirma 4 pulses → `/api/generate-premium` usando a imagem como `visualReferences`. `AgentChat.isRecomposeRequest()` escolhe `editMode: 'adjust'` (preservação total — "escurece o fundo") ou `editMode: 'recompose'` (preserva pessoa + texto, recria o cenário — "novo ambiente ao redor"; prompt enfático porque o gpt-image-2 tende a só reenquadrar). `AgentChat.isAddTextRequest()` detecta pedido de adicionar texto e **nem chama o gpt-image-2** — vira a camada de texto do `EditorPage` (instantâneo, sem custo de API). Post único + por slide de carrossel Premium (alvo = slide visível no `CarouselViewer`). Pós-sucesso, `persistAdjustedPremium` sobrescreve o registro na Biblioteca com os bytes compostos (`premiumLibraryId`/`premiumCarouselLibraryId` vindos do `EditorPage`) — carrossel gerado no Editor não tem registro e não persiste |
| Camadas de overlay do Premium (logo + texto coexistindo) | Desde 05/09/2026 o `EditorPage` é a fonte única das camadas de logo e texto do Premium (`premiumLogoLayer`/`premiumTextLayer` pro post único; logo global + texto por slide pro carrossel) e compõe `base → texto → logo` num só lugar (`src/services/premiumCompose.ts`, `composePremiumImage`). Os viewers (`PremiumResultViewer`, `CarouselViewer`) só exibem a imagem já composta e seus painéis de logo/texto só emitem callbacks. Corrigiu o bug em que aplicar logo e depois pedir texto fazia o logo sumir (cada viewer congelava seu próprio estado de logo e o reset ao trocar `slides` descartava a versão com logo) |
| Texto no Premium via overlay de canvas (não pelo modelo de imagem) | `src/services/textOverlay.ts` (`overlayTextOnImage`) — desde 05/09/2026, texto nunca é renderizado pelo gpt-image-2; ele gera a imagem sem texto e o headline/subtitle é desenhado depois via `<canvas>`, com safe-zone (3%/4.5%) garantida em código. Assinatura aceita `band` (topo/centro/base), `scale`, `color` e `font` (`sans`→Sora / `serif`→Playfair Display) — fonte default deixou de ser Helvetica genérica; `document.fonts.load` é aguardado antes de desenhar. Controles pós-inserção (posição/tamanho/cor/fonte) ficam no painel "Texto sobre a imagem" dos viewers, espelhando os controles de logo. Usado em `PremiumPage.tsx` (geração) e via `composePremiumImage` no `EditorPage` |
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
8. Ajuste/recompose pós-geração via chat: qualquer pedido que não seja de logo/texto → confirma 4 pulses → `runPremiumAdjust` reenvia a imagem gerada como `visualReferences` + `editMode: 'adjust'` ou `'recompose'` (decidido por `isRecomposeRequest`) → resultado substitui a base `premiumSlides` (post) ou o slide de `carouselSlides` (carrossel Premium) → `persistAdjustedPremium` sobrescreve o registro salvo na Biblioteca com os bytes compostos

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

**PRÓXIMO PASSO:** o usuário vai abrir **outra conversa no Claude.ai** (fora do
Claude Code) para enviar os screenshots do resultado atual, discutir os ajustes
finos e voltar com instruções específicas. **Não mexer no overlay de texto/logo do
Premium até essas instruções chegarem.**

**Comando pronto para colar na próxima sessão do Claude Code:**

> Leia o CONTEXT.md — a correção do bug de logo+texto+RLS (commit cd2a5f0) foi
> validada como funcional em produção, mas há ajustes finos pendentes de definição
> após análise visual em outra conversa. Aguarde instruções específicas antes de
> qualquer alteração.

---

## Pendentes Críticos (afetam UX em produção)

| Item | Detalhe |
|---|---|
| **Vercel Pro** | $120/mês — resolve timeout do Premium definitivamente (maxDuration até 300s). Fazer upgrade ao fechar primeiro cliente pago. |
| **Stripe** | ✅ Integração completa e testada — checkout mensal/anual, recargas (100/200/500) e crédito automático via webhook funcionando de ponta a ponta. LP + `/checkout` + provisionamento automático de conta + email de acesso pós-pagamento (Resend) implementados; falta validar com um checkout real de email novo. Pendente: testar renovação mensal automática, cadastrar CNPJ/dados bancários da TDA (Stripe Tax desativado até lá). |
| **Instagram OAuth multi-tenant** | App Review rejeitado (vídeo incompleto) — reenviado ao Meta em 14/08/2026 com screencast completo do fluxo de ponta a ponta (login, conexão Instagram, geração de post, publicação, confirmação no feed real). Aguardando nova análise (prazo até 20 dias). Enquanto isso, adicionar clientes beta manualmente como Testadores no Meta Developer Portal antes de conseguirem conectar. OAuth tecnicamente funcional; bug de accessToken/igUserId no CaptionPanel/CarouselViewer/PremiumResultViewer já corrigido. |
| **Testar: texto desconfigurado ao restaurar** | Regressão suspeita; logs de diagnóstico adicionados no pendingPost effect — verificar no console ao restaurar da biblioteca. |
| **Testar: premium sem logo automático** | Verificar que `generatePremium` não sobrepõe logo automaticamente; testar add/remove logo via chat. |
| **Testar em produção: ajuste/recompose pós-geração Premium** | Fluxo não testável localmente (`vite` não serve `/api/*`; `gpt-image-2` é pago). Após deploy: (1) gerar post Premium → "escurece o fundo" → confirmar 4 pulses → só o fundo muda, texto/layout/pessoa preservados, saldo −4; (2) mesmo post → "usa a foto como referência da pessoa mas gera um novo ambiente ao redor" → msg de confirmação diz "recompor o cenário" → pessoa e texto preservados, cenário novo de fato (não só reenquadrado); (3) carrossel Premium → navegar até slide 3 → pedir ajuste → msg cita "slide 3", só o slide 3 muda, navegação fica no 3; (4) encadear 2 edições seguidas; (5) abrir a Biblioteca depois → card sem JSON bruto, thumbnail = versão editada; (6) conferir que o resultado aparece no viewer. (7) aplicar logo → depois "adiciona o texto 'Promoção'" → **o logo continua visível** (não é mais resetado); mexer em posição/tamanho/cor do texto no painel e ver a imagem recompor. (8) **restaurar** um post Premium com logo da Biblioteca → "adiciona o texto 'X'" → logo NÃO some (é re-carimbado por cima do scrim — fix 08/set); a 2ª gravação da thumbnail no mesmo path precisa da policy RLS de UPDATE no bucket `media` (migration `20260908010000`) senão dá 400. (9) `overlayTextOnImage` com headline+subtitle (carrossel) → texto nunca ultrapassa a margem de 4.5% (fix de geometria 08/set, verificado por simulação). |
| **Ajustes finos do overlay texto/logo Premium (aguardando screenshots)** | Bug logo+texto+RLS (commit `cd2a5f0`) validado como funcional em prod pelo usuário, mas o acabamento visual (posição/tamanho/estética de texto e logo) ainda precisa de refino. Definição virá de outra conversa no Claude.ai com prints. **Não alterar o overlay Premium até instruções específicas.** Ver "Status da Última Sessão" acima. |
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
- **Texto no Premium: confiabilidade > estética de "texto embutido na cena" (05/09/2026).**
  Aprovado explicitamente pelo usuário depois do bug de texto vazando a safety zone
  voltar várias vezes mesmo com regras de prompt reforçadas: texto agora é sempre
  overlay de canvas (`overlayTextOnImage`), nunca renderizado pelo gpt-image-2 — ver
  detalhe técnico no item 29 do Histórico de Bugs e em CLAUDE.md. Não reverter para
  texto renderizado pelo modelo sem reconfirmar essa decisão com o usuário.

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
29. **Texto do Premium vazando da safe-zone voltou mesmo após reforçar as regras de prompt pela enésima vez (05/09/2026, mesmo dia do item 28)** → decisão estrutural: o gpt-image-2 **nunca mais é instruído a renderizar texto**, em nenhum caminho (geração normal, carrossel, ajuste). `api/generate-premium.js` passa a dizer sempre "não desenhe texto nenhum" (regra `CRITICAL — NO TEXT` incondicional) e, quando há `slideTitle`, só pede pra deixar a faixa inferior "limpa" visualmente. O headline/subtitle de verdade é desenhado **depois**, via `overlayTextOnImage` (`src/services/textOverlay.ts`, novo — mesmo padrão canvas que `logoOverlay.ts` já usava pro logo): safe-zone (3%/4.5%) e fonte sans-serif viram constantes de código com auto-fit, não texto de prompt — garantia matemática em vez de instrução que o modelo podia ignorar. `AgentChat.isAddTextRequest()` também para de chamar o gpt-image-2 pra adicionar texto — vira um `overlayTextOnImage` direto na imagem em memória, instantâneo. Removido o código morto de `buildTextTypographyRules()`/branch `addingText` do `adjustPrompt` (item 28) — a solução de reforçar o prompt tinha sido descartada por não ser "estruturalmente confiável", exatamente a lição que motivou essa reescrita.
30. **Logo do Premium sumia ao adicionar texto depois; fonte do overlay genérica; sem controle pós-inserção (05/09/2026)** → (a) **causa raiz:** cada viewer (`PremiumResultViewer`, `CarouselViewer`) congelava seu próprio estado de logo em `useState` e um `useEffect([slides])` resetava esse estado quando a prop `slides` mudava — o overlay de texto vinha da base sem logo e o reset descartava a versão com logo. Refatorado para **centralizar as camadas no `EditorPage`** (fonte única `premiumLogoLayer`/`premiumTextLayer`; carrossel: logo global + texto por slide) com um único ponto de composição `base → texto → logo` (`src/services/premiumCompose.ts`, `composePremiumImage`); os viewers passaram a só exibir a imagem composta e emitir callbacks, e o `AgentChat` ("adiciona logo"/"adiciona o texto '...'") mexe nas camadas em vez de assar bytes. (b) `overlayTextOnImage` deixou de ser Helvetica/Arial fixa — ganhou `band`/`scale`/`color`/`font` (default **Sora 700**, alternativa Playfair Display; `document.fonts.load` aguardado antes de desenhar). (c) painel "Texto sobre a imagem" nos dois viewers com posição/tamanho/cor/fonte, espelhando os controles de logo; `ColorSwatch` extraído de `PropertiesPanel.tsx` pra `src/components/ColorSwatch.tsx`. (d) mensagem de espera da geração/ajuste Premium deixou de prometer "até 60s" (quebrava expectativa quando passava disso) — agora "capricho leva tempo" / "pode levar alguns instantes", sem número.
31. **Os 3 problemas do item 30 voltaram no teste real mesmo com a Opção B (07–08/09/2026)** → a Opção B só cobria o post 100% gerado no Editor; três lacunas restavam. (a) **Logo some ao adicionar texto (posts restaurados da Biblioteca):** o `thumbnail_url` salvo tem o logo *nos pixels* e `premiumLogoLayer` volta inativo no restore — o scrim de texto cobria o logo queimado. Fix: `runPremiumAdjust` (ramos "adicionar texto" e ajuste normal) resolve a URL do logo (`premiumLogoUrl` → brand kit) e reativa a camada quando ela está inativa mas há URL, então `composePremiumImage` re-carimba o logo por cima do scrim (mesma posição/tamanho da geração → idêntico). Props novas: `onPremiumLogoUrlChange`, `onPremiumCarouselLogoLayerChange`. (b) **Texto fora da safe area:** bug de geometria no `overlayTextOnImage` — o loop de encaixe limitava só o `blockHeight` e ignorava o offset de início do desenho, então headline **+ subtitle** (carrossel Premium) vazava a margem inferior. Fix: o loop agora replica a fórmula exata do `y` do renderer (`firstBaselineY()` por band) e encolhe até `renderedBottom() ≤ safeBottom` **e** `renderedTop() ≥ safeTop`; corta linhas se nem no `MIN_FONT_SIZE` couber. Verificado por simulação: 0 violações em 6048 casos (antes: 193 no subset bottom/medium). (c) **Upload de thumbnail 400:** não era das mudanças — `storage.objects` do bucket `media` só tinha policy de `INSERT`/`SELECT`. `uploadThumbnail` usa `upsert: true`; a 2ª gravação no mesmo path é `UPDATE` e era negada por RLS. Surgiu quando `persistAdjustedPremium` passou a sobrescrever `thumbnails/{email}/{id}.jpg`. Fix: migration `20260908010000_add_media_update_rls_policy.sql` (aplicada em prod via MCP).
