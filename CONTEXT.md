# Pulse — Contexto do Projeto

## Visão Geral
Pulse é uma ferramenta web de design de posts para redes sociais com assistência de IA, desenvolvida pela Agente 17. Uso interno e white-label para clientes. Repositório: `github.com/tdaprod-maker/pulse-starter`, auto-deploy no Vercel via push para `main`.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Vercel API Routes (Node.js)
- Banco: Supabase (auth + storage + postgres)
- IA Imagem: GPT Image 2 (OpenAI) para Posts Premium, FAL.ai FLUX para carrossel/editor
- IA Texto: Gemini 2.5 Flash (legendas, turbo prompt, análise)
- Deploy: Vercel (plano free — limite de 10s por função serverless)

## Módulos

### Editor Konva
- Editor de posts com templates Konva
- 4 templates distintos com drag-and-drop, controles de fonte/cor/alinhamento, seletor de fonte, persistência de posição por slide, propagação de logo
- Turbinador de prompt (⚡) disponível mas precisa de aprimoramento
- **Pendente:** melhorar qualidade visual dos templates, novos templates por segmento, aprimorar turbinador de prompt

### Carrossel
- Geração de carrosseis via FAL.ai FLUX Schnell
- Biblioteca de Carrosseis salva na tabela `carousels` do Supabase
- Publicação LinkedIn (OAuth conectado) e Instagram (pendente aceite de convite Testador para `agente17ia` e `tdaprod`)

### Posts Premium
- Geração via GPT Image 2 (OpenAI)
- **Post único:** gera 1 imagem vertical 1024x1536 e faz crop para 3 formatos: 9:16, 4:5, 1:1
- Logo aplicado após crop de cada formato (não antes)
- **Carrossel:** 3 a 7 slides em 4:5, cada slide com conteúdo diferenciado via Gemini (`breakCarouselIntoSlides`), cenas visuais rotativas para evitar repetição, CTA explícito no último slide
- Legenda gerada automaticamente (Instagram + LinkedIn + hashtags) via Gemini após geração das imagens
- Post único salvo na tabela `posts`, carrossel salvo na tabela `carousels`
- Turbo prompt reescrito para direção de arte e geração de imagem
- Bug do sessionStorage corrigido — não salva status `loading`, evita trava ao reabrir
- Download: "Baixar tudo" com intervalo de 800ms entre arquivos

### Biblioteca de Posts
- Tabela `posts` no Supabase
- Filtra por `template_id`: `premium-single`, `premium-carousel`, e templates Konva

### Biblioteca de Carrosseis
- Tabela `carousels` no Supabase
- Botão "Recarregar" oculto para carrosseis `premium-carousel` (imagens base64 pesadas quebram URL)
- **Pendente:** ao clicar no card Premium não acontece nada — precisa de feedback (visualizar slides)

### Sistema de Pulses
- Tabela `user_tokens` no Supabase
- Post único Premium: 4 pulses; Carrossel Premium: 2 pulses por slide
- Topbar mostra saldo em tempo real, atualiza a cada 30s e via evento `pulse-balance-updated`
- **Pendente:** débito real de pulses no Posts Premium

### Publicação
- LinkedIn: OAuth conectado, suporta post único e carrossel (multi-imagem)
- Instagram: integração pendente — aceitar convite Testador no app Instagram para `agente17ia` e `tdaprod`
- **Pendente:** testar publicação Instagram e LinkedIn no Posts Premium

### Topbar
- Logo Pulse + "por Agente 17" ao lado
- Nav central com 5 itens: Editor, Carrossel, Posts Premium, Biblioteca de Carrossel, Biblioteca de Posts
- BETA removido
- Saldo de pulses à direita com alerta visual quando < 10

## Arquivos Principais
- `api/generate-premium.js` — geração GPT Image 2, prompt com perfis de pessoa por segmento (12 segmentos mapeados), proibições explícitas de elementos genéricos de IA
- `src/pages/PremiumPage.tsx` — lógica completa do Posts Premium (single + carrossel)
- `src/pages/CarouselLibraryPage.tsx` — biblioteca de carrosseis
- `src/pages/PostLibraryPage.tsx` — biblioteca de posts
- `src/services/gemini.ts` — turboPrompt, generatePremiumCaption, reviewPost, breakCarouselIntoSlides
- `src/services/brandKit.ts` — savePost, loadPosts, uploadThumbnail, updatePostThumbnail
- `src/components/Topbar.tsx` — navegação e saldo de pulses

## Segmentos Disponíveis
Restaurante/Food, Consultoria/Serviços, Varejo/E-commerce, Saúde/Bem-estar, Academia/Esportes, Educação/Cursos, Tecnologia/SaaS, Imobiliário, Moda/Beleza, Agência/Marketing, Jurídico/Contabilidade, Outro

## Roadmap — Próximas Sessões
1. Testar carrossel Premium — verificar se cenas rotativas diferenciaram slides visualmente
2. Biblioteca de Carrossel — feedback ao clicar em card Premium (visualizar slides)
3. Templates do Editor Konva — qualidade visual e novos templates por segmento
4. Turbinador de prompt no Editor Konva
5. Débito real de pulses no Posts Premium
6. Aceitar convite Testador Instagram e testar publicação IG/LinkedIn no Posts Premium
7. Futuramente: integração de pagamento para recarga de pulses

## Modelo de Negócio
White-label para clientes: ~R$2.500–4.000 setup + retainer mensal. Pulses como camada de monetização.

## Créditos e Limites
- OpenAI GPT Image 2: ~$0.08–0.12 por geração (saldo atual baixo — monitorar)
- Vercel free: 10s por função serverless (Posts Premium próximo do limite com 2 gerações)
- GitHub token: renovado sem expiração
