# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Modelo de Negócio
- White-label: ~R$2.500–4.000 setup + retainer mensal
- SaaS: R$47/mês com 50-100 pulses incluídos + compra de pulses adicionais
- Pulses: post FAL.ai = 4 pulses, slide carrossel = 2 pulses, post Premium = custo maior
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
- Backend: Vercel API Routes (Node.js)
- Banco: Supabase (auth + storage + postgres)
- IA Imagem: FAL.ai FLUX (posts editáveis) + GPT Image 2 (posts premium)
- IA Texto: Claude Haiku 4.5 — migrar do Gemini (mais estável, mesma ordem de custo)
- Deploy: Vercel (plano free — limite de 10s por função serverless)

## Roadmap por Semanas

### Semana 1 — Fundação
1. **Trocar Gemini por Claude Haiku 4.5** — backbone do agente, mais estável
2. **Unificar telas** — remover abas Carrossel e Posts Premium como módulos separados, tudo dentro do Editor
3. **Estrutura PWA básica** — manifest.json, service worker, ícones

### Semana 2 — O Agente Designer
4. **Agente mais inteligente** — orienta boas práticas antes de gerar, não só executa
5. **Agente decide a engine** — FAL.ai vs GPT Image 2 baseado no briefing, usuário só vê o custo em pulses
6. **Fluxo completo** — post → legenda → publicação sem trocar de tela

### Semana 3 — Mobile e Polimento
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
- Carrossel via CarouselViewer (dentro do Editor)
- Brand kit automático (logo, cores, tom de voz)
- Publicação LinkedIn (OAuth conectado)
- Download PNG e ZIP
- Sistema de pulses (débito implementado no Premium)
- Templates organizados por categoria no Sidebar

### O que está pendente
- Instabilidade Gemini → migrar para Claude Haiku
- Agente confundindo post/carrossel ocasionalmente
- Instagram pendente (aceitar convite Testador para agente17ia e tdaprod)
- Débito de pulses no Editor Konva (verificar)
- Log de debug do agentChat para remover
- CarouselPage (aba antiga) para remover
- Posts Premium sem saldo OpenAI para testar

## Templates
Mantém os existentes para o MVP. Não investir em novos agora — energia melhor gasta no agente. Com GPT Image 2, templates se tornam menos relevantes no longo prazo.

**Regra para novos templates — sempre registrar em 3 lugares no gemini.ts (futuro: claude):**
1. `TEMPLATE_FIELDS` — campos mapeados
2. `buildPrompt` seção TEMPLATES DISPONÍVEIS — descrição + Campos
3. `buildPrompt` regras de seleção — quando usar

**Categorias atuais:** Sport, Food, Business, Health, Construction, Realty, Fashion, Tech, Home & Deco, Outros

## Arquivos Principais
- `src/components/AgentChat.tsx` — agente conversacional, recolhível após geração
- `src/components/CarouselViewer.tsx` — carrossel integrado ao Editor
- `src/services/gemini.ts` — migrar para claude.ts
- `src/components/PropertiesPanel.tsx` — edição inline de elementos
- `src/components/ExportPanel.tsx` — botão Baixar
- `src/pages/EditorPage.tsx` — tela principal
- `src/pages/CarouselPage.tsx` — remover
- `src/pages/PremiumPage.tsx` — integrar ao Editor
- `src/templates/index.ts` — registry de templates

## Custos de API (referência)
- Claude Haiku 4.5: $1/$5 por milhão de tokens input/output
- FAL.ai FLUX: ~$0.003 por imagem
- GPT Image 2: ~$0.04 por imagem
- Custo total por geração FAL.ai: ~R$0,03
- Custo total por geração Premium: ~R$0,23
- Margem no plano R$47/100 pulses: saudável em ambos os casos

## PWA — Requisitos
- manifest.json com nome, ícone, cores da marca
- Service Worker para cache básico
- Layout responsivo (mobile-first no Editor)
- Touch support no canvas Konva
- Painel de edição simplificado para mobile
