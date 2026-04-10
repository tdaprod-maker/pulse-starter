# Pulse — Contexto do Projeto

> Arquivo de contexto para uso em novas conversas de IA. Atualizado em: 10 abril 2026.

---

## 1. O que é o Pulse

**Pulse** é uma ferramenta web de design de posts para redes sociais com assistência de IA.

O usuário descreve em linguagem natural (português) o que quer publicar — ex: _"post motivacional sobre foco e disciplina"_ — e a IA gera automaticamente:
- O template mais adequado (hero, editorial, minimalista etc.)
- Os textos em português do Brasil
- A cor de destaque
- Uma imagem de fundo via Pexels

O resultado é exportável como PNG ou JPEG em 2× resolução, pronto para publicar.

**Repositório GitHub:** `https://github.com/tdaprod-maker/pulse`

---

## 2. Stack Tecnológica

### Frontend
| Tecnologia | Versão | Papel |
|---|---|---|
| React | 19.2.0 | UI |
| TypeScript | ~5.9.3 | Tipagem |
| Vite | 7.3.1 | Bundler / Dev server |
| Tailwind CSS | 4.2.1 | Estilos utilitários |
| React Router | 7.13.1 | Roteamento client-side |
| Zustand | 5.0.11 | State management |
| React Konva / Konva | 19.2.3 / 10.2.0 | Canvas 2D interativo |

### Backend / API
| Tecnologia | Papel |
|---|---|
| Vercel API Routes (Node.js) | Endpoint de imagem em produção (`/api/generate-image.js`) |
| Express.js 4.19.2 | Servidor de desenvolvimento em `/server/` |

### Serviços externos
| Serviço | Uso |
|---|---|
| Google Gemini 2.5-Flash | Geração de conteúdo (textos, template, cor, prompt de imagem) |
| Pexels API | Backup — ainda presente no código mas não utilizado |
| FAL.ai (FLUX Schnell) | Geração de imagens com IA — US$ 0,003/imagem |

---

## 3. Estrutura de Arquivos Importantes
pulse/
├── api/
│   └── generate-image.js        # Vercel API Route — busca imagem no Pexels
├── server/
│   └── index.js                 # Express dev server (mesma lógica da API Route)
├── src/
│   ├── main.tsx                 # Entry point React
│   ├── App.tsx                  # Router + ThemeProvider
│   ├── components/
│   │   ├── AIPanel.tsx          # Painel principal: input do usuário → IA → aplica resultado
│   │   ├── Sidebar.tsx          # Seletor de templates (accordion)
│   │   ├── Topbar.tsx           # Barra de navegação
│   │   ├── ExportPanel.tsx      # Export PNG/JPEG
│   │   ├── PropertiesPanel.tsx  # Editor de texto e cores por elemento
│   │   ├── ImagePanel.tsx       # Upload/zoom/pan da imagem de fundo
│   │   ├── LogoSection.tsx      # Upload e posicionamento do logo
│   │   └── TextEditor.tsx       # Textarea overlay para edição inline no canvas
│   ├── engine/
│   │   └── CanvasEngine.tsx     # Renderização Konva (Stage, Layer, elementos)
│   ├── state/
│   │   └── useStore.ts          # Zustand store — estado global dos templates
│   ├── contexts/
│   │   └── ThemeContext.tsx     # Context de tema (ThemeProvider + hook)
│   ├── services/
│   │   ├── gemini.ts            # Chamada à API Gemini (geração de conteúdo)
│   │   └── replicate.ts        # Chama /api/generate-image (retorna base64)
│   ├── templates/
│   │   ├── index.ts             # Registry de todos os templates
│   │   ├── defaultTemplates.ts  # Dados padrão
│   │   ├── hero-title/variants.ts
│   │   ├── big-statement/variants.ts
│   │   ├── editorial-card/variants.ts
│   │   ├── big-number/variants.ts
│   │   ├── food-promo/variants.ts
│   │   ├── tech-news/variants.ts
│   │   ├── tech-statement/variants.ts
│   │   ├── tech-product/variants.ts
│   │   └── tech-minimal/variants.ts
│   ├── pages/
│   │   ├── EditorPage.tsx       # Página principal (canvas + painéis)
│   │   ├── TemplatesPage.tsx    # Biblioteca de Posts (histórico)
│   │   ├── CarouselPage.tsx     # Gerador de carrossel para Instagram
│   │   ├── BrandPage.tsx        # Brand Kit (cores, fontes, logos, fotos)
│   │   └── ResetPasswordPage.tsx
│   ├── themes/
│   │   └── index.ts             # Cores e fontes do design system
│   └── export/
│       └── exportUtils.ts       # Lógica de export (Konva → PNG/JPEG)
├── public/
│   ├── logo-agente17-white.png  # Logo Agente 17 branco com fundo transparente real
│   └── logo-agente17b.png       # Logo Agente 17 original (fundo cinza/JPEG)
├── vercel.json                  # Rewrites SPA + API Routes
├── package.json                 # Dependências frontend
├── vite.config.ts
└── tsconfig.json

