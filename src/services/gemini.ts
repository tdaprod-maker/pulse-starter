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

// ─── Brand Context ────────────────────────────────────────────────────────────

export interface BrandContext {
  businessName?: string
  segment?: string
  tone?: string
  visualStyle?: string
  brandDescription?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`


// ─── Carrossel ────────────────────────────────────────────────────────────────

export interface CarouselSlide {
  title: string
  body?: string
  imagePrompt: string
  type: 'cover' | 'content' | 'cta'
  texts?: Record<string, string>
}

export interface CarouselResponse {
  slides: CarouselSlide[]
  caption: string
}

export async function generateCarouselContent(userInput: string, slideCount: number, brand?: BrandContext, templateId?: string): Promise<CarouselResponse> {
  const res = await fetch('/api/generate-carousel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput, slideCount, brand, templateId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body?.error ?? `Erro ${res.status} ao gerar carrossel`)
  }
  return res.json() as Promise<CarouselResponse>
}

// ─── Chamada principal ────────────────────────────────────────────────────────

export async function generatePostContent(userInput: string, brand?: BrandContext, forcedTemplate?: string): Promise<AIResponse> {
  const res = await fetch('/api/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput, brand, forcedTemplate }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body?.error ?? `Erro ${res.status} ao gerar post`)
  }
  return res.json() as Promise<AIResponse>
}

export async function analyzeVisualReferences(imageUrls: string[]): Promise<string> {
  const imageParts = await Promise.all(
    imageUrls.slice(0, 5).map(async (url) => {
      const res = await fetch(url)
      const blob = await res.blob()
      // Redimensiona para máximo 800px antes de converter
      const bitmap = await createImageBitmap(blob)
      const maxSize = 800
      const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]
      return {
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64,
        }
      }
    })
  )

  const prompt = `Você é um especialista em design e identidade visual de marcas para redes sociais.

Analise essas ${imageUrls.slice(0, 5).length} imagem(ns) de referência visual e extraia um perfil detalhado e acionável em português.

Responda SOMENTE com JSON válido, sem markdown:
{
  "estilo_geral": "descrição precisa do estilo visual (ex: esportivo e dinâmico com muito contraste, minimalista corporativo com espaço negativo, colorido e festivo com elementos gráficos)",
  "cores_predominantes": ["cor hex ou nome 1", "cor hex ou nome 2", "cor hex ou nome 3"],
  "proporcao_texto_imagem": "descrição de quanto espaço o texto ocupa vs imagem (ex: texto domina 40% do layout, imagem de fundo com overlay, texto pequeno no rodapé)",
  "estilo_tipografia": "como os textos aparecem (ex: títulos em caixa alta bold, textos curtos e impactantes, mix de tamanhos grandes e pequenos, serifado elegante)",
  "tipo_imagem": "que tipo de foto ou visual é usado (ex: atletas em ação com motion blur, produtos em fundo branco, pessoas celebrando, abstratos geométricos, paisagens urbanas)",
  "composicao": "como os elementos são organizados (ex: título no topo esquerdo com imagem ocupando 70% direito, texto centralizado sobre gradiente escuro, grade de 3 colunas)",
  "elementos_recorrentes": "elementos visuais que aparecem com frequência (ex: barra colorida lateral, moldura dourada, logo sempre no canto inferior direito, ícones esportivos)",
  "tom_visual": "sensação emocional transmitida (ex: energia e adrenalina, sofisticação e exclusividade, acolhimento e comunidade, urgência e escassez)",
  "tamanho_textos": "os títulos são curtos ou longos (ex: títulos de 1-3 palavras em destaque, frases completas de 8-12 palavras, combinação de headline curto com subtítulo longo)",
  "instrucoes_geracao": "instrução direta e específica de 3-4 linhas para a IA usar ao gerar novos posts neste estilo. Inclua dicas sobre imagePrompt, escolha de template e tom do texto"
}`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              ...imageParts,
              { text: prompt }
            ]
          }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 1000,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return text
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  return '{}'
}

export async function turboPromptEditor(userPrompt: string, brand?: BrandContext): Promise<string> {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null

  const systemContext = [
    brand?.businessName ? `Empresa: ${brand.businessName}` : '',
    brand?.segment ? `Segmento: ${brand.segment}` : '',
    toneLabel ? `Tom de voz: ${toneLabel}` : '',
    brand?.brandDescription ? `Descrição da marca: ${brand.brandDescription}` : '',
    brand?.visualStyle ? `Estilo visual: ${brand.visualStyle}` : '',
  ].filter(Boolean).join('\n')

  const prompt = `Você é um especialista em marketing de conteúdo e copywriting para redes sociais.

Contexto da marca:
${systemContext}

O usuário quer criar um post com esse tema:
"${userPrompt}"

Reescreva como um briefing rico e específico para geração de post. O briefing deve:
- Manter a intenção original do usuário
- Incluir o ângulo mais impactante do tema para o segmento da marca
- Especificar o tom emocional e o gatilho mental (urgência, curiosidade, prova social, autoridade)
- Sugerir um dado, número ou frase de impacto se aplicável
- Indicar o objetivo do post (engajar, informar, converter, inspirar)
- Máximo de 3 linhas, direto e específico
- Em português do Brasil

Responda APENAS com o briefing turbinado, sem explicações, sem aspas, sem markdown.`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return text.trim()
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  return userPrompt
}

export async function turboPrompt(userPrompt: string, brand?: BrandContext): Promise<string> {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null

  const systemContext = [
    brand?.businessName ? `Empresa: ${brand.businessName}` : '',
    brand?.segment ? `Segmento: ${brand.segment}` : '',
    toneLabel ? `Tom de voz: ${toneLabel}` : '',
    brand?.brandDescription ? `Descrição da marca: ${brand.brandDescription}` : '',
    brand?.visualStyle ? `Estilo visual: ${brand.visualStyle}` : '',
  ].filter(Boolean).join('\n')

  const prompt = `Você é um diretor de arte e especialista em prompt engineering para geração de imagens com IA.

Contexto da marca:
${systemContext}

O usuário quer criar um post para redes sociais com esse tema:
"${userPrompt}"

Reescreva como um prompt rico e preciso para geração de imagem com IA. O prompt deve incluir:
- O tema e mensagem principal do post
- Estilo visual e mood compatível com a marca (tom, segmento, personalidade)
- Direção de composição: onde fica o sujeito, onde fica o texto, hierarquia visual
- Iluminação e paleta de cores
- Referência de qualidade (ex: campanha publicitária premium, editorial de revista)
- Máximo de 4 linhas, direto e específico
- Em português do Brasil

Responda APENAS com o prompt turbinado, sem explicações, sem aspas, sem markdown.`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return text.trim()
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  return userPrompt
}

export interface PostReview {
  score_visual: number
  score_legenda: number
  pontos_positivos: string[]
  sugestoes: string[]
  resumo: string
}

export async function reviewPost(params: {
  imageBase64: string
  titulo: string
  legenda: string
  hashtags: string
  segmento?: string
  tone?: string
}): Promise<PostReview> {
  const { imageBase64, titulo, legenda, hashtags, segmento, tone } = params

  const prompt = `Você é um especialista em marketing digital e redes sociais para pequenas empresas.

Analise este post para Instagram e dê um feedback simples e encorajador.

Informações do post:
- Título/texto principal: "${titulo}"
- Legenda: "${legenda}"
- Hashtags: "${hashtags}"
${segmento ? `- Segmento da empresa: ${segmento}` : ''}
${tone ? `- Tom de voz: ${tone}` : ''}

Analise a imagem e os textos e retorne um JSON com:
{
  "score_visual": número de 0 a 10 baseado em: contraste texto/fundo, presença e tamanho do logo, qualidade da imagem, hierarquia visual,
  "score_legenda": número de 0 a 10 baseado em: clareza da mensagem, presença de CTA, adequação ao segmento, engajamento potencial,
  "pontos_positivos": ["ponto positivo 1 em linguagem simples", "ponto positivo 2"],
  "sugestoes": ["sugestão prática 1 em linguagem simples, máximo 15 palavras", "sugestão prática 2", "sugestão prática 3"],
  "resumo": "frase encorajadora de 1 linha resumindo a avaliação"
}

Use linguagem simples e encorajadora. O usuário é leigo em design e marketing.
Responda SOMENTE com JSON válido, sem markdown.`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: imageBase64.replace(/^data:image\/\w+;base64,/, '') } },
              { text: prompt }
            ]
          }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.4,
            maxOutputTokens: 600,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return JSON.parse(text) as PostReview
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  throw new Error('Falha na análise')
}

export async function generatePremiumCaption(prompt: string, brand?: BrandContext): Promise<{ instagram: string; linkedin: string; hashtags: string }> {
  try {
    const res = await fetch('/api/generate-carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        captionOnly: true,
        captionPrompt: prompt,
        brand: brand ? {
          businessName: brand.businessName,
          segment: brand.segment,
          tone: brand.tone,
        } : undefined,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      instagram: data.instagram ?? '',
      linkedin: data.linkedin ?? '',
      hashtags: data.hashtags ?? '',
    }
  } catch {
    return { instagram: '', linkedin: '', hashtags: '' }
  }
}

export async function breakCarouselIntoSlides(prompt: string, slideCount: number, brand?: BrandContext): Promise<string[]> {
  const brandCtx = brand ? `Marca: ${brand.businessName || ''}, Segmento: ${brand.segment || ''}, Tom: ${brand.tone || ''}` : ''

  const middleSlides = slideCount - 2
  const middleStructure = Array.from({length: middleSlides}, (_, i) =>
    `- Slide ${i + 2}: desenvolvimento ${i + 1} de ${middleSlides} — aborda um aspecto ÚNICO e DIFERENTE dos outros slides, com conteúdo específico e concreto sobre o tema`
  ).join('\n')

  const text = `Você é um especialista em copywriting para redes sociais.

Tema do carrossel: "${prompt}"
${brandCtx}
Número de slides: ${slideCount}

Crie EXATAMENTE ${slideCount} headlines ultra-curtos para um carrossel Instagram. Cada headline será renderizado como texto principal em uma imagem gerada por IA — por isso deve ter NO MÁXIMO 4 PALAVRAS.

Estrutura OBRIGATÓRIA:
- Slide 1 (GANCHO): headline de impacto, máximo 4 palavras, que para o scroll
${middleStructure}
- Slide ${slideCount} (CTA): ação direta, máximo 3 palavras, ex: "Fale Conosco", "Comece Agora", "Saiba Mais"

REGRAS CRÍTICAS:
- Máximo 4 palavras por headline — sem exceção
- Cada headline completamente diferente dos outros — sem repetir palavras
- Sem prefixos: não escreva "CTA:", "Gancho:", "Slide X:"
- Seja direto e impactante
- Em português do Brasil

Retorne APENAS um array JSON com ${slideCount} strings curtas. Sem markdown, sem explicações.
Exemplo para 3 slides: ["IA já chegou aqui?", "3x mais rápido", "Fale conosco"]`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      })
      const data = await res.json()
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      if (Array.isArray(parsed) && parsed.length === slideCount) return parsed
    } catch {
      if (attempt === 2) {
        // Fallback: retorna slides genéricos
        return Array.from({length: slideCount}, (_, i) =>
          i === 0 ? `Gancho: ${prompt}` :
          i === slideCount - 1 ? `CTA: Entre em contato` :
          `Ponto ${i}: ${prompt}`
        )
      }
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return Array.from({length: slideCount}, (_, i) => `Slide ${i + 1}: ${prompt}`)
}

export interface AgentMessage {
  role: 'user' | 'agent'
  content: string
}

export interface PremiumSlide {
  image: string
  label: string
}

export interface EditContext {
  templateBase: string
  format: string
  textElements: { id: string; currentValue: string; currentFill: string }[]
  accentElements: { id: string; currentColor: string }[]
  imagePrompt?: string
}

export interface EditAction {
  type: 'recolor' | 'rewrite' | 'resize' | 'recolor_background'
  elementId?: string
  fieldId?: string
  color?: string
  text?: string
  format?: string
}

export interface AgentResponse {
  ready: boolean
  message?: string
  prompt?: string
  format?: string
  mode?: 'post' | 'carousel' | 'edit'
  slideCount?: number
  templateId?: string
  engine?: 'standard' | 'premium'
  slides?: { title: string; body?: string }[]
  // Edit mode fields
  actions?: EditAction[]
  needs_confirm?: boolean
  confirm_type?: 'regenerate_image'
  confirm_prompt?: string
}

export async function agentChat(
  messages: AgentMessage[],
  brand?: BrandContext,
  lockedTemplateId?: string,
  editContext?: EditContext
): Promise<AgentResponse> {
  try {
    const res = await fetch('/api/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, brand, lockedTemplateId, editContext }),
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return await res.json() as AgentResponse
  } catch (err) {
    console.error('[agentChat] erro:', err)
    return { ready: false, message: 'Estou com instabilidade no momento. Tente enviar sua mensagem novamente em alguns segundos.' }
  }
}
