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

## Módulos

### Editor Konva — Agente Conversacional
- Componente `AgentChat.tsx` posicionado fixo no topo do canvas
- Nome: "Agente de Design Pulse"
- Microfone (Web Speech API) integrado
- Botão "Nova conversa" com ícone de reset
- Função `agentChat` no `gemini.ts` — máximo 2 rodadas de perguntas antes de gerar
- Brand kit lido automaticamente
- Formatos por rede social: Stories→9x16, LinkedIn→1x1, feed Instagram→4x5, banner→16x9
- Se usuário selecionar um template no Sidebar antes de conversar, o agente respeita e usa esse template obrigatoriamente
- Mini previews removidos — canvas mostra apenas o formato ativo

### Editor Konva — Templates
Templates registrados no `templateRegistry`, `Sidebar.tsx` e `gemini.ts` (3 lugares obrigatórios).

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
- Botão único azul "Baixar" — exporta PNG 2×
- Botão secundário removido

### Tema Claro/Escuro
- Toggle na Topbar (ícone sol/lua)
- Topbar sempre escura
- Canvas-area no tema claro usa fundo #e8eaf0 (sem estrelas)

### Posts Premium
- Post único: 1 imagem 1024x1536 cropada para 3 formatos: 9:16, 4:5, 1:1
- Carrossel: 3-7 slides 4:5, headlines ultra-curtos (4 palavras)
- Débito real de pulses implementado
- Pendente: testar carrossel (requer crédito OpenAI — saldo zerado)

### Publicação
- LinkedIn: OAuth conectado
- Instagram: pendente — aceitar convite Testador no app Instagram para `agente17ia` e `tdaprod`

### Sistema de Pulses
- Tabela `user_tokens` no Supabase
- Débito implementado no Posts Premium
- Pendente: verificar débito no Editor Konva

## Arquivos Principais
- `src/components/AgentChat.tsx` — agente conversacional principal
- `src/services/gemini.ts` — agentChat, turboPromptEditor, generatePostContent, buildPrompt, TEMPLATE_FIELDS
- `src/components/PropertiesPanel.tsx` — edição inline de elementos
- `src/components/ExportPanel.tsx` — botão Baixar simplificado
- `src/components/Sidebar.tsx` — categorias: Sport, Food, Business, Health, Construction, Realty, Fashion, Tech, Home & Deco, Outros
- `src/components/LogoSection.tsx` — gestão do logotipo (pendente reposicionamento)
- `src/pages/EditorPage.tsx` — layout principal com AgentChat + canvas
- `src/templates/index.ts` — registry de todos os templates
- `api/generate-premium.js` — geração GPT Image 2
- `src/pages/PremiumPage.tsx` — Posts Premium

## Roadmap — Próximas Sessões
1. PRIORIDADE — Padronizar experiência dos módulos: Editor e Premium com mesmo conceito de AgentChat (post ou carrossel)
2. Carrossel do Editor usando todos os templates disponíveis (não só os 4 atuais)
3. Recarregar saldo OpenAI para testar carrossel Premium
4. Verificar e implementar débito de pulses no Editor Konva
5. Reposicionar LogoSection para área mais acessível no painel direito
6. Aceitar convite Testador Instagram para `agente17ia` e `tdaprod`

## Modelo de Negócio
White-label para clientes: ~R$2.500–4.000 setup + retainer mensal. Pulses como camada de monetização.

## Créditos e Limites
- OpenAI GPT Image 2: saldo zerado — recarregar antes de testar Premium
- Vercel free: 10s por função serverless
- GitHub token: renovado sem expiração
