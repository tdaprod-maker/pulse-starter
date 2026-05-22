# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Modelo de Negócio
- White-label: ~R$2.500–4.000 setup + retainer mensal
- SaaS: R$47/mês com 50-100 pulses incluídos + compra de pulses adicionais
- Pulses: post FAL.ai = 4 pulses, slide carrossel = 2 pulses, post Premium = 8 pulses
- Margem de API é saudável — custo real por geração é centavos

## Visão do Produto
**O agente é o produto.** O Pulse não é uma ferramenta de design — é um designer de bolso com IA. O usuário conversa com o agente, que instrui, orienta e executa. O agente:
- Conhece boas práticas de design e redes sociais
- Orienta antes de gerar ("posts educativos performam 3x mais no LinkedIn")
- Decide a engine internamente (FAL.ai ou GPT Image 2)
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
- IA Texto: Claude Haiku 4.5 via Vercel API Routes — migração do Gemini concluída para as funções principais
- Deploy: Vercel (plano free — `maxDuration: 60` adicionado em `/api/generate-premium.js`)

## Roadmap por Semanas

### Semana 1 — Fundação ✅ Concluída
1. **Trocar Gemini por Claude Haiku 4.5** — agentChat, generatePostContent, generateCarouselContent migrados
2. **Unificar telas** — abas Carrossel e Posts Premium removidas do menu; tudo dentro do Editor
3. **Estrutura PWA básica** — manifest.webmanifest, service worker (vite-plugin-pwa), ícones do Pulse

### Semana 2 — O Agente Designer ✅ Concluída
4. **Agente mais inteligente** — orienta boas práticas antes de gerar (LinkedIn promocional, Stories com texto, carrossel grande)
5. **Agente decide a engine** — FAL.ai vs GPT Image 2 baseado no briefing; usuário vê custo e confirma antes de gerar
6. **PremiumResultViewer** — resultado premium exibido diretamente como imagem (não via Konva); formato único definido pelo agente; download, legenda editável, publicação LinkedIn/Instagram

### Semana 3 — Mobile e Polimento 🔜 Próxima
7. **Layout responsivo** — Editor adaptado para mobile
8. **Touch no canvas Konva** — suporte a gestos touch
9. **Painel simplificado mobile** — edição de texto e cores sem arrastar elementos
10. **Onboarding** — primeiro acesso força configuração do brand kit antes de gerar

### Semana 4 — Validação
11. **Biblioteca unificada** — posts e carrossel em histórico único com reedição
12. **Teste end-to-end com usuário real** — observar onde trava
13. **Primeiro cliente pago**

## Estado Atual dos Módulos

### O que está funcionando
- Editor com agente conversacional (AgentChat recolhível após geração)
- Geração de posts via FAL.ai com templates Konva editáveis
- Carrossel via CarouselViewer (dentro do Editor) — ver pendentes
- Brand kit automático (logo, cores, tom de voz)
- Publicação LinkedIn (OAuth implementado — ver pendentes críticos abaixo)
- Download PNG e ZIP
- Sistema de pulses (débito implementado no fluxo Premium — 8 pulses)
- Templates organizados por categoria no Sidebar
- PWA básico instalável (manifest + service worker + ícones do Pulse)
- Agente decide engine (standard FAL.ai vs premium GPT Image 2)
- PremiumResultViewer: imagem fotorrealista em formato único (formato definido pelo agente), download, legenda editável, publicação

### Migração Gemini → Claude Haiku 4.5
| Função | Rota Vercel | Status |
|---|---|---|
| `agentChat` | `/api/agent-chat.js` | ✅ Migrado |
| `generatePostContent` | `/api/generate-post.js` | ✅ Migrado |
| `generateCarouselContent` | `/api/generate-carousel.js` | ✅ Migrado |
| `turboPrompt` / `turboPromptEditor` | — | 🔜 Pendente |
| `generatePremiumCaption` | — | 🔜 Pendente (ainda usa Gemini direto do frontend) |
| `breakCarouselIntoSlides` | — | 🔜 Pendente |
| `analyzeVisualReferences` | — | 🔜 Pendente (multimodal) |

**Padrão adotado:** cada função vira uma Vercel API Route em `/api/`. A chave `ANTHROPIC_API_KEY` fica exclusivamente no servidor — nunca no bundle do frontend. O `gemini.ts` vira thin wrapper de clientes HTTP.

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

---

## Pendentes Críticos (bloqueia vendas)

### 1. LinkedIn OAuth quebrado
- **Sintoma:** popup do OAuth redireciona para a tela de login do Pulse em vez de fechar e autorizar
- **Causa raiz investigada:** três problemas identificados e parcialmente corrigidos:
  - `CaptionPanel` (único leitor do token da URL) só renderiza quando há template ativo → token nunca salvo no popup
  - Nenhum `postMessage` do popup para a janela pai
  - Auth check (`checkAndRoute`) rodando no popup antes de ler o token
- **O que foi implementado:** `LinkedInCallbackPage` em `/auth/linkedin/done`, early return no `App.tsx`, redirect corrigido em `linkedin-callback.js`, `postMessage` + `message` listener nos componentes — mas **ainda não confirmado funcionando em produção**
- **Próximo passo:** testar em produção após deploy; se ainda falhar, investigar se o Supabase session no popup está bloqueando

