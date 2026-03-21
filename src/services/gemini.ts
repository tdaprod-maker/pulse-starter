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

- "minimal-type"   → uma única frase contemplativa e minimalista
  Campo: phrase (5-10 palavras; use \\n para quebrar em 2 linhas, ex: "Menos ruído,\\nmais essência.")

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
- "minimal-type"    → somente para frases curtas, pensamentos, citações ou conteúdo contemplativo
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
- imagePrompt: descreva em inglês (max 8 palavras) o tema principal do post como uma cena fotográfica real e reconhecível.
  Foque no objeto ou contexto central — sem adjetivos de estilo, sem "cinematic", sem "dark".
  Ex: para comida → "italian chicken parmesan dish close up"
      para esporte → "soccer ball on grass field"
      para negócios → "business people networking handshake office"
      para motivação → "person running at sunrise mountain trail"

LEGENDA (campo "caption"):
Gere legendas para redes sociais com base no conteúdo do post.
- instagram: legenda direta, tom humano e envolvente, máximo 150 palavras, sem hashtags no corpo do texto.
- linkedin: tom mais profissional e reflexivo, máximo 200 palavras, sem hashtags no corpo do texto.
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
