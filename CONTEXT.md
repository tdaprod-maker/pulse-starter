# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Modelo de Negócio
- **SaaS:** R$47/mês com 50–100 pulses incluídos + compra de pulses adicionais
- **White-label:** R$2.500–4.000 setup + retainer mensal
- **Pulses:** post FAL.ai = 4 pulses, slide carrossel = 2 pulses, post Premium = 8 pulses
- **Onboarding manual (primeiros clientes):** Pix + criação de conta manual no Supabase — sem Stripe ainda
- Margem de API é saudável — custo real por geração é centavos

## Visão do Produto
**O agente é o produto.** O Pulse não é uma ferramenta de design — é um designer de bolso com IA. O usuário conversa com o agente, que instrui, orienta e executa. O agente:
- Conhece boas práticas de design e redes sociais
- Orienta antes de gerar ("posts educativos performam 3x mais no LinkedIn")
- Decide a engine internamente (FAL.ai ou GPT Image 2)
- Pesquisa informações externas (datas, tendências, dados) via web search antes de gerar
- Gera post, legenda e publica — tudo no mesmo lugar
- FAL.ai → resultado editável (template Konva)
- GPT Image 2 → resultado premium não editável, mais pulses

## Arquitetura Alvo (MVP)
- **Uma única tela** — sem abas separadas de Editor, Carrossel, Posts Premium
- **Uma única entrada** — o agente
- **Biblioteca unificada** — posts e carrossel em um só histórico, com opção de reeditar e repostar
- **PWA obrigatório** — experiência mobile é pré-requisito, não opcional
- No mobile: agente gera, usuário edita textos e cores via painel simplificado (sem arrastar elementos no canvas)

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Vercel API Routes (Node.js) — `maxDuration: 60` em rotas de geração de imagem
- Banco: Supabase (auth + storage + postgres)
- IA Imagem: FAL.ai FLUX (posts editáveis) + GPT Image 2 (posts premium)
- IA Texto: Claude Haiku 4.5 via Vercel API Routes
- Deploy: Vercel (plano free — **limitação crítica:** timeout de 55s pode causar falha ocasional em slides do carrossel premium; upgrade para Pro resolve)

---

## Estado Atual dos Módulos

### O que está implementado ✅