### 2. Publicação multi-tenant (LinkedIn e Instagram)
- **Problema:** token LinkedIn salvo no `localStorage` (por browser, não por usuário) — em white-label ou multi-usuário, tokens se misturam
- **Problema:** Instagram com `igUserId` hardcoded `'17841479034844249'` (ID da agente17ia) — publica sempre na mesma conta
- **Solução necessária:** salvar tokens OAuth no Supabase por `user_id`; buscar token do usuário logado na hora da publicação
- **Impacto:** bloqueia qualquer cliente diferente da agente17ia de publicar

### 3. Logo sobrepõe texto no PremiumResultViewer
- Logo aplicado via canvas no canto inferior direito — posição fixa, sem possibilidade de mover
- Em alguns posts o logo fica sobre texto ou elemento importante da imagem
- **Solução necessária:** logo posicionável pelo usuário (drag ou seletor de posição: 4 cantos)

### 4. Carrossel FAL.ai não mostra todos os slides
- Alguns slides do carrossel não renderizam corretamente no CarouselViewer
- Investigação pendente — pode ser problema de timing no carregamento dos templates Konva

### 5. Débito de pulses no fluxo FAL.ai (Editor standard)
- O `debitToken` não está sendo chamado no fluxo `generate()` standard do AgentChat
- Premium debita corretamente (8 pulses), mas posts FAL.ai e carrosséis não debitam
- **Localização:** `AgentChat.tsx` → função `generate()` e `generateCarousel()`

---

## Pendentes Não-Críticos (Semana 3+)

- **Layout mobile responsivo** — Editor adaptado para mobile, touch no canvas Konva, painel simplificado
- **Biblioteca unificada** — posts e carrossel em histórico único com reedição (hoje são listas separadas)
- **Reabrir post da biblioteca no editor** — clicar em post salvo reabre no Editor com todos os campos
- **Onboarding obrigatório** — primeiro acesso força configuração do brand kit antes de qualquer geração
- **Logs de debug temporários** — remover `console.log` do AgentChat após estabilização
- **`generatePremiumCaption`** — ainda chama Gemini direto do frontend; migrar para API Route
- **`CarouselPage.tsx` e `PremiumPage.tsx` antigas** — remover do projeto (rotas `/carousel` e `/premium` ainda existem no App.tsx)
- Instagram: aceitar convite Testador para agente17ia e tdaprod (acesso à API)

---

## Templates
Mantém os existentes para o MVP. Não investir em novos agora — energia melhor gasta no agente. Com GPT Image 2, templates se tornam menos relevantes no longo prazo.

**Regra para novos templates — sempre registrar em 3 lugares:**
1. `TEMPLATE_FIELDS` em `api/generate-post.js` e `api/generate-carousel.js`
2. Seção TEMPLATES DISPONÍVEIS no prompt (descrição + Campos)
3. Regras de seleção no prompt (quando usar)

**Categorias atuais:** Sport, Food, Business, Health, Construction, Realty, Fashion, Tech, Home & Deco, Outros

## Arquivos Principais
- `src/components/AgentChat.tsx` — agente conversacional; decide engine; fluxo premium e standard
- `src/components/PremiumResultViewer.tsx` — exibe resultado do GPT Image 2 (fora do Konva)
- `src/components/CarouselViewer.tsx` — carrossel integrado ao Editor
- `src/components/CaptionPanel.tsx` — legenda + publicação LinkedIn/Instagram para posts Konva
- `src/pages/LinkedInCallbackPage.tsx` — callback OAuth do LinkedIn (popup); postMessage + fecha
- `src/services/gemini.ts` — thin wrappers HTTP para as API Routes (renomear para claude.ts futuramente)
- `src/pages/EditorPage.tsx` — tela principal; renderiza PremiumResultViewer > CarouselViewer > KonvaCanvas
- `api/agent-chat.js` — prompt do agente + Claude Haiku; decide engine e formato
- `api/generate-post.js` — seleção de template + geração de campos; Claude Haiku
- `api/generate-carousel.js` — geração de slides de carrossel; Claude Haiku
- `api/generate-premium.js` — chama GPT Image 2; `maxDuration: 60`
- `api/linkedin-auth.js` — inicia OAuth LinkedIn (redirect_uri: pulse-ashy-eight.vercel.app)
- `api/linkedin-callback.js` — troca código por token; redireciona para `/auth/linkedin/done`
- `vercel.json` — rewrites: `/api/*`, `/auth/linkedin/callback` → servidor, `/auth/linkedin/done` → index.html, `/*` → index.html
- `src/templates/index.ts` — registry de templates

## Custos de API (referência)
- Claude Haiku 4.5: $1/$5 por milhão de tokens input/output
- FAL.ai FLUX: ~$0.003 por imagem
- GPT Image 2: ~$0.04 por imagem (medium quality)
- Custo total por geração FAL.ai: ~R$0,03
- Custo total por geração Premium: ~R$0,23
- Margem no plano R$47/100 pulses: saudável em ambos os casos

## PWA — Estado Atual
- ✅ manifest.webmanifest com nome, ícone, cores da marca
- ✅ Service Worker (vite-plugin-pwa v1.3.0, generateSW mode)
- ✅ Ícones gerados a partir do logo-pulse.svg: pwa-512x512.png, pwa-192x192.png, apple-touch-icon.png, favicon-32x32.png
- 🔜 Layout responsivo (mobile-first no Editor) — Semana 3
- 🔜 Touch support no canvas Konva — Semana 3
- 🔜 Painel de edição simplificado para mobile — Semana 3
