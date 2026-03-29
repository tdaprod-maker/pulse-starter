// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AIResponse {
  template: string
  texts: Record<string, string>
  accentColor?: string
  /** Prompt em inglês para gerar a imagem de fundo via Replicate. */
  imagePrompt?: string
  caption?: {
    instagram: string
    linkedin: string
    hashtags: string
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(userInput: string): string {
  return `Você é um assistente de design de posts para redes sociais.
Escolha o template mais adequado para a descrição e gere os textos.

TEMPLATES DISPONÍVEIS:
- "hero-title"     → título principal + subtítulo
  Campos: title (3-6 palavras, impactante), subtitle (8-14 palavras, explicativo)

- "big-statement"  → duas linhas curtas de impacto visual máximo
  Campos: line1 (1-3 palavras), line2 (1-3 palavras)
  Juntas formam uma frase ou contraste. Ex: line1="NOVO", line2="PRODUTO"

- "editorial-card" → layout editorial com rótulo, título e corpo
  Campos: label (1-2 palavras EM MAIÚSCULAS, ex: "DESIGN"), title (4-7 palavras), body (15-25 palavras)

- "big-number"     → número em destaque + legenda, ideal para estatísticas ou conquistas
  Campos: number (1 número ou símbolo, ex: "42", "3×", "98%"), caption (5-10 palavras)

- "food-promo"       → template para restaurantes e delivery, com nome do prato em destaque, chamada e preço
  Campos: label (categoria em maiúsculas, ex: "PIZZA", "HAMBÚRGUER"), title (nome do prato, 1-3 palavras EM MAIÚSCULAS), subtitle (preço ou chamada, ex: "R$ 49,90" ou "Peça agora!")

- "tech-news"       → posts de notícias e novidades sobre IA, tecnologia, inovação
  Campos: category (categoria em maiúsculas, ex: "INTELIGÊNCIA ARTIFICIAL"), title (headline 2 linhas, até 6 palavras EM MAIÚSCULAS, use \\n para quebrar), brand (SEMPRE use exatamente o nome da marca do usuário ou "AGENTE 17" como padrão — NUNCA coloque data, evento ou outro texto nesse campo)

- "tech-statement"  → frases de impacto, pensamentos, provocações sobre negócios e IA
  Campos: phrase (frase em maiúsculas, max 8 palavras, use \\n para quebrar em 2-3 linhas), brand (nome da marca)

- "tech-product"    → apresentação de produto, serviço ou solução de IA
  Campos: tag (categoria em maiúsculas), title (nome do produto EM MAIÚSCULAS, 1-3 palavras), subtitle (descrição curta, 8-15 palavras), cta (chamada para ação curta, ex: "Conheça agora →")

- "tech-minimal"    → frase única impactante, fundo sólido preto, sem imagem
  Campo: phrase (frase curta e poderosa, máximo 8 palavras, pode ter quebra de linha \\n)
  Exemplos: frases filosóficas sobre IA, provocações de negócio, statements minimalistas.
  IMPORTANTE: para o tech-minimal, o texto do campo phrase NUNCA deve estar em caixa alta (caps lock). Use capitalização normal, apenas a primeira letra de cada frase em maiúscula.

IMPORTANTE: Se o usuário mencionar explicitamente o nome de um template no prompt (por exemplo: "use tech-minimal", "quero no tech statement", "faz no hero title"), use obrigatoriamente esse template, ignorando as regras de seleção automática.

REGRAS DE SELEÇÃO DE TEMPLATE:
- "hero-title"      → quando há um título principal acompanhado de explicação ou subtítulo descritivo
- "big-statement"   → para declarações ousadas, lançamentos ou afirmações de impacto máximo
- "editorial-card"  → para conteúdo informativo, artigos, dicas ou textos com contexto e corpo
- "big-number"      → obrigatório quando o conteúdo contém dados, estatísticas, porcentagens ou conquistas numéricas
- "food-promo"      → obrigatório quando o conteúdo mencionar pratos, restaurante, delivery, cardápio, promoção de comida ou bebida
- "tech-news"       → quando o prompt mencionar notícia, novidade, lançamento, evento, summit, atualização de tecnologia ou IA
- "tech-statement"  → quando o prompt for uma frase, reflexão, provocação ou pensamento sobre negócios, IA ou automação
- "tech-product"    → quando o prompt mencionar produto, serviço, agente, solução, ferramenta de IA ou automação
- "tech-minimal"    → fundo sólido sem imagem, frase única e impactante de até 8 palavras. Use quando o usuário pedir algo minimalista, clean, fundo preto, ou quando a mensagem for uma frase curta e poderosa sem necessidade de imagem de fundo.

REGRAS DE COR (escolha EXATAMENTE uma das três — nenhuma outra é permitida):
- #3A5AFF (azul)   → tech, negócios, profissional, inovação, produtividade
- #FFCA1D (amarelo)→ energia, motivação, otimismo, criatividade, conquistas
- #FF6F5E (coral)  → lifestyle, alimentação, bem-estar, moda, cultura

OUTRAS REGRAS:
- Escreva em português do Brasil com tom adequado ao contexto descrito
- Para big-statement: as duas linhas devem ter peso visual equilibrado
- imagePrompt: descreva em inglês (max 20 palavras) o tema principal do post como uma cena fotográfica detalhada e realista. Inclua estilo fotográfico, iluminação e detalhes visuais relevantes.
  Ex: para comida → "traditional brazilian feijoada black bean stew with rice and orange slices, top view, professional food photography, warm lighting"
  Ex: para IA/tech → "futuristic robot hand touching digital interface, dark background, blue neon lighting, cinematic"
  Ex: para negócios → "confident business professional in modern office, natural light, shallow depth of field"

LEGENDA (campo "caption"):
Gere legendas distintas e otimizadas para cada rede social com base no conteúdo do post.

- instagram: legenda curta e impactante. Comece com uma frase de impacto ou pergunta provocativa. Tom humano, direto e envolvente. Máximo 80 palavras. Use quebras de linha para facilitar a leitura. Sem hashtags no corpo — elas ficam no campo "hashtags".

- linkedin: legenda mais longa e aprofundada. Comece com uma observação ou dado relevante que prenda a atenção. Desenvolva o tema com insights práticos ou reflexão profissional. Finalize com uma pergunta ou convite à discussão para gerar engajamento. Tom profissional mas acessível. Entre 150 e 250 palavras. Sem hashtags no corpo — elas ficam no campo "hashtags".
- hashtags: string com 5 a 8 hashtags relevantes separadas por espaço, misturando português e inglês. Ex: "#IA #automação #AItools #produtividade #inovação"
- Se a descrição do usuário contiver palavras como "call to action", "cta", "link na bio" ou "acesse", adicione um CTA natural ao final de cada legenda. Caso contrário, NÃO inclua CTA.

Descrição do usuário: "${userInput}"

Responda SOMENTE com JSON válido, sem markdown:
{
  "template": "nome-do-template",
  "texts": { "campo": "valor" },
  "accentColor": "#hexcolor",
  "imagePrompt": "scene description in english",
  "caption": {
    "instagram": "legenda para instagram",
    "linkedin": "legenda para linkedin",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3"
  }
}`
}

// ─── Parse robusto: aceita JSON puro ou embutido em markdown ──────────────────

function extractJSON(raw: string): AIResponse {
  const text = raw.trim()

  // 1. JSON puro
  try { return JSON.parse(text) } catch { /* segue */ }

  // 2. Bloco ```json ... ```
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (block) try { return JSON.parse(block[1]) } catch { /* segue */ }

  // 3. Primeiro objeto JSON encontrado no texto
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) try { return JSON.parse(obj[0]) } catch { /* segue */ }

  throw new Error('A IA retornou uma resposta que não pode ser interpretada')
}