---

## 4. APIs e Configuração de Chaves

### Google Gemini
- **Arquivo:** `src/services/gemini.ts`
- **Chave:** `import.meta.env.VITE_GEMINI_API_KEY`
- **Modelo:** `gemini-2.5-flash` via `generateContent`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`
- **Config:** temperature 0.8, maxOutputTokens 500, thinkingBudget 0

### Pexels
- **Arquivo:** `api/generate-image.js`
- **Chave:** `process.env.PEXELS_API_KEY`
- **Endpoint:** `https://api.pexels.com/v1/search` (GET)
- **Parâmetros:** `query`, `per_page=15`, `orientation=square`
- **Header:** `Authorization: PEXELS_API_KEY`

### FAL.ai
- **Arquivo:** `api/generate-image-ai.js`
- **Chave:** `process.env.FAL_API_KEY`
- **Endpoint:** `https://fal.run/fal-ai/flux/schnell`
- **Modelo:** FLUX Schnell — US$ 0,003/imagem
- **Parâmetros:** image_size: square_hd, num_inference_steps: 4

### Variáveis de Ambiente
- `VITE_GEMINI_API_KEY` — Vite frontend
- `PEXELS_API_KEY` — Node.js API Route

---

## 5. URLs de Produção

| Serviço | URL |
|---|---|
| **Frontend (Vercel)** | Conectado ao repositório `tdaprod-maker/pulse` (verificar no dashboard Vercel) |
| **API Route** | `[url-vercel]/api/generate-image` |

---

## 6. Status Atual do Projeto