| Funcionalidade | Detalhe |
|---|---|
| Agente conversacional | Claude Haiku 4.5; conciso (máx. 2 frases, max_tokens=1500); decide engine (FAL.ai vs GPT Image 2) |
| Web search no agente | Ferramenta web_search_20250305; pesquisa datas, tendências, dados externos antes de gerar |
| Agente consultivo | Classifica briefing vago vs completo (com exemplos); alertas de boas práticas bloqueantes aguardam confirmação antes de gerar |
| Engine premium agressiva | 7 categorias de gatilhos explícitos (pessoa real, produto físico, alimento, ambiente, beleza, lifestyle, palavras-chave como "fotorrealista", "qualidade", "premium"); standard é residual |
| Posts FAL.ai | Templates Konva editáveis; seleção por tema do conteúdo (template nunca travado no último gerado) |
| Posts premium GPT Image 2 | Fotorrealista; formato definido pelo agente; logo sobreposto via canvas |
| Modo edição pós-geração | Após generate() completar, flag `hasGeneratedPost` permite envios subsequentes irem direto para edit mode sem engine choice |
| add_logo em posts premium | Detecção por keyword "logo/logotipo"; aplica `overlayLogoOnImage` em todos os slides via canvas; atualiza `PremiumResultViewer` via `onPremiumSlidesUpdate` |
| Carrossel FAL.ai | Geração via `/api/generate-carousel.js`; publicação LinkedIn com imagens comprimidas |
| Carrossel premium GPT Image 2 | Geração sequencial por slide; texto overlay pela API; retry automático; confirmação com custo |
| Geração de imagem padrão | `api/generate-image-ai.js` usa gpt-image-1 (OpenAI); suporte a `aspectRatio` (1:1, 9:16, 16:9, 4:5); retorna b64_json direto ou faz fetch de URL como fallback |
| Legendas melhoradas | Gancho na 1ª linha, estrutura de salvamento, CTA explícito, hashtags estratégicas por nicho; Instagram ≤2200 chars, LinkedIn ≤3000 chars |
| Download PNG e ZIP | Disponível em todos os fluxos; iOS abre em tela cheia para salvar na galeria via toque longo |
| LinkedIn multi-tenant | OAuth com token salvo no Supabase; post único e carrossel; `urn:li:person:{sub}`; redirect flow no mobile; `saveConnection` usa `await` para evitar race condition |
| Débito de pulses | FAL.ai padrão (4), carrossel (2×slides), premium (8) — implementado nos três fluxos |
| PWA | manifest.webmanifest, service worker (vite-plugin-pwa), ícones do Pulse; instalável |
| Mobile responsivo | Layout adaptado para Chrome e Safari mobile; PropertiesPanel como bottom sheet |
| Touch no canvas | onTap/onDblTap nos nós Konva; seleção de elementos e abertura do painel no mobile |
| Biblioteca unificada | Posts e carrosséis em grid cronológico único em `/library` |
| Brand Kit | Logo, cores, tom de voz; seção "Redes Sociais" com LinkedIn conectado; Instagram marcado **(em breve)** |
| Prompt defensivo FAL.ai | Keywords de pessoas detectadas → instruções anatômicas adicionadas ao prompt automaticamente |
| Debug mode carrossel premium | `VITE_DEBUG_MODE=true` exibe JSON do agente no chat sem gastar pulses |

### Instagram — estado atual
- OAuth implementado tecnicamente (`instagram-auth.js`, `instagram-callback.js`, `instagram-post.js`)
- **Bloqueado para produção:** sem App Review do Meta, funciona apenas com até 25 contas de teste adicionadas manualmente no Developer Portal
- **UX:** botão "Conectar" no BrandPage e "Conectar Instagram" no CarouselPage exibem **(em breve)** em cinza abaixo do botão
- Primeiros clientes: adicionar como Testadores no Meta Developer Portal enquanto aguarda review

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

**Padrão adotado:** cada função vira uma Vercel API Route em `/api/`. A chave `ANTHROPIC_API_KEY` fica exclusivamente no servidor — nunca no bundle do frontend.

**Segurança:** `ANTHROPIC_API_KEY` e `OPENAI_API_KEY` configuradas como variáveis de ambiente no Vercel (sem prefixo `VITE_`).

### Decisão de Engine (agent-chat.js)
O agente retorna `engine: "standard" | "premium"` no JSON:
- `"premium"` → produto físico, prato de comida, imóvel/ambiente, atleta em ação, produto de beleza, pessoa real em situação realista
- `"standard"` → todo o resto: tipográfico, dados, institucional, citações, vagas
- Carrossel → SEMPRE `"standard"`

Quando `engine: "premium"`, o AgentChat exibe confirmação com custo (8 pulses vs 4 padrão) e dois botões: "Confirmar premium" e "Usar padrão".

### Fluxo Premium (GPT Image 2)
1. Agente retorna `engine: "premium"` com `prompt` contendo `SUJEITO: [aparência, ambiente, ação]. OBJETIVO: [tema e rede].`
2. Usuário confirma (8 pulses)
3. `generatePremium()` → `/api/generate-premium.js` com `maxDuration: 60`; AbortController no cliente com timeout de 55s
4. Formato determinado pelo agente (`"9x16"` | `"4x5"` | `"1x1"` | `"16x9"`) — API usa o size correto do GPT Image 2, crop para o ratio exato
5. Logo do brand kit sobreposto via canvas
6. `PremiumResultViewer` exibe o slide único com legenda editável, download e publicação

