# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Modelo de Negócio
- **SaaS:** R$47,90/mês com 200 pulses incluídos
- **Recargas:** 100 pulses R$27,90 · 200 pulses R$49,90 · 500 pulses R$99,90
- **Plano anual:** R$39,90/mês (R$478,80/ano)
- **White-label:** R$2.500–4.000 setup + retainer mensal
- **Pulses:** post standard (gpt-image-1) = 4 pulses · slide carrossel = 2 pulses · post premium (GPT Image 2) = 8 pulses
- **Onboarding manual (primeiros clientes):** Pix + criação de conta manual no Supabase — sem Stripe ainda
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
- Posts premium: apenas logo inserível/removível via agente (imagem gerada não é editável)
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
| Modo edição pós-geração (standard) | Flag `hasGeneratedPost`; mensagens subsequentes vão direto para edit mode; AgentChat detecta do store quando `activePost` prop ainda é null |
| Agente editor — ações de edição | recolor, rewrite, resize (formato), recolor_background, overlay_opacity, overlay_color, add_logo, remove_logo, resize_logo, move_logo |
| resize_logo relativo | Agente calcula `currentLogoSize × fator`; `currentLogoSize` passado via `EditContext.logoSize` |
| move_logo com safety area | 60px de margem em todas as bordas; posições: bottom-center, top-center, center, cantos e lados |
| add_logo / remove_logo (standard) | Carrega logo do brand kit; aplica em todas as variantes; undo via `originalPremiumSlidesRef` |
| add_logo / remove_logo (premium) | Aplica `overlayLogoOnImage` via canvas; remove restaurando slides originais via ref |
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
- OAuth implementado tecnicamente (`instagram-auth.js`, `instagram-callback.js`, `instagram-post.js`)
- **Bloqueado para produção:** sem App Review do Meta, funciona apenas com até 25 contas de teste
- **UX:** botão "Conectar" exibe **(em breve)** em cinza
- Primeiros clientes: adicionar como Testadores no Meta Developer Portal

### Migração Gemini → Claude Haiku 4.5
| Função | Rota Vercel | Status |
|---|---|---|
| `agentChat` | `/api/agent-chat.js` | ✅ Migrado |
| `generatePostContent` | `/api/generate-post.js` | ✅ Migrado |
| `generateCarouselContent` | `/api/generate-carousel.js` | ✅ Migrado |
| `generatePremiumCaption` | — | 🔜 Pendente (ainda usa Gemini direto do frontend) |
| `turboPrompt` / `turboPromptEditor` | — | 🔜 Pendente |
| `breakCarouselIntoSlides` | — | 🔜 Pendente |
| `analyzeVisualReferences` | — | 🔜 Pendente (multimodal) |

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
4. `PremiumResultViewer` exibe imagem com legenda, download e publicação
5. Logo inserível via chat: "insira o logo" → `overlayLogoOnImage` em todos os slides
6. Logo removível via chat: restaura slides originais via `originalPremiumSlidesRef`

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

## Pendentes Críticos (afetam UX em produção)

| Item | Detalhe |
|---|---|
| **Vercel Pro** | $120/mês — resolve timeout do Premium definitivamente (maxDuration até 300s). Fazer upgrade ao fechar primeiro cliente pago. |
| **Stripe** | Pagamento recorrente R$47,90/mês com 200 pulses; recargas; webhook → crédito automático de pulses. Enquanto isso: onboarding manual via Pix. |
| **Instagram OAuth multi-tenant** | Bloqueado sem App Review do Meta. Preparar screencast + política de privacidade para review. |
| **Testar: texto desconfigurado ao restaurar** | Regressão suspeita; logs de diagnóstico adicionados no pendingPost effect — verificar no console ao restaurar da biblioteca. |
| **Testar: premium sem logo automático** | Verificar que `generatePremium` não sobrepõe logo automaticamente; testar add/remove logo via chat. |
| **Testar: análise de site no onboarding** | `/api/agent-chat { siteUrl }` → fetch + Claude → brand_description preenchido automaticamente. |
| **Testar: máximo 2 perguntas antes de gerar** | `userMessageCount < 3` → pode perguntar; na 3ª mensagem gera obrigatoriamente. |

## Pendentes Não-Críticos

- `generatePremiumCaption` ainda chama Gemini direto do frontend — migrar para API Route
- Remover `console.log` de debug após estabilização
- `CarouselPage.tsx` e `PremiumPage.tsx` antigas — remover rotas `/carousel` e `/premium` do App.tsx
- Logo sobrepõe texto no PremiumResultViewer — posição fixa, sem drag

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

---

## Roadmap — Próximos Itens (ordem de prioridade)

### 1. Stripe + Monetização 🔜
- Pagamento recorrente R$47,90/mês + plano anual
- Recargas de pulses (100/200/500)
- Webhook → crédito automático no Supabase
- Portal do cliente para gerenciar assinatura

### 2. Vercel Pro 🔜
- $120/mês; `maxDuration` até 300s — elimina falhas ocasionais no carrossel premium
- Fazer upgrade ao fechar primeiro cliente pago

### 3. Instagram OAuth multi-tenant 🔜 *(bloqueador para escalar)*
- App Review do Meta: screencast + política de privacidade + descrição de uso
- Enquanto isso: adicionar clientes como Testadores no Developer Portal

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
- `vercel.json` — rewrites para `/api/*`, `/auth/linkedin/*`, `/auth/instagram/*` e `/*`

---

## Funções Vercel (12 — dentro do limite free)

| Arquivo | Função |
|---|---|
| `api/agent-chat.js` | Agente conversacional + fetch-site (branch `{ siteUrl }`) |
| `api/generate-post.js` | Geração de post standard (Claude Haiku) |
| `api/generate-carousel.js` | Geração de carrossel + legendas (Claude Haiku) |
| `api/generate-premium.js` | Post premium (GPT Image 2) |
| `api/generate-image-ai.js` | Geração de imagem standard (gpt-image-1) |
| `api/edit-image-ai.js` | Edição de imagem com IA |
| `api/instagram-auth.js` | Inicia OAuth Instagram |
| `api/instagram-callback.js` | OAuth callback + refresh lazy (dual-purpose) |
| `api/instagram-post.js` | Publicação no Instagram |
| `api/linkedin-auth.js` | Inicia OAuth LinkedIn |
| `api/linkedin-callback.js` | OAuth callback LinkedIn |
| `api/linkedin-post.js` | Publicação no LinkedIn |

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
