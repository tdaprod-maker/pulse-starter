# Pulse Starter — Guia para Agentes de Código

Este arquivo é para quem vai *mexer no código*. Para contexto de produto, modelo de
negócio e estado de features, veja `CONTEXT.md` — não duplique isso aqui.

## Stack

- **Frontend:** React 19 + TypeScript + Vite 7, PWA via `vite-plugin-pwa` (Workbox)
- **Canvas:** Konva + `react-konva` — renderização de templates, sem lib de edição externa
- **Estado:** Zustand (`src/state/useStore.ts`) com `persist`/`createJSONStorage`
- **Backend:** Vercel Functions (Node.js) em `api/*.js` — uma função por rota, sem framework
- **Banco/Auth/Storage:** Supabase
- **Pagamentos:** Stripe (`api/stripe.js`, `bodyParser: false` para o webhook)
- **IA texto:** Claude Haiku 4.5 via chamada direta à Anthropic Messages API (sem SDK)
- **IA imagem:** `gpt-image-1` (Standard, `api/generate-image-ai.js`) e GPT Image 2 (Premium,
  `api/generate-premium.js`) via OpenAI, chamada direta (sem SDK)
- **Roteamento de API:** `vercel.json` reescreve `/api/instagram-post` etc. para
  `/api/instagram?action=post` — vários endpoints são multiplexados por `action` num único arquivo

## Comandos

```
npm run dev      # vite dev server
npm run build    # tsc -b && vite build — SEMPRE rodar antes de considerar uma task pronta
npm run lint      # eslint .
npm run preview   # preview do build de produção
```

Não existe suíte de testes automatizados neste projeto — `build` + `lint` são a verificação
disponível. Teste fluxos de UI manualmente quando a mudança afeta o editor/canvas.

## Padrões dos endpoints `/api/*.js`

Os endpoints de geração via IA (`agent-chat.js`, `generate-carousel.js`, `generate-post.js`)
repetem os mesmos três padrões. Eles **não são compartilhados via módulo importado** — cada
arquivo tem sua própria cópia local das funções abaixo. Ao alterar uma regra de prompt que deveria
valer em todos os lugares (ex: anti-alucinação, anti-emoji, anti-IA-tell), edite **cada arquivo que
tiver a função**, não só um.

### 1. Retry com backoff (3 tentativas)
```js
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt)) // ou 3000 * attempt
    // ... chamada à API ...
    return res.status(200).json(parsed)
  } catch (err) {
    console.error(`[endpoint] attempt ${attempt} erro:`, err)
    if (attempt === 2) return res.status(500).json({ error: err.message })
  }
}
```
Presente em `agent-chat.js` (2x), `generate-carousel.js`, `generate-post.js`.