### Fluxo de Restauração da Biblioteca (pendingPost)
1. `PostLibraryPage.handleOpen` → `useStore.getState().setPendingPost(post)` → `navigate('/')`
2. EditorPage monta → `pendingPost` useEffect dispara
3. `template_id` do post é normalizado (lowercase + trim + hífens) para match no `templateRegistry`
4. `variants = def.getVariants(theme)` — todas as variantes do template
5. `target = variants.find(v => v.id === pendingPost.template_id) ?? variants[0]` — tenta match exato com sufixo antes de cair em 1x1
6. Textos e accent_color aplicados em todas as variantes
7. `thumbnail_url` salva é usada como background (sem chamar FAL.ai). Só gera nova imagem se `thumbnail_url` for nulo e `image_prompt` existir

**Campos do PostRecord:** `{ id, template_id, texts, accent_color, image_prompt, thumbnail_url, created_at }`
**template_id salvo:** `activeTemplateId` completo com sufixo (ex: `tech-statement-9x16`)

---

## Roadmap — Próximos Itens (ordem de prioridade)

### 1. Testes em fluxo completo mobile 🔜
- Download nativo iOS (toque longo para salvar na galeria) — implementado, não testado em dispositivo real
- LinkedIn OAuth no mobile (redirect flow) — implementado, não testado em dispositivo real
- Edição de elementos no canvas via toque (onTap/onDblTap) — implementado, não testado
- PropertiesPanel como bottom sheet — implementado, verificar usabilidade real

### 2. Instagram OAuth multi-tenant 🔜 *(bloqueador para escalar)*
- Sem App Review do Meta: OAuth funciona apenas com até **25 contas de teste**
- Permissões necessárias: `instagram_business_basic` + `instagram_business_content_publish` (Advanced Access)
- O que preparar: screencast em inglês mostrando o fluxo completo (Conectar → Publicar), política de privacidade pública, descrição de uso
- Tempo estimado: 2–4 semanas (1–5 dias úteis de revisão + possíveis rejeições)
- Enquanto isso: adicionar primeiros clientes como Testadores no Developer Portal

### 3. Landing page de vendas 🔜
- Página pública com proposta de valor, demo/GIF do agente em ação, planos e preços
- CTA para cadastro (SaaS) e formulário de contato (white-label)
- Pode ser subdomínio Vercel separado ou rota `/lp` no mesmo projeto

### 4. Integração Stripe 🔜
- Pagamento recorrente R$47/mês (plano SaaS)
- Compra de pacotes de pulses adicionais (ex: +100 pulses por R$19)
- Webhook Stripe → Supabase (crédito automático de pulses)
- Portal do cliente para gerenciar assinatura
- Enquanto isso: onboarding manual (Pix + adição manual no Supabase)

### 5. Redesign do painel de edição direito 🔜
- PropertiesPanel atual tem UX plana e sem hierarquia visual
- Inspiração: Figma, Framer, Canva — grupos colapsáveis, controles inline, feedback visual imediato
- Não bloqueia vendas mas impacta percepção de qualidade
- Escopo: componente inteiramente reescrito em sessão dedicada

### 6. Agente editor de posts existentes 🔜
- Usuário abre post da biblioteca e pede ajustes via chat ("muda proporção para 9x16", "troca cor de destaque para verde")
- Similar ao Magic Resize do Canva, mas conversacional
- Requer: contexto do post carregado no prompt do agente, ações de edição mapeadas (resize, recolor, rewrite field), integração com Zustand store

### 7. Upgrade Vercel Pro 🔜
- Plano free limita funções serverless a 60s; cliente adiciona 5s de margem (55s)
- Slides com imagens complexas podem ultrapassar 55s → falha ocasional no carrossel premium
- Vercel Pro ($20/mês) eleva `maxDuration` para até 300s — elimina o problema
- Ação: fazer upgrade ao fechar o primeiro cliente pago; ROI imediato

