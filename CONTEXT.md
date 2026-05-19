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
- Brand kit lido automaticamente (não pergunta o que já sabe)
- Formatos por rede social: Stories→9x16, LinkedIn→1x1, feed Instagram→4x5, banner→16x9
- Callbacks `onGenerating` e `onGenerated` ocultam miniaturas desde o início da geração
- AIPanel antigo removido

### Editor Konva — Templates
Templates registrados no `templateRegistry` e no Sidebar:

**Sport:** sport-arena, sport-brand
**Food:** food-editorial, food-promo, food-vertical (novo — faixa vertical + texto rotacionado)
**Business:** business-statement, business-card
**Health:** health-content, health-stats
**Construction:** build-impact, build-editorial
**Realty:** realty-premium, realty-launch
**Fashion:** fashion-editorial, fashion-drop
**Outros:** geo-impact (círculo geométrico), split-editorial (split escuro/claro), editorial-cover (estilo magazine), bold-circle (fundo vibrante + círculo), tech-statement, tech-news, tech-product, tech-minimal, hero-title, big-statement, editorial-card, big-number

### Editor Konva — PropertiesPanel
- Edição inline ao clicar no elemento (texto e shapes)
- Estado vazio: "Clique em um elemento no canvas para editar"
- ShapeFieldPanel: cor + largura + espessura para qualquer shape
- GenericBackgroundSection: cor de fundo para qualquer template
- ColorSwatch com picker posicionado próximo ao botão
- LogoSection redesenhada mas ainda no fundo do ImagePanel — pendente reposicionamento

### imagePrompt FAL.ai FLUX
- Estrutura: [sujeito específico] + [ação] + [ambiente] + [estilo fotográfico] + [iluminação] + qualidade
- Proibições: robotic hands, holograms, neon circuits, screens with text, dashboards, brand names, logos
- Suffix obrigatório: "hyperrealistic, award-winning photography, no text, no logos, no brand names, no company names, no watermarks, no fictional logos"

### Legendas
- Estrutura por rede: Instagram (1ª linha funciona sozinha como preview) + LinkedIn (parágrafos com linha em branco)
- Tom por categoria: profissional/descontraído/inspiracional/técnico
- Proibições: "Você sabia que", "Descubra como", "No mundo atual", "Em um mundo onde"

### turboPromptEditor
- Função separada para Editor Konva — foco em briefing de conteúdo
- `turboPrompt` original mantido para Posts Premium

### Tema Claro/Escuro
- Variáveis CSS `[data-theme="light"]` no `index.css`
- Toggle na Topbar (ícone sol/lua)
- Topbar sempre escura

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
- `src/services/gemini.ts` — agentChat, turboPromptEditor, generatePostContent, breakCarouselIntoSlides
- `src/components/PropertiesPanel.tsx` — edição inline de elementos
- `src/components/LogoSection.tsx` — gestão do logotipo
- `src/pages/EditorPage.tsx` — layout principal com AgentChat + canvas
- `src/templates/index.ts` — registry de todos os templates
- `api/generate-premium.js` — geração GPT Image 2
- `src/pages/PremiumPage.tsx` — Posts Premium

## Roadmap — Próximas Sessões
1. Testar carrossel Premium com headlines curtos (requer crédito OpenAI)
2. Aceitar convite Testador Instagram
3. Verificar e implementar débito de pulses no Editor Konva
4. Diferenciar Bold Circle do Geo Impact visualmente
5. Reposicionar LogoSection para área mais acessível
6. Evoluir agente para ser mais consultivo

## Modelo de Negócio
White-label para clientes: ~R$2.500–4.000 setup + retainer mensal. Pulses como camada de monetização.

## Créditos e Limites
- OpenAI GPT Image 2: saldo zerado — recarregar antes de testar Premium
- Vercel free: 10s por função serverless
- GitHub token: renovado sem expiração
