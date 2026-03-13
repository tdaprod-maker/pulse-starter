# Pulse — Contexto do Projeto

> Arquivo de contexto para uso em novas conversas de IA. Atualizado em: março 2026.

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
| Pexels API | Busca e download de imagem de fundo |

---

## 3. Estrutura de Arquivos Importantes

```
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
│   ├── pages/
│   │   ├── EditorPage.tsx       # Página principal (canvas + painéis)
│   │   └── TemplatesPage.tsx    # Galeria de templates
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
│   │   ├── minimal-type/variants.ts
│   │   ├── big-number/variants.ts
│   │   └── food-promo/variants.ts
│   ├── themes/
│   │   └── index.ts             # Cores e fontes do design system
│   └── export/
│       └── exportUtils.ts       # Lógica de export (Konva → PNG/JPEG)
├── vercel.json                  # Rewrites SPA + API Routes
├── package.json                 # Dependências frontend
├── vite.config.ts
└── tsconfig.json
```

---

## 4. APIs e Configuração de Chaves

### Google Gemini
- **Arquivo:** `src/services/gemini.ts`
- **Chave:** hardcoded na constante `API_KEY` (linha 13)
- **Modelo:** `gemini-2.5-flash` via `generateContent`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`
- **Config:** temperature 0.8, maxOutputTokens 500, thinkingBudget 0

### Pexels
- **Arquivo:** `api/generate-image.js`
- **Chave:** hardcoded na constante `PEXELS_API_KEY` (linha 1)
- **Endpoint:** `https://api.pexels.com/v1/search` (GET)
- **Parâmetros:** `query`, `per_page=15`, `orientation=square`
- **Header:** `Authorization: PEXELS_API_KEY`

### Variáveis de Ambiente
Atualmente **não há `.env`** no projeto — as chaves estão hardcoded no código.
Existe referência a `VITE_SERVER_URL` em commits antigos (usado na época do proxy Express), mas não está mais em uso ativo.

---

## 5. URLs de Produção

| Serviço | URL |
|---|---|
| **Frontend (Vercel)** | Conectado ao repositório `tdaprod-maker/pulse` via Vercel (URL exata não documentada no código — verificar no dashboard Vercel) |
| **API Route** | `[url-vercel]/api/generate-image` |
| **Railway** | Hospedou o Express server em fases anteriores; atualmente a API está nas Vercel API Routes |

> **Nota:** A URL de produção da Vercel não está hardcoded no código-fonte. Verificar em vercel.com no projeto `pulse`.

---

## 6. Status Atual do Projeto

### Funcionando
- [x] Editor de canvas com React Konva (seleção, edição inline, zoom)
- [x] 5 templates × 4 formatos = 20 variantes (1:1, 4:5, 9:16, 16:9)
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
- [x] Template Food Promo — fundo foto full, tipografia Bebas Neue, subtitle com pill escura

### Em Progresso / Recente
- Migração de Unsplash para Pexels com cascade fallback (3 níveis) — concluído no commit `deb8215`

---

## 7. Próximos Passos Planejados

_(Não há roadmap formal documentado — baseado na evolução recente dos commits)_

- Controle manual de tamanho de fonte por elemento no PropertiesPanel
- Templates por segmento: bebidas, fitness, negócios
- Mover chaves de API para variáveis de ambiente (`.env` / Vercel env vars)

---

## 8. Decisões Arquiteturais Importantes

### Canvas com Konva (não DOM/SVG)
O editor usa `react-konva` para renderização 2D. Isso permite export direto via `Stage.toImage()` com pixelRatio 2× sem depender de `html2canvas` ou bibliotecas externas.

### Templates como fábricas de variantes
Cada template é uma função (`makeHeroTitleVariants`, etc.) que retorna um array de 4 objetos `Template`, um por aspect ratio. Isso evita duplicação e centraliza a lógica de layout por template.

### API Route (Vercel) como proxy para Pexels
A chave do Pexels fica no servidor (`api/generate-image.js`), nunca exposta ao frontend. O `replicate.ts` simplesmente chama `/api/generate-image` com o prompt.