---

## Pendentes Técnicos

### Críticos (afetam UX em produção)

- **Canvas gpt-image-1 não abre para edição ao clicar** — após geração padrão, clicar no canvas não ativa modo de edição; investigar fluxo de clique no EditorPage
- **Logo sai do design ao redimensionar** — ao trocar de formato (1x1 → 9x16 etc.) o logo some ou perde posição; o resize action precisa preservar a posição/escala do logo junto com os demais elementos
- **Modo edição após generatePremium** — `hasGeneratedPost` flag só é setado em `generate()` (FAL.ai), não em `generatePremium()`; usuário não consegue editar logo via chat se a geração foi premium
- **remove_logo em posts premium** — `add_logo` foi implementado; `remove_logo` ainda não (premium não tem estado intermediário sem logo)
- **Overlay automático de logo no premium** — verificar se o overlay automático de logo durante `generatePremium()` ainda está ativo (pode estar duplicando com o add_logo manual)
- **Perguntas excessivas do agente** — agente às vezes faz mais de 2 rodadas de perguntas antes de gerar; limitar a máx. 2 rodadas de clarificação antes de gerar com o que tem

### Não-críticos

- **`generatePremiumCaption`** — ainda chama Gemini direto do frontend; migrar para API Route
- **Logs de debug temporários** — remover `console.log` do AgentChat, agent-chat.js e EditorPage após estabilização
- **`CarouselPage.tsx` e `PremiumPage.tsx` antigas** — remover do projeto (rotas `/carousel` e `/premium` ainda existem no App.tsx)
- **Logo sobrepõe texto no PremiumResultViewer** — posição fixa, sem drag
- **Onboarding obrigatório** — primeiro acesso deveria forçar configuração do brand kit antes de qualquer geração

---

## Templates
Mantém os existentes para o MVP. Não investir em novos agora — energia melhor gasta no agente. Com GPT Image 2, templates se tornam menos relevantes no longo prazo.

**Regra para novos templates — sempre registrar em 3 lugares:**
1. `TEMPLATE_FIELDS` em `api/generate-post.js` e `api/generate-carousel.js`
2. Seção TEMPLATES DISPONÍVEIS no prompt (descrição + Campos)
3. Regras de seleção no prompt (quando usar)

**Categorias atuais:** Sport, Food, Business, Health, Construction, Realty, Fashion, Tech, Home & Deco, Outros

**Regra de seleção:** template é escolhido pelo TEMA DO CONTEÚDO do post, não pelo segmento da empresa. Templates `tech-*` são exclusivos para posts cujo assunto seja tecnologia, IA ou digital.

**Templates no registry (`src/templates/index.ts`):** tech-statement, editorial-card, tech-product, tech-minimal, food-promo, tech-news, sport-arena, business-statement, business-card, e outros. NÃO existem neste repo: hero-title, big-statement, big-number (são templates do app Pulse principal, não do pulse-starter).

---

