# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Vercel API Routes (Node.js)
- Banco: Supabase (auth + storage + postgres)
- IA Imagem: GPT Image 2 (OpenAI) para Posts Premium, FAL.ai FLUX para Editor Konva
- IA Texto: Gemini 2.5 Flash (legendas, turbo prompt, análise, agente conversacional)
- Deploy: Vercel (plano free — limite de 10s por função serverless)
- Problema conhecido: Vercel usa cache de build — usar "Redeploy sem cache" quando templates novos não aparecerem

## Visão de Arquitetura (MVP atual → produto maduro)

### Hoje
Três módulos separados: Editor (FAL.ai + Konva), Posts Premium (GPT Image 2), Carrossel (engine antiga — sobrando).

### Visão futura
Uma única entrada: o agente. O usuário conversa, o agente decide internamente:
- Posts rápidos e editáveis → FAL.ai + Konva (Editor atual)
- Imagens de alta qualidade fotorrealista → GPT Image 2 (não editável, mais pulses)
- Carrossel → múltiplos slides Konva via CarouselViewer

O usuário nunca escolhe a engine. O agente escolhe e avisa sobre custo em pulses quando necessário. A diferença de engine vira diferença de pulses, não de módulo.

**Por que as duas engines existem:**
- FAL.ai FLUX: fundo da imagem apenas — os elementos editáveis (textos, shapes, logo) são o template Konva renderizado em cima. Resultado rápido e editável.
- GPT Image 2: imagem rasterizada completa — sem camadas, sem edição posterior. Mais fotorrealista mas não editável.

**CarouselPage (aba Carrossel):** sobrando — o carrossel agora vive dentro do Editor via CarouselViewer. Remover em próxima sessão de reestruturação.

## Módulos Atuais

### Editor Konva — Agente Conversacional
- Componente `AgentChat.tsx` — recolhe automaticamente após gerar
- Nome: "Agente de Design Pulse"
- Microfone (Web Speech API) integrado
- Botão "Nova conversa" reseta e expande o chat
- Função `agentChat` no `gemini.ts` — máximo 2 rodadas de perguntas antes de gerar
- Brand kit lido automaticamente
- Formatos: Stories→9x16, LinkedIn→1x1, feed Instagram→4x5, banner→16x9
- Se usuário selecionar template no Sidebar, agente respeita e usa esse template
- Editor começa sem template selecionado — clique fora deseleciona
- Agente detecta intenção de carrossel por palavras explícitas ("carrossel", "slides")
- agentChat: maxOutputTokens 600, thinkingBudget 512, fallback flash-lite na 3ª tentativa

### Editor Konva — Carrossel
- Geração via `generateCarouselContent` com textos mapeados para o template ativo
- Fallback para `editorial-card` quando nenhum template selecionado
- Imagens geradas em paralelo via FAL.ai
- Slides renderizados com `CanvasEngine` (editáveis)
- Logo do brand kit aplicado em todos os slides
- Navegação entre slides com setas e miniaturas
- Download ZIP de todos os slides
- Botões de publicação LinkedIn e Instagram
- Componente: `CarouselViewer.tsx`

### Editor Konva — Templates
**Regra para novos templates — sempre registrar em 3 lugares no gemini.ts:**
1. `TEMPLATE_FIELDS` — objeto no topo com os campos
2. Seção "TEMPLATES DISPONÍVEIS" no `buildPrompt` — descrição + `Campos:`
3. Regras de seleção no `buildPrompt` — quando usar

**Sport:** sport-arena, sport-brand
**Food:** food-editorial, food-promo, food-vertical
**Business:** business-statement, business-card, job-glass (Vitrine de Vaga), hero-gradient (Palco de Marca), toggle-card (Card Reveal), infographic-ring (Infográfico Anel)
**Health:** health-content, health-stats, health-split (Saúde em Foco)
**Construction:** build-impact, build-editorial
**Realty:** realty-premium, realty-launch, realty-keys (Chave na Mão)
**Fashion:** fashion-editorial, fashion-drop
**Tech:** tech-statement, tech-news, tech-product, tech-minimal
**Home & Deco:** home-split (Painel Duplo), product-arch (Vitrine Minimalista)
**Outros:** bold-circle, editorial-cover, split-editorial, geo-impact, editorial-card

### ExportPanel
- Botão único azul "Baixar" — exporta PNG 2x

### Tema Claro/Escuro
- Toggle na Topbar (ícone sol/lua)
- Topbar sempre escura
- Canvas-area no tema claro usa fundo #e8eaf0

### Posts Premium
- Post único: 1 imagem 1024x1536 cropada para 3 formatos: 9:16, 4:5, 1:1
- Carrossel: 3-7 slides 4:5
- Débito real de pulses implementado
- Pendente: testar (requer crédito OpenAI — saldo zerado)

### Publicação
- LinkedIn: OAuth conectado
- Instagram: pendente — aceitar convite Testador no app para `agente17ia` e `tdaprod`

### Sistema de Pulses
- Tabela `user_tokens` no Supabase
- Débito implementado no Posts Premium
- Pendente: verificar débito no Editor Konva

## Arquivos Principais
- `src/components/AgentChat.tsx` — agente conversacional, recolhível após geração
- `src/components/CarouselViewer.tsx` — visualizador e editor de carrossel
- `src/services/gemini.ts` — agentChat, generateCarouselContent, buildPrompt, TEMPLATE_FIELDS
- `src/components/PropertiesPanel.tsx` — edição inline de elementos
- `src/components/ExportPanel.tsx` — botão Baixar simplificado
- `src/components/Sidebar.tsx` — categorias de templates
- `src/components/LogoSection.tsx` — gestão do logotipo (pendente reposicionamento)
- `src/pages/EditorPage.tsx` — layout principal
- `src/pages/CarouselPage.tsx` — módulo antigo, a remover
- `src/templates/index.ts` — registry de todos os templates
- `api/generate-premium.js` — geração GPT Image 2
- `src/pages/PremiumPage.tsx` — Posts Premium

## Roadmap MVP

### Crítico para vender
1. Agente estável — sem 503, sem confundir post/carrossel
2. Canvas maior e editável com clareza — AgentChat recolhível já implementado
3. Agente mais inteligente — especialista em design e redes sociais, orienta boas práticas
4. LinkedIn publicando corretamente — testar end-to-end
5. Onboarding mínimo — usuário entender o que fazer sem explicação

### Importante
6. Remover CarouselPage (aba Carrossel sobrando)
7. Reposicionar LogoSection no painel direito
8. Verificar débito de pulses no Editor Konva
9. Aceitar convite Testador Instagram
10. Recarregar saldo OpenAI e testar Posts Premium
11. Remover log de debug do agentChat

### Visão futura
12. Unificar Editor e Posts Premium em uma única entrada via agente
13. Agente decide engine (FAL.ai vs GPT Image 2) baseado no briefing
14. Pagamento de pulses
15. Calendário editorial e histórico de posts
16. Mais templates por segmento

## Modelo de Negócio
White-label para clientes: ~R$2.500–4.000 setup + retainer mensal. Pulses como camada de monetização.

## Créditos e Limites
- OpenAI GPT Image 2: saldo zerado — recarregar antes de testar Premium
- Vercel free: 10s por função serverless
- GitHub token: renovado sem expiração