### 2. `extractJSON` tolerante a markdown
A resposta do modelo às vezes vem envolta em ` ```json ` ou com texto antes/depois do objeto.
`generate-carousel.js` e `generate-post.js` têm uma função `extractJSON(raw)` que tenta, em ordem:
`JSON.parse` direto → extrair bloco ` ```json...``` ` via regex → extrair o primeiro `{...}` via
regex → lançar erro. `agent-chat.js` usa a versão mais simples inline:
`raw.replace(/\`\`\`json|\`\`\`/g, '').trim()` seguido de `JSON.parse`. Ao criar um endpoint novo
que fala com um LLM, reuse esse padrão em vez de confiar que a resposta vem em JSON puro.

### 3. Funções de regras compartilhadas por arquivo
`getCurrentDateContext()` — injeta a data real do servidor no prompt, para o modelo não usar anos
desatualizados por viés de treino (ex: "2024" em vez do ano corrente).

`buildAntiHallucinationRules(dateCtx)` — regras contra datas desatualizadas, estatísticas
inventadas, emojis e tiques de escrita de IA (ver `buildAntiSlopRules` abaixo). Presente em
`agent-chat.js`, `generate-carousel.js` e `generate-post.js`.

`buildAntiSlopRules()` — regras específicas contra tiques de texto gerado por IA em legendas:
travessão como recurso estilístico, estrutura "não é apenas X, é Y", aberturas genéricas,
adjetivos de enchimento, ritmo de frase repetitivo, voz passiva. Presente em `generate-carousel.js`
e `generate-post.js`. Em `agent-chat.js` a mesma lógica está resumida dentro de
`buildAntiHallucinationRules` (o arquivo não gera legenda final, só o briefing que alimenta os
outros endpoints).

**Histórico:** `generate-post.js` (legenda do Standard, posts únicos) ficou sem essas duas funções
por um tempo depois delas serem adicionadas a `agent-chat.js`/`generate-carousel.js` — cada arquivo
tem sua cópia local, então adicionar a regra num não propaga pros outros. Resultado: o Standard
continuou gerando legendas com emoji mesmo depois da proibição "estar implementada". Ao adicionar
uma regra global de prompt daqui pra frente, edite os **três** arquivos (`agent-chat.js`,
`generate-carousel.js`, `generate-post.js`) na mesma tarefa, não só o que motivou a mudança.

### Engine standard vs premium
`agent-chat.js` sempre retorna `engine: "standard"` no JSON — a escolha entre Standard e Premium é
do usuário na interface, nunca do agente. Não mude isso sem necessidade explícita do produto.

## Canvas: escala dinâmica (não usar caixa fixa em pixels)

Padrão canônico para caber o canvas inteiro na área visível, sem cortar, em qualquer viewport:

```js
const containerRef = useRef<HTMLDivElement>(null)
const [size, setSize] = useState({ width: 0, height: 0 })
useLayoutEffect(() => {
  const el = containerRef.current
  if (!el) return
  const update = () => setSize({ width: el.clientWidth, height: el.clientHeight })
  update()
  const ro = new ResizeObserver(update)
  ro.observe(el)
  return () => ro.disconnect()
}, [/* dependência que garante que o el já está montado, ex: `ready` */])

const scale = Math.min(
  (size.width - PADDING * 2) / template.width,
  (size.height - PADDING * 2) / template.height,
)
```

Origem: `src/pages/EditorPage.tsx` (canvas principal do editor) tem esse padrão desde o início.
`src/components/CarouselViewer.tsx` reproduzia o bug duas vezes antes de ser alinhado a esse
padrão: primeiro no modo premium (caixa calculada via proporção fixa 4:5 + ResizeObserver
manual — corrigido trocando para `object-fit: contain` puro em CSS, já que ali é uma `<img>`), e
depois no modo standard (`canvasScale = Math.min(500 / width, 600 / height)` — uma caixa
**hardcoded**, não medida). O modo standard usa Konva (não `<img>`), então `object-fit` não se
aplica — a correção certa ali é medir o container real com `ResizeObserver`, replicando o padrão
do `EditorPage.tsx`, e foi isso que foi feito.

**Regra geral:** ao construir qualquer superfície de canvas/imagem que precisa caber numa área
sem cortar, comece checando se `EditorPage.tsx` já resolveu esse problema antes de inventar um
cálculo novo. Nunca hardcode uma caixa em pixels (`500x600`, `400x500`, etc.) como scale de canvas
— ela some funciona no viewport em que foi testada.

## Estado (Zustand)

`src/state/useStore.ts` define `Template`, `CanvasElement` e as ações que os manipulam
(`addTemplate`, `updateElement`, `setTemplateBackground`, `setTemplateLogo*`, etc.). Um "post" é
um `Template` com `elements[]`; um carrossel é uma lista de `Template`s com IDs
`carousel-slide-{i}`. Ao adicionar um campo novo ao `Template`, documente com um comentário
`/** ... */` acima do campo (padrão já seguido no arquivo) explicando faixa de valores e default.

## Convenções de comentário e nomenclatura

- Comentários em **português**, só quando explicam o *porquê* (uma restrição não-óbvia, um
  workaround para um bug específico, uma decisão que outra pessoa razoavelmente questionaria) —
  nunca o *o quê* (isso o código já diz). Ver exemplos reais em `CanvasEngine.tsx` e
  `CarouselViewer.tsx`.
- Arquivos de API: `kebab-case.js` (`generate-carousel.js`, `agent-chat.js`).
- Componentes React: `PascalCase.tsx`.
- Serviços/utilitários: `camelCase.ts` em `src/services/`.
- Sem testes automatizados — não crie arquivos `*.test.ts` a menos que o usuário peça
  explicitamente e configure o runner.

## Pegadinhas conhecidas

- Existem arquivos `.bak`/`.bak2`/`.bak3`/`.bak4` soltos em `src/pages/` e `src/components/`
  (ex: `PremiumPage.tsx.bak4`, `PropertiesPanel.tsx.bak`) — são backups manuais do usuário, não
  são importados em lugar nenhum. Não edite nem delete sem perguntar; não confunda com o arquivo
  ativo ao fazer busca por nome.
- As três funções de regras de prompt (`getCurrentDateContext`, `buildAntiHallucinationRules`,
  `buildAntiSlopRules`) são cópias locais em cada um dos três arquivos de geração, não um módulo
  compartilhado — já causou um bug real (regra de "sem emoji" adicionada em dois arquivos, mas
  esquecida em `generate-post.js`, que continuou gerando legenda com emoji no Standard). Ao mudar
  uma regra "global" de prompt, grep por `buildAntiHallucinationRules\|buildAntiSlopRules` em
  `api/*.js` antes de considerar a tarefa terminada.
- `vercel.json` multiplexa vários endpoints por `?action=`: `instagram.js`, `linkedin.js`,
  `stripe.js`. Ao adicionar uma ação nova a esses arquivos, adicione também o rewrite
  correspondente em `vercel.json` se precisar de uma URL amigável.
- `CONTEXT.md` é o documento de produto (modelo de negócio, features implementadas, roadmap) —
  mantenha-o atualizado quando uma feature nova entra em produção, mas não é o lugar para
  convenções de código (isso é aqui).

## Limites

- Nunca commitar `.env` / `.env.local` ou segredos.
- Chaves de API (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) só no servidor (`api/*.js`), nunca
  expostas ao client.
- Rode `npm run build` antes de git push — o deploy é automático no Vercel a cada push em `main`.