## Arquivos Principais
- `src/components/AgentChat.tsx` — agente conversacional; decide engine; fluxo premium e standard; débito de pulses nos três fluxos; salva `activeTemplateId` completo (com sufixo) ao persistir post
- `src/components/PremiumResultViewer.tsx` — exibe resultado do GPT Image 2 (fora do Konva)
- `src/components/CarouselViewer.tsx` — carrossel integrado ao Editor; publicação LinkedIn com imagens comprimidas
- `src/components/CaptionPanel.tsx` — legenda + publicação LinkedIn/Instagram para posts Konva; lê token do Supabase via `socialConnections.ts`
- `src/engine/CanvasEngine.tsx` — Konva stage; onTap/onDblTap para seleção no mobile; snap to center; drag de fundo
- `src/export/exportUtils.ts` — exportToPng/Jpeg; download via blob URL; iOS: abre em nova aba para salvar via toque longo
- `src/pages/LinkedInCallbackPage.tsx` — callback OAuth do LinkedIn; detecta redirect flow (mobile) vs popup (desktop)
- `src/pages/BrandPage.tsx` — brand kit + redes sociais; LinkedIn: redirect no mobile, popup no desktop; lê token pendente do localStorage
- `src/pages/CarouselPage.tsx` — CarouselPage standalone; botão "Conectar Instagram" com aviso "(em breve)"
- `src/pages/LibraryPage.tsx` — biblioteca unificada de posts e carrosséis em grid cronológico
- `src/pages/EditorPage.tsx` — tela principal; renderiza PremiumResultViewer > CarouselViewer > KonvaCanvas; pendingPost restore com match exato de variante
- `src/services/socialConnections.ts` — get/save/remove por `user_email` na tabela `social_connections`
- `src/services/gemini.ts` — thin wrappers HTTP para as API Routes (renomear para claude.ts futuramente)
- `src/services/tokens.ts` — PULSE_COSTS, debitToken, notifyBalanceUpdate
- `api/agent-chat.js` — prompt do agente + Claude Haiku + web search (callAnthropicWithWebSearch, loop agentico, web_search_20250305)
- `api/generate-post.js` — seleção de template por tema (não segmento) + geração de campos; Claude Haiku
- `api/generate-carousel.js` — geração de slides de carrossel + legendas melhoradas (gancho, salvamento, CTA, hashtags por nicho); Claude Haiku
- `api/generate-premium.js` — chama GPT Image 2; `maxDuration: 60`
- `api/generate-image-ai.js` — FAL.ai FLUX; prompt defensivo anatômico quando descreve pessoas
- `api/linkedin-auth.js` — inicia OAuth LinkedIn
- `api/linkedin-callback.js` — troca código por token; redireciona para `/auth/linkedin/done`
- `api/linkedin-post.js` — publica no LinkedIn; suporta imagem única e carrossel; usa `urn:li:person:${linkedinSub}`
- `api/instagram-auth.js` — inicia OAuth Instagram (www.instagram.com/oauth/authorize)
- `api/instagram-callback.js` — dual-purpose: GET com `?code=` faz o OAuth; POST com `{ accessToken }` faz refresh lazy
- `api/instagram-post.js` — publica no Instagram; recebe `accessToken` + `igUserId` do body
- `vercel.json` — rewrites: `/api/*`, `/auth/linkedin/callback` → servidor, `/auth/linkedin/done` e `/auth/instagram/done` → index.html, `/*` → index.html
- `src/templates/index.ts` — registry de templates
- `src/state/useStore.ts` — Zustand v5 + persist; `activeTemplateId` NÃO é persistido; `pendingPost` É persistido; versão 3

---

## Funções Vercel (12 — dentro do limite free)
| Arquivo | Função |
|---|---|
| `api/agent-chat.js` | Agente conversacional (Claude Haiku + web search) |
| `api/generate-post.js` | Geração de post padrão (Claude Haiku) |
| `api/generate-carousel.js` | Geração de carrossel + legendas (Claude Haiku) |
| `api/generate-premium.js` | Post premium (GPT Image 2) |
| `api/generate-image-ai.js` | Geração de imagem FAL.ai FLUX |
| `api/edit-image-ai.js` | Edição de imagem com IA |
| `api/instagram-auth.js` | Inicia OAuth Instagram |
| `api/instagram-callback.js` | OAuth callback + refresh lazy (dual-purpose) |
| `api/instagram-post.js` | Publicação no Instagram |
| `api/linkedin-auth.js` | Inicia OAuth LinkedIn |
| `api/linkedin-callback.js` | OAuth callback LinkedIn |
| `api/linkedin-post.js` | Publicação no LinkedIn |

---