// ─── Carrossel ────────────────────────────────────────────────────────────────

export interface CarouselSlide {
  title: string
  body?: string
  imagePrompt: string
  type: 'cover' | 'content' | 'cta'
}

export interface CarouselResponse {
  slides: CarouselSlide[]
  caption: string
}

function buildCarouselPrompt(userInput: string, slideCount: number): string {
  const contentSlides = Array.from({ length: slideCount - 2 }, () =>
    `    { "title": "...", "body": "...", "imagePrompt": "...", "type": "content" }`
  ).join(',\n')

  return `Você é um especialista em criação de carrosséis para Instagram.
Crie um carrossel com EXATAMENTE ${slideCount} slides sobre o tema descrito. NÃO crie mais nem menos que ${slideCount} slides.
REGRAS OBRIGATÓRIAS:
- Slide 1: type "cover" — título curto e impactante (máximo 5 palavras), SEM body
- Slides 2 a ${slideCount - 1}: type "content" — título direto (máximo 6 palavras) + body explicativo (máximo 2 linhas, 20 palavras)
- Slide ${slideCount}: type "cta" — título de call to action (ex: "Siga para mais conteúdo", "Salve este post"), body com instrução ou contato
REGRAS DE imagePrompt:
- Descreva em inglês (máximo 8 palavras) uma cena fotográfica real e relacionada ao slide
- Cada slide deve ter uma cena visualmente diferente mas tematicamente coerente
- Sem adjetivos de estilo, sem "cinematic", sem "dark"
REGRAS DE TEXTO:
- Escrever em português do Brasil
- Tom direto, profissional e envolvente
- Títulos sem ponto final
caption: legenda completa para Instagram com tom humano, máximo 150 palavras, incluindo 5 hashtags relevantes no final.
Tema: "${userInput}"
Responda SOMENTE com JSON válido, sem markdown, com EXATAMENTE ${slideCount} slides:
{
  "slides": [
    { "title": "...", "imagePrompt": "...", "type": "cover" },
${contentSlides},
    { "title": "...", "body": "...", "imagePrompt": "...", "type": "cta" }
  ],
  "caption": "..."
}`
}

export async function generateCarouselContent(userInput: string, slideCount: number): Promise<CarouselResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildCarouselPrompt(userInput, slideCount) }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 1200,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(body?.error?.message ?? `Erro ${res.status} da API Gemini`)
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('A API retornou uma resposta vazia')

  return extractJSON(text) as unknown as CarouselResponse
}

// ─── Chamada principal ────────────────────────────────────────────────────────

export async function generatePostContent(userInput: string): Promise<AIResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(userInput) }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(body?.error?.message ?? `Erro ${res.status} da API Gemini`)
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('A API retornou uma resposta vazia')

  return extractJSON(text)
}