### Funcionando
- [x] Editor de canvas com React Konva (seleção, edição inline, zoom)
- [x] 9 templates × 4 formatos = 36 variantes (1:1, 4:5, 9:16, 16:9)
- [x] Geração de conteúdo via Gemini (texto + cor + template)
- [x] Busca de imagem de fundo via Pexels com cascade fallback (3 níveis)
- [x] Tradução PT→EN para melhorar relevância no Pexels
- [x] Export PNG e JPEG em 2× resolução
- [x] Upload manual de imagem de fundo
- [x] Upload e posicionamento de logo
- [x] Zoom/pan da imagem de fundo
- [x] Editor de propriedades por elemento (texto, cor, fonte)
- [x] Seletor de fontes (8 opções)
- [x] Deploy na Vercel com API Routes
- [x] Persistência de logo ao trocar de template
- [x] Redesign dark premium — CSS variables, fonte Sora, Topbar/Sidebar modernizados
- [x] Controle de tamanho de fonte por elemento no PropertiesPanel
- [x] Export com imagem de fundo funcionando (KonvaImage dentro do Stage)
- [x] Multi-formato simultâneo: gerar uma vez popula todos os 4 formatos
- [x] Visualização dos 4 formatos em grade com preview principal + miniaturas
- [x] Chaves de API movidas para variáveis de ambiente (.env + Vercel)
- [x] Botão "Exportar todos os formatos" (4 PNGs de uma vez)
- [x] Sincronização de fonte, cor e tamanho entre os 4 formatos
- [x] Botão "Nova imagem" no ImagePanel para rebuscar imagem no Pexels
- [x] Geração automática de legenda para Instagram e LinkedIn com hashtags
- [x] CaptionPanel abaixo dos mini previews
- [x] Persistência do editor via localStorage (Zustand persist middleware)
- [x] Tratamento de erros amigável no AIPanel
- [x] Restauração de post do histórico ao clicar na Biblioteca de Posts
- [x] Placeholder rotativo no campo de prompt do AIPanel
- [x] Snap to center com guias visuais vermelhas ao arrastar elementos no canvas
- [x] Sidebar reorganizada em grupos TEMPLATES e SAMPLES
- [x] Seleção múltipla para deletar posts na Biblioteca de Posts
- [x] Tech Minimal criado — fundo sólido, Montserrat Bold, frase centralizada
- [x] Múltiplos logotipos no Brand Kit com seleção direta no editor
- [x] Carrossel — página dedicada (/carousel) com seletor de slides (3–5) e templates (4 opções)
- [x] Carrossel — geração via Gemini, busca de imagens Pexels, preview em modal com canvas
- [x] Carrossel — export como ZIP
- [x] Carrossel — 4 layouts visuais distintos por templateId funcionando
- [x] Carrossel — painel de controles em tempo real no modal: cor de destaque (5 opções: azul, amarelo, coral, branco, preto), tamanho e cor do logo (original 210px / branco 120px), sombra nos textos, fundo (escuro/branco no Tech Minimal)
- [x] Carrossel — logo branco com fundo transparente real (logo-agente17-white.png)
- [x] Carrossel — logo branco como padrão no Tech Minimal, original nos demais
- [x] Carrossel — Tech Minimal com fundo branco e inversão automática de texto e logo para preto
- [x] Carrossel — drag and drop de elementos (título, body, logo) diretamente no canvas do modal
- [x] Carrossel — posições persistem por slide ao navegar entre slides
- [x] Carrossel — posição e tamanho do logo propagam automaticamente para todos os slides
- [x] Carrossel — réguas SVG de alinhamento (centro + terços) sobre o canvas, não aparecem no export
- [x] FAL.ai FLUX Schnell integrado em todo o app substituindo Pexels — US$ 0,003/imagem
- [x] imagePrompt do Gemini melhorado para até 20 palavras com detalhes fotográficos
- [x] Edição de imagem com IA no ImagePanel — usuário descreve em texto o que quer mudar (FLUX Kontext)
- [x] Export sem bordas azuis de seleção — stroke removido temporariamente antes do toDataURL
- [x] Sistema de tokens implementado — tabela user_tokens no Supabase, débito a cada geração, saldo visível no AIPanel
- [x] Edição de imagem com IA no ImagePanel via FLUX Kontext (FAL.ai)
- [x] Export sem bordas azuis de seleção
- [x] imagePrompt do Gemini melhorado para prompts mais descritivos (até 20 palavras)
- [x] Integração LinkedIn iniciada — app criado, OAuth configurado, API Routes criadas, botão no CaptionPanel
- [x] Tokens renomeados para "Pulses" na interface — branding do produto
- [x] Carrossel — campos de edição de texto (título e body) visíveis e funcionando no modal
- [x] Carrossel — quebra de linha manual respeitada no canvas (wrapText atualizado)
- [x] Carrossel — botão Salvar no Supabase (tabela carousels)
- [x] Carrossel — Biblioteca de Carrossel com visualização, recarregamento e exclusão
- [x] Carrossel — restauração completa de carrossel salvo (slides, imagens, configurações)
- [x] Carrossel — formato 4:5 (1080x1350) para Instagram
- [x] Interface — tokens renomeados para "Pulses" (branding do produto)
- [x] LinkedIn — publicação de carrossel com múltiplas imagens funcionando
- [x] Navegação entre slides no modal restaurada com botões fixos
- [x] Contador de pulses na Topbar com destaque azul, atualiza a cada 30s
- [x] Débito de pulse na edição de imagem com IA (ImagePanel)
- [x] OAuth LinkedIn abre em nova aba sem perder estado da página
- [x] Retry automático no Gemini (3 tentativas com fallback para gemini-1.5-flash)
- [x] Botão publicar no LinkedIn na página do carrossel (fora do modal)
- [x] Carrossel — campos de edição de texto visíveis e funcionando
- [x] Carrossel — quebra de linha manual respeitada no canvas
- [x] Carrossel — biblioteca com visualização, recarregamento e exclusão
- [x] Carrossel — formato 4:5 (1080x1350) para Instagram
- [x] Carrossel — opções de 7 e 10 slides

---

## 7. Próximos Passos — Roadmap

1. Verificar botão LinkedIn no CaptionPanel do Editor (quando Gemini voltar)
2. Botão LinkedIn na Biblioteca de Carrossel (nos cards)
3. Retomar integração Instagram — convites pendentes para agente17ia e tdaprod
4. Ajustes finos no drag de textos no modal do carrossel
5. Sistema de pulses com pagamento (Stripe ou Hotmart)
6. Geração de vídeo para Reels (longo prazo)

---

## 8. Modelo de Negócio

- **Uso interno:** Agente 17 usa o Pulse para criar conteúdo próprio
- **Por cliente:** versão customizada (templates, Brand Kit, cores, logo) com deploy separado na Vercel
- **Precificação sugerida:** R$ 2.500–4.000 de setup + R$ 800/mês por cliente
- **Modelo de Pulses:** cliente recebe X pulses/mês incluídos, pode comprar mais. Cada geração de imagem custa 1 pulse. Custo real por pulse: R$ 0,017 (FLUX Schnell via FAL.ai)
  - Margem embutida no preço dos pulses extras