## Custos de API (referência)
- Claude Haiku 4.5: $1/$5 por milhão de tokens input/output
- FAL.ai FLUX: ~$0.003 por imagem
- GPT Image 2: ~$0.04 por imagem (medium quality)
- Custo total por geração FAL.ai: ~R$0,03
- Custo total por geração Premium: ~R$0,23
- Margem no plano R$47/100 pulses: saudável em ambos os casos

---

## PWA — Estado Atual
- ✅ manifest.webmanifest com nome, ícone, cores da marca
- ✅ Service Worker (vite-plugin-pwa v1.3.0, generateSW mode)
- ✅ Ícones gerados a partir do logo-pulse.svg
- ✅ Service worker configurado para excluir rotas `/api/*` e `/auth/*` do NavigationRoute
- ✅ Layout responsivo funcional — Chrome e Safari mobile
- ✅ Touch no canvas Konva (onTap/onDblTap)
- ✅ PropertiesPanel como bottom sheet no mobile
- ✅ Download nativo iOS via blob URL (toque longo → salvar na galeria)
- 🔜 Teste em dispositivo real para validar fluxo completo mobile

---

## Histórico de Bugs Corrigidos (referência)
1. **Clicar fora do canvas reiniciava o post** → `onClick` no `canvas-area` trocado de `setActiveTemplate('')` para `setSelectedElement(null)`
2. **Post da biblioteca não carregava no canvas** → `template_id` normalizado no lookup (EditorPage) e na gravação (AgentChat)
3. **Restauração gerava nova imagem consumindo pulses** → `pendingPost` useEffect usa `thumbnail_url` salva; só chama `generateImage()` se `thumbnail_url` for nulo
4. **Proporção sempre voltava como 1x1** → AgentChat salva `activeTemplateId` completo (ex: `tech-statement-9x16`); EditorPage usa `variants.find(v => v.id === pendingPost.template_id)` antes de cair em `variants[0]`
5. **Text overlays ausentes no carrossel premium** → instruções GPT Image 2 corrigidas para incluir título e corpo por slide
6. **Parâmetro de tamanho inválido no GPT Image 2** → corrigido em `generate-premium.js`
7. **URL OAuth do Instagram incorreta** → corrigido de `api.instagram.com` para `www.instagram.com/oauth/authorize`
8. **LinkedIn publicava como organização** → corrigido de org ID hardcoded para `urn:li:person:${linkedinSub}`
9. **Download não funcionava no iOS** → dataURL convertido para blob URL; iOS abre em nova aba para salvar via toque longo
10. **LinkedIn OAuth travava no mobile** → redirect flow (window.location.href) no mobile em vez de popup; callback detecta ausência de window.opener e redireciona para /brand
11. **Canvas não respondia ao toque** → onTap/onDblTap adicionados em todos os nós Konva (Stage, Text, Group, Shape)
12. **Alucinações anatômicas no FAL.ai** → prompt defensivo automático quando keywords de pessoas detectadas no prompt
13. **Textarea perdia foco após enviar mensagem** → removido `disabled={isDisabled}` do `<textarea>`; `handleSend` já guardava contra envios vazios/em loading
14. **Modo edição não ativava após gerar com gpt-image-1** → flag local `hasGeneratedPost` setada após `generate()` completar; `handleSend` reconstrói `effectiveActivePost` do store quando a flag está ativa e `activePost` prop ainda é null, chamando `onActivateEditMode()` para sincronizar EditorPage
15. **Template sempre repetia o último gerado** → `activeTemplateBase` era sempre passado como `forcedTemplate` para `generate-post.js`; corrigido para só passar quando `activeBase !== lastUsedTemplateRef.current` (usuário explicitamente selecionou outro template)
16. **add_logo bloqueado em posts premium** → bloco `isPremiumActive` agora detecta pedidos de logo por keyword; aplica `overlayLogoOnImage` em todos os slides via `Promise.all` e chama `onPremiumSlidesUpdate` para atualizar o `PremiumResultViewer`
