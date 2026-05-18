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

## Módulos

### Editor Konva — Agente Conversacional
- Novo componente `AgentChat` (`src/components/AgentChat.tsx`) posicionado no topo do canvas
- Layout: AgentChat fixo no topo + área do canvas scrollável abaixo
- Função `agentChat` no `gemini.ts` — orquestra conversa, decide quando tem info suficiente para gerar
- Fluxo: usuário digita intenção → agente faz máximo 2 perguntas → gera via `generatePostContent` + FAL.ai
- Brand kit já é lido automaticamente pelo agente (não pergunta o que já sabe)
- AIPanel antigo removido do sidebar
- **Status:** implementado mas layout ainda precisa de ajuste fino — AgentChat pode estar sendo empurrado pelo canvas

### Editor Konva — Templates e Edição
- Templates: hero-title, big-statement, editorial-card, big-number, food-promo, food-editorial, tech-news, sport-arena, business-statement, business-card, tech-statement, tech-product, tech-minimal
- Sidebar redesenhado: edição inline ao clicar no elemento (texto e shapes)
- Estado vazio com instrução "Clique em um elemento no canvas para editar"
- LogoSection redesenhada mas ainda posicionada no fundo do ImagePanel
- ExportPanel abaixo das miniaturas no main
- imagePrompt otimizado para FAL.ai FLUX com estrutura precisa

### Posts Premium
- **Post único:** 1 imagem 1024x1536 cropada para 3 formatos: 9:16, 4:5, 1:1
- Logo aplicado após crop
- **Carrossel:** 3-7 slides 4:5, headlines ultra-curtos (4 palavras) via Gemini, cenas visuais rotativas, CTA no último slide
- Legenda automática após geração
- Débito real de pulses implementado
- **Pendente:** testar carrossel com headlines curtos (requer crédito OpenAI)

### Biblioteca de Carrosseis
- Modal de visualização ao clicar no card Premium: slides, legenda, download individual e "Baixar todos"
- Botão "Recarregar" oculto para premium-carousel

### Sistema de Pulses
- Tabela `user_tokens` no Supabase
- Débito implementado no Posts Premium
- Topbar mostra saldo em tempo real

### Publicação
- LinkedIn: OAuth conectado
- Instagram: pendente — aceitar convite Testador no app Instagram para `agente17ia` e `tdaprod`

### Topbar
- Logo Pulse + "por Agente 17" ao lado
- Nav central com 5 itens
- Saldo de pulses à direita

## Arquivos Principais
- `src/components/AgentChat.tsx` — agente conversacional principal
- `src/services/gemini.ts` — agentChat, turboPromptEditor, generatePostContent, breakCarouselIntoSlides
- `src/components/PropertiesPanel.tsx` — edição inline de elementos
- `src/components/LogoSection.tsx` — gestão do logotipo
- `src/pages/EditorPage.tsx` — layout principal com AgentChat + canvas
- `api/generate-premium.js` — geração GPT Image 2
- `src/pages/PremiumPage.tsx` — Posts Premium

## Roadmap — Próximas Sessões
1. Ajuste fino do layout do AgentChat (posicionamento, tamanho, UX)
2. Melhorar experiência conversacional do agente (mais consultivo, menos questionário)
3. Testar carrossel Premium com headlines curtos (requer crédito OpenAI)
4. Aceitar convite Testador Instagram
5. Débito de pulses no Editor Konva
6. Reposicionar LogoSection para área mais acessível no sidebar

## Modelo de Negócio
White-label para clientes: ~R$2.500–4.000 setup + retainer mensal. Pulses como camada de monetização.

## Créditos e Limites
- OpenAI GPT Image 2: saldo zerado — recarregar antes de testar Premium
- Vercel free: 10s por função serverless
- GitHub token: renovado sem expiração