---

## 9. Decisões Arquiteturais Importantes

### Canvas com Konva (não DOM/SVG)
O editor usa `react-konva` para renderização 2D. Permite export direto via `Stage.toImage()` com pixelRatio 2× sem depender de html2canvas.

### Templates como fábricas de variantes
Cada template é uma função que retorna um array de 4 objetos `Template`, um por aspect ratio.

### API Route (Vercel) como proxy para Pexels/FAL.ai
A chave da API fica no servidor (`api/generate-image.js`), nunca exposta ao frontend.

### Zustand para estado global
O store centraliza todos os templates. Logo é preservado ao trocar de template. `backgroundImage` não é preservado.

### Sistema de cores do carrossel — 5 opções
`#3A5AFF` azul, `#FFCA1D` amarelo, `#FF6F5E` coral, `#FFFFFF` branco, `#000000` preto.

### Carrossel — canvas 2D puro (não Konva)
O carrossel usa canvas HTML5 2D com `drawSlide()` — sistema separado do Editor principal que usa Konva.

---

## 10. Bugs Conhecidos

- Gemini 2.5 Flash com instabilidade frequente (erros 503) — retry implementado mas não resolve quando sobrecarga é prolongada
- Integração Instagram em andamento — convites pendentes de aceite nas contas agente17ia e tdaprod
- URL de produção da Vercel não documentada no código — verificar no dashboard
- Token GitHub exposto em log do Claude Code em março 2026 — revogar se ainda não feito
- `replicate.ts` tem comentário de cache bust manual — workaround para problema de deploy
- Imagens do Pexels frequentemente irrelevantes para temas de IA — será resolvido com FAL.ai

---

## 11. Comandos para Rodar Localmente
```bash
# Frontend (porta 5173)
cd /Users/ricardojimenes/Desktop/pulse
npm install
npm run dev

# Build de produção
npm run build
npm run preview

# Deploy (automático via Vercel ao fazer push para main)
git add .
git commit -m "..."
git push
```

---

## 12. Estrutura do AIPanel (fluxo principal)
Usuário digita prompt
↓
gemini.ts → generatePostContent(prompt)
↓ retorna: { template, texts, accentColor, imagePrompt }
AIPanel aplica resultado:

Seleciona template correto (preservando aspect ratio atual)
Atualiza textos dos elementos
Aplica accentColor nos elementos corretos por template
Chama replicate.ts → /api/generate-image com imagePrompt
↓ retorna: data:image/jpeg;base64,...
setTemplateBackground(templateId, base64url)


---

## 13. FALLBACK_MAP do Pexels (api/generate-image.js)

| Termos | Query genérica |
|---|---|
| feijoada, parmegiana... | `brazilian food` |
| baseball, beisebol... | `sport athlete` |
| networking, leadership... | `business people meeting` |
| meditation, wellness... | `person relaxing nature` |
| artificial intelligence... | `technology innovation digital` |
| robot, automation... | `technology futuristic digital` |
| data, analytics... | `data technology abstract blue` |
| agent, agente, chatbot... | `technology digital interface` |

---

## 14. Mapa de Componentes por Funcionalidade

| Funcionalidade | Arquivos principais |
|---|---|
| Geração de conteúdo com IA | src/components/AIPanel.tsx, src/services/gemini.ts |
| Busca de imagem de fundo | src/services/replicate.ts, api/generate-image.js |
| Canvas e renderização | src/engine/CanvasEngine.tsx |
| Estado global | src/state/useStore.ts |
| Templates | src/templates/index.ts, src/templates/[nome]/variants.ts |
| Edição de texto e cores | src/components/PropertiesPanel.tsx |
| Upload imagem de fundo | src/components/ImagePanel.tsx |
| Upload e posicionamento do logo | src/components/LogoSection.tsx |
| Export PNG/JPEG | src/export/exportUtils.ts |
| Autenticação | src/pages/LoginPage.tsx, src/lib/supabase.ts |
| Brand Kit | src/pages/BrandPage.tsx, src/services/brandKit.ts |
| Biblioteca de Posts | src/components/AIPanel.tsx, src/services/brandKit.ts |
| Carrossel | src/pages/CarouselPage.tsx |
| Legenda Instagram/LinkedIn | src/components/AIPanel.tsx (CaptionPanel) |
| Roteamento | src/App.tsx |
| Deploy e API Routes | vercel.json, api/generate-image.js |
