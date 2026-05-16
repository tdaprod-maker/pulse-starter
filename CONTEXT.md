# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Vercel API Routes (Node.js)
- Banco: Supabase (auth + storage + postgres)
- IA Imagem: GPT Image 2 (OpenAI) para Posts Premium, FAL.ai FLUX para Editor Konva
- IA Texto: Gemini 2.5 Flash (legendas, turbo prompt, análise)
- Deploy: Vercel (plano free — limite de 10s por função serverless)

## Módulos

### Editor Konva
- Editor de posts com templates Konva
- Templates disponíveis: hero-title, big-statement, editorial-card, big-number, food-promo, food-editorial, tech-news, sport-arena, business-statement, business-card, tech-statement, tech-product, tech-minimal
- Turbo prompt separado (`turboPromptEditor`) focado em briefing de conteúdo, não descrição de imagem
- imagePrompt otimizado para FAL.ai FLUX com estrutura: [sujeito específico] + [ação] + [ambiente] + [estilo fotográfico] + [iluminação] + "hyperrealistic, award-winning photography, no text, no logos"
- Proibições explícitas no imagePrompt: robotic hands, holograms, neon circuits, screens with text, dashboards
- ExportPanel movido para abaixo das miniaturas no main (PNG, JPEG, todos os formatos)
- **Pendente:** sidebar do Editor visualmente desatualizado — precisa de redesign moderno

### Posts Premium
- Geração via GPT Image 2 (OpenAI)
- **Post único:** gera 1 imagem vertical 1024x1536 e faz crop para 3 formatos: 9:16, 4:5, 1:1
- Logo aplicado após crop de cada formato
- **Carrossel:** 3 a 7 slides em 4:5, conteúdo diferenciado via Gemini (`breakCarouselIntoSlides`) com headlines ultra-curtos (4 palavras), cenas visuais rotativas, CTA no último slide
- Legenda gerada automaticamente após geração das imagens
- Débito real de pulses implementado após geração bem-sucedida
- Post único salvo na tabela `posts`, carrossel salvo na tabela `carousels`
- Bug do sessionStorage corrigido — não salva status `loading`
- Download: "Baixar tudo" com intervalo de 800ms

### Biblioteca de Posts
- Tabela `posts` no Supabase
- Filtra por `template_id`

### Biblioteca de Carrosseis
- Tabela `carousels` no Supabase
- Botão "Recarregar" oculto para `premium-carousel`
- Modal de visualização ao clicar no card Premium: mostra slides, legenda, botões de download individual e "Baixar todos"

### Sistema de Pulses
- Tabela `user_tokens` no Supabase
- Post único Premium: 4 pulses; Carrossel Premium: 2 pulses por slide; Editor: conforme PULSE_COSTS
- Débito real implementado no Posts Premium
- Topbar mostra saldo em tempo real

### Publicação
- LinkedIn: OAuth conectado, suporta post único e carrossel
- Instagram: pendente — aceitar convite Testador no app Instagram para `agente17ia` e `tdaprod`

### Topbar
- Logo Pulse + "por Agente 17" ao lado
- Nav central com 5 itens
- BETA removido
- Saldo de pulses à direita

## Arquivos Principais
- `api/generate-premium.js` — geração GPT Image 2
- `src/pages/PremiumPage.tsx` — lógica Posts Premium
- `src/pages/EditorPage.tsx` — Editor Konva com ExportPanel no main
- `src/pages/CarouselLibraryPage.tsx` — biblioteca com modal Premium
- `src/services/gemini.ts` — turboPrompt, turboPromptEditor, generatePostContent, generatePremiumCaption, breakCarouselIntoSlides
- `src/components/AIPanel.tsx` — painel de geração do Editor
- `src/components/ExportPanel.tsx` — exportação PNG/JPEG
- `src/components/Sidebar.tsx` — sidebar do Editor (pendente redesign)

## Segmentos Disponíveis
Restaurante/Food, Consultoria/Serviços, Varejo/E-commerce, Saúde/Bem-estar, Academia/Esportes, Educação/Cursos, Tecnologia/SaaS, Imobiliário, Moda/Beleza, Agência/Marketing, Jurídico/Contabilidade, Outro

## Roadmap — Próximas Sessões
1. Redesign do sidebar do Editor Konva — mais moderno e amigável
2. Testar carrossel Premium com headlines curtos (crédito OpenAI necessário)
3. Aceitar convite Testador Instagram e testar publicação IG/LinkedIn no Posts Premium
4. Débito real de pulses no Editor Konva (verificar se está implementado)
5. Novos templates por segmento no Editor Konva

## Modelo de Negócio
White-label para clientes: ~R$2.500–4.000 setup + retainer mensal. Pulses como camada de monetização.

## Créditos e Limites
- OpenAI GPT Image 2: saldo zerado — recarregar antes de testar Premium
- Vercel free: 10s por função serverless
- GitHub token: renovado sem expiração
