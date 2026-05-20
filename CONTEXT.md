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
- Editor começa sem template selecionado — clique fora deseleciona template ativo
- Agente detecta intenção de carrossel e pergunta slideCount (opções: 3, 4, 5, 7, 10)

### Editor Konva — Carrossel
- Geração via `generateCarouselContent` com textos mapeados para o template ativo
- Imagens geradas em paralelo via FAL.ai
- Slides renderizados com `CanvasEngine` (editáveis via PropertiesPanel)
- Logo do brand kit aplicado em todos os slides
- Navegação entre slides com setas e miniaturas
- Download ZIP de todos os slides
- Botões de publicação LinkedIn e Instagram
- Componente: `CarouselViewer.tsx`

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
- Botão único azul "Baixar" — exporta PNG 2x

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
- `src/components/CarouselViewer.tsx` — visualizador e editor de carrossel
- `src/services/gemini.ts` — agentChat, generateCarouselContent, buildPrompt, TEMPLATE_FIELDS
- `src/components/PropertiesPanel.tsx` — edição inline de elementos
- `src/components/ExportPanel.tsx` — botão Baixar simplificado
- `src/components/Sidebar.tsx` — categorias de templates
- `src/components/LogoSection.tsx` — gestão do logotipo (pendente reposicionamento)
- `src/pages/EditorPage.tsx` — layout principal com AgentChat + canvas + CarouselViewer
- `src/templates/index.ts` — registry de todos os templates
- `api/generate-premium.js` — geração GPT Image 2
- `src/pages/PremiumPage.tsx` — Posts Premium

## Roadmap — Próximas Sessões

### Curto prazo
1. Remover log de debug do agentChat (`console.log('[agentChat] raw response'`)
2. Aumentar área de visualização e edição no Editor — há elementos que ficam fora da área visível
3. Agente mais inteligente — especialista em design e redes sociais, que direciona às melhores práticas além de gerar
4. Edição de elementos do carrossel via PropertiesPanel — testar e corrigir se necessário
5. LogoSection — reposicionar para área mais acessível no painel direito
6. Débito de pulses no Editor Konva — verificar se está implementado

### Médio prazo
7. Recarregar saldo OpenAI e testar carrossel Premium
8. Aceitar convite Testador Instagram para `agente17ia` e `tdaprod`
9. Publicação no Instagram do carrossel — testar quando Instagram estiver ativo
10. Diferenciar visualmente Bold Circle do Geo Impact

### Visão futura
11. Pagamento de pulses
12. Mais templates por segmento

## Modelo de Negócio
White-label para clientes: ~R$2.500–4.000 setup + retainer mensal. Pulses como camada de monetização.

## Créditos e Limites
- OpenAI GPT Image 2: saldo zerado — recarregar antes de testar Premium
- Vercel free: 10s por função serverless
- GitHub token: renovado sem expiração