### Zustand para estado global
O store centraliza todos os templates carregados e o estado do editor. Logo é preservado ao trocar de template (`addTemplate` faz upsert preservando `logoImage`, `logoSize`, `logoX`, `logoY`). `backgroundImage` **não** é preservado — se limpa ao trocar de template/formato.

### Sistema de cores — apenas 3 opções
A IA escolhe entre exatamente 3 cores de destaque:
- `#3A5AFF` azul — tech, negócios
- `#FFCA1D` amarelo — energia, conquistas
- `#FF6F5E` coral — lifestyle, alimentação

Isso evita cores inconsistentes e mantém identidade visual forte.

### Fontes disponíveis (8)
Inter, Playfair Display, Space Grotesk, Montserrat, Lora, Oswald, Raleway, Bebas Neue — todas importadas via Google Fonts.

### Prompt engineering do Gemini
O prompt é detalhado com regras por template, regras de seleção de cor, e instrução para `imagePrompt` em inglês. Resposta sempre em JSON. Parse robusto aceita JSON puro, markdown code block, ou objeto JSON embutido em texto livre.

### Pexels: cascade fallback em 3 níveis
A busca tenta: (1) query completa do imagePrompt, (2) primeira palavra-chave relevante, (3) termo genérico via `FALLBACK_MAP`. A foto é escolhida aleatoriamente do pool retornado (`photo.src.large2x`).

---

## 9. Bugs Conhecidos

- Chaves de API (`PEXELS_API_KEY`, `API_KEY` Gemini) estão hardcoded no código-fonte — expostas no repositório GitHub público
- A URL de produção da Vercel não está documentada em nenhum arquivo do projeto
- `replicate.ts` tem comentário de cache bust manual (`// cache bust Seg 9 Mar 2026...`) — indica workaround para problema de deploy da Vercel
- `VITE_SERVER_URL` referenciado em commits antigos pode causar confusão (não está mais em uso)
- Pexels não tem acervo de pratos brasileiros específicos (feijoada, parmegiana) — imagem do produto deve ser enviada pelo usuário para resultado profissional

---

## 10. Comandos para Rodar Localmente

### Frontend (porta 5173)
```bash
cd /Users/ricardojimenes/Desktop/pulse
npm install
npm run dev
```

### Backend Express (porta 3001) — opcional, só necessário fora da Vercel
```bash
cd /Users/ricardojimenes/Desktop/pulse/server
npm install
node index.js
```

### Build de produção
```bash
npm run build      # TypeScript check + Vite build → /dist
npm run preview    # Preview do build (porta 4173)
```

### Lint
```bash
npm run lint
```

### Deploy
O deploy é automático via Vercel ao fazer push para `main` no repositório `tdaprod-maker/pulse`.

```bash
git add .
git commit -m "..."
git push
```

---

## 11. Estrutura do AIPanel (fluxo principal)

```
Usuário digita prompt
  ↓
gemini.ts → generatePostContent(prompt)
  ↓ retorna: { template, texts, accentColor, imagePrompt }
AIPanel aplica resultado:
  - Seleciona template correto (preservando aspect ratio atual)
  - Atualiza textos dos elementos
  - Aplica accentColor nos elementos corretos por template
  - Chama replicate.ts → /api/generate-image com imagePrompt
      ↓ retorna: data:image/jpeg;base64,...
  - setTemplateBackground(templateId, base64url)
```

---

## 12. FALLBACK_MAP do Pexels

| Termos específicos | Query genérica usada |
|---|---|
| feijoada, parmegiana, brigadeiro, coxinha, churrasco | `brazilian food` |
| baseball, beisebol, cricket, rugby, lacrosse | `sport athlete` |
| networking, leadership, entrepreneurship, startup | `business people meeting` |
| meditation, wellness, mindfulness | `person relaxing nature` |

Lógica em `lookupFallbackMap()` em `api/generate-image.js` — ativada no nível 3 da cascata.
