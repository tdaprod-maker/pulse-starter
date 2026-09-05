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
  logoUrl?: string
  nichoInfo?: Record<string, string> | null
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

/** CarouselSlide já com a imagem gerada — formato usado no viewer e nos callbacks de geração. */
export type SlideWithImage = CarouselSlide & { imageUrl: string }

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

export async function generatePostContent(userInput: string, brand?: BrandContext, forcedTemplate?: string, lastUsedTemplate?: string): Promise<AIResponse> {
  const res = await fetch('/api/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput, brand, forcedTemplate, lastUsedTemplate }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body?.error ?? `Erro ${res.status} ao gerar post`)
  }
  return res.json() as Promise<AIResponse>
}

export interface VisualReferenceAnalysis {
  estilo_geral?: string
  cores_predominantes?: string[]
  proporcao_texto_imagem?: string
  estilo_tipografia?: string
  tipo_imagem?: string
  composicao?: string
  elementos_recorrentes?: string
  tom_visual?: string
  tamanho_textos?: string
  instrucoes_geracao?: string
}

/** Analisa até 5 imagens de referência via Claude Haiku (server-side, api/analyze-references.js)
 *  e retorna o perfil visual como string JSON — mesmo formato salvo em brand_config.visual_style
 *  e usado como contexto bruto nos prompts de geração (ver `brand?.visualStyle` em generate-post.js). */
export async function analyzeVisualReferences(imageUrls: string[]): Promise<string> {
  const res = await fetch('/api/analyze-references', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrls: imageUrls.slice(0, 5) }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body?.error ?? `Erro ${res.status} ao analisar referências`)
  }
  const data = await res.json() as VisualReferenceAnalysis
  return JSON.stringify(data)
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

/** Revisão de design de um post pronto via Claude Haiku (server-side, api/review-post.js). */
export async function reviewPost(params: {
  imageBase64: string
  titulo: string
  legenda: string
  hashtags: string
  segmento?: string
  tone?: string
}): Promise<PostReview> {
  const res = await fetch('/api/review-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body?.error ?? `Erro ${res.status} ao revisar post`)
  }
  return res.json() as Promise<PostReview>
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

/**
 * Ajuste pós-geração de uma imagem Premium já pronta: manda a imagem gerada como
 * base (visualReferences) + o pedido do usuário. `mode` controla a diretiva usada
 * pelo endpoint:
 * - 'adjust' (default): preservação total — só aplica a mudança pontual pedida
 *   ("escurece o fundo", "texto branco"). Sem safe-zone / overlay de texto /
 *   letterboxing.
 * - 'recompose': mantém a(s) pessoa(s) e o texto embutido, mas recria o
 *   ambiente/cenário ao redor conforme a instrução.
 * Serve tanto para post único quanto para 1 slide de carrossel Premium. `size`
 * deve ser um dos formatos aceitos pelo gpt-image-2 ('1024x1024', '1024x1536',
 * '1536x1024') e casar com a orientação da base.
 */
export async function adjustPremiumImage(params: {
  instruction: string
  baseImage: string
  size: string
  segment?: string
  styleContext?: string
  mode?: 'adjust' | 'recompose'
}): Promise<{ image: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 55000)
  try {
    const res = await fetch('/api/generate-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: params.instruction,
        editMode: params.mode ?? 'adjust',
        visualReferences: [params.baseImage],
        size: params.size,
        segment: params.segment,
        styleContext: params.styleContext,
        slideIndex: 1,
        totalSlides: 1,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(err.error ?? `Erro ${res.status} ao ajustar imagem premium`)
    }
    const data = await res.json() as { image?: string }
    if (!data.image) throw new Error('Nenhuma imagem retornada pela API')
    return { image: data.image }
  } catch (e: unknown) {
    clearTimeout(timeoutId)
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Tempo limite atingido (55s). O ajuste premium pode demorar mais do que o plano atual permite — tente novamente.')
    }
    throw e
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
  aspectRatio?: string
}

export interface EditContext {
  templateBase: string
  format: string
  textElements: { id: string; currentValue: string; currentFill: string }[]
  accentElements: { id: string; currentColor: string }[]
  overlayElements: { id: string; currentOpacity: number; currentFill: string }[]
  imagePrompt?: string
  logoSize?: number
}

export interface EditAction {
  type: 'recolor' | 'rewrite' | 'resize' | 'recolor_background' | 'overlay_opacity' | 'overlay_color' | 'add_logo' | 'remove_logo' | 'resize_logo' | 'move_logo'
  elementId?: string
  fieldId?: string
  color?: string
  text?: string
  format?: string
  opacity?: number
  logoUrl?: string
  corner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  logoSize?: number
  position?: string
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
  /** Estilo visual sugerido pelo agente: "photo" (padrão, fotorrealista), "illustration" (ilustração/flat design) ou "typography" (foco em texto, sem elemento visual complexo). */
  visualStyle?: 'photo' | 'illustration' | 'typography'
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
