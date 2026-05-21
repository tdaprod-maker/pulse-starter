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
const API_URL_FALLBACK = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`

// ─── Prompt ───────────────────────────────────────────────────────────────────


const TEMPLATE_FIELDS: Record<string, string> = {
  'sport-arena':          'tag (categoria do evento em maiusculas), title (titulo em maiusculas, 2 linhas com \\n), subtitle (detalhe do evento)',
  'sport-brand':          'brand-label (nome da marca), phrase-line1 (1 palavra em maiusculas), phrase-line2 (1 palavra em maiusculas na cor de destaque), tagline (slogan curto com pontos separadores)',
  'food-editorial':       'label (categoria em maiusculas), dish (nome do prato, 1-2 linhas), price (preco com R$), cta (chamada curta)',
  'food-promo':           'cat (categoria em maiusculas), dish (nome do prato em maiusculas), body (acompanhamentos curtos), price (preco com R$), cta (chamada)',
  'business-statement':   'cat (categoria em maiusculas), number (numero com simbolo, ex: +47), symbol (simbolo isolado, ex: %), label (metrica em minusculas), body (contexto em 15-20 palavras)',
  'business-card':        'cat (nome da empresa em maiusculas), tag (categoria do servico em maiusculas), title (nome do servico 2-3 palavras), body (descricao curta 10-15 palavras), cta (chamada curta)',
  'health-content':       'badge (especialidade em maiusculas), title (titulo direto 4-8 palavras), body (explicacao 15-25 palavras), doctor (nome do medico), crm (especialidade e CRM)',
  'health-stats':         'cat (especialidade em maiusculas), tag (tipo do dado em maiusculas), title (pergunta ou afirmacao impactante), stat1-num (primeiro numero), stat1-label (label do primeiro numero), stat2-num (segundo numero), stat2-label (label do segundo numero), cta (chamada)',
  'build-impact':         'cat (categoria em maiusculas), number (numero com unidade, ex: +120), label (metrica em maiusculas), body (descricao da obra em 15-20 palavras)',
  'build-editorial':      'cat (tipo de empresa em maiusculas), tag (categoria do servico em maiusculas), title (nome do servico em maiusculas), body (descricao 10-15 palavras), cta (chamada)',
  'realty-premium':       'cat (tipo de imovel e bairro), tag (classificacao, ex: EXCLUSIVO), type (tipo e localizacao), title (descricao elegante do imovel), detail1-num (area), detail2-num (suites), detail3-num (vagas), price (preco formatado), cta (chamada)',
  'realty-launch':        'cat (tipo de empresa), tag (status, ex: LANCAMENTO), tag-text (texto da badge), title (nome do empreendimento em maiusculas), spec1-val (area), spec2-val (quartos), spec3-val (ano de entrega), price (preco inicial), cta (chamada)',
  'fashion-editorial':    'brand (nome da marca em maiusculas), num (numero da peca, ex: 001), title (nome da peca em portugues, pode ser em 2 linhas), cat (colecao e ano)',
  'fashion-drop':         'brand (nome da marca em maiusculas), tag (tipo de oferta, ex: SALE), label (descricao da oferta em maiusculas), line1 (primeira linha do destaque em maiusculas), line2 (segunda linha do destaque em maiusculas com %), cta (chamada)',
  'health-split':        'badge-text (nome da marca ou clinica), headline1 (2-3 palavras linha 1), headline2 (1-2 palavras linha 2), headline3 (1-2 palavras linha 3 em bold), subtitle (frase entre aspas 8-14 palavras), phone-label (servico ou beneficio ex: Entrega Gratuita), phone-number (telefone de contato)',
  'infographic-ring':    'ring-title1 (palavra ou tema em maiusculas), ring-title2 (palavra de destaque em maiusculas), num1 (01 + titulo do item), desc1 (descricao do item 1, 6-10 palavras), num2 (02 + titulo), desc2 (descricao item 2), num3 (03 + titulo), desc3 (descricao item 3), num4 (04 + titulo), desc4 (descricao item 4)',
  'realty-keys':         'headline (frase em italico 5-9 palavras sobre imovel), cta-label (instrucao de contato ex: Entre em contato!), btn-phone (telefone ou whatsapp), handle (perfil da marca ex: @suamarca)',
  'toggle-card':         'hashtag (hashtag da campanha ex: #suamarca), title (titulo de lista ou pergunta 5-9 palavras com numero), handle (perfil da marca ex: @suamarca)',
  'home-split':          'headline (frase emocional 5-9 palavras), desc-label (descricao do produto/servico 8-14 palavras), cta-label (instrucao de contato ex: Solicite o seu orcamento), cta-phone (telefone ou whatsapp), handle (perfil da marca ex: @suamarca)',
  'product-arch':        'headline (titulo em maiusculas 2-4 palavras), sub1 (frase descritiva 8-14 palavras), sub2 (frase complementar 8-14 palavras), btn-text (CTA curto 3-5 palavras)',
  'hero-gradient':       'logo-text (nome da marca em maiusculas), headline (titulo emocional 3-6 palavras), subtitle (frase de apoio 6-10 palavras)',
  'job-glass':            'company (nome da empresa), headline1 (1 palavra de impacto ex: ESTAMOS), headline2 (1 palavra ex: CONTRATANDO), role (cargo da vaga), cta-email (email de contato), deadline (data limite ex: 31 de Dezembro de 2025)',
  'editorial-card':       'label (1-2 palavras em maiusculas), title (4-7 palavras), body (15-25 palavras)',
  'tech-statement':       'phrase (frase em maiusculas max 8 palavras com \\n), brand (nome da marca)',
  'tech-news':            'category (categoria em maiusculas), title (headline 2 linhas em maiusculas com \\n), brand (nome da marca)',
  'tech-product':         'tag (categoria em maiusculas), title (nome do produto em maiusculas), subtitle (descricao 8-15 palavras), cta (chamada curta)',
  'tech-minimal':         'phrase (frase impactante em capitalizacao normal)',
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
  texts?: Record<string, string>
}

export interface CarouselResponse {
  slides: CarouselSlide[]
  caption: string
}

function buildCarouselPrompt(userInput: string, slideCount: number, brand?: BrandContext, templateId?: string): string {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null

  const templateFields = templateId ? (TEMPLATE_FIELDS[templateId] ?? '') : ''
  const templateInstruction = templateId && templateFields
    ? `\nTEMPLATE ATIVO: "${templateId}"\nCAMPOS DO TEMPLATE: ${templateFields}\nPara cada slide, preencha o campo "texts" com os IDs exatos dos campos listados acima.`
    : ''

  const exampleTexts = templateId && templateFields
    ? `"texts": { ${templateFields.split(',').map(f => `"${f.trim().split(' ')[0]}": "..."`).join(', ')} }`
    : `"texts": { "title": "...", "body": "..." }`

  return `Você é um especialista em criação de carrosséis para Instagram.
${brand?.businessName ? `\nEmpresa: ${brand.businessName}` : ''}
${brand?.segment ? `Segmento: ${brand.segment}` : ''}
${toneLabel ? `Tom de voz: ${toneLabel}` : ''}
${brand?.visualStyle ? `\nEstilo visual de referência: ${brand.visualStyle}` : ''}
${brand?.brandDescription ? `\nDescrição detalhada da marca: ${brand.brandDescription}` : ''}
${templateInstruction}
Crie um carrossel com EXATAMENTE ${slideCount} slides sobre o tema descrito. NÃO crie mais nem menos que ${slideCount} slides.
REGRAS OBRIGATÓRIAS:
- Slide 1: type "cover" — conteúdo de capa impactante
- Slides 2 a ${slideCount - 1}: type "content" — conteúdo educativo/informativo
- Slide ${slideCount}: type "cta" — call to action claro
- Cada slide deve ter conteúdo diferente mas tematicamente coerente com o anterior
- Os textos de cada slide devem ser mapeados nos campos corretos do template
REGRAS DE imagePrompt:
- Descreva em inglês (máximo 12 palavras) uma cena fotográfica real relacionada ao slide
- Cada slide deve ter uma cena visualmente diferente mas tematicamente coerente
- Não use texto, logos, marcas, hologramas ou mãos robóticas nas imagens
- Termine sempre com: "hyperrealistic, award-winning photography, no text, no logos"
REGRAS DE TEXTO:
- Escrever em português do Brasil
- Tom direto e alinhado com a marca
- Títulos sem ponto final
- Cada slide deve avançar a narrativa do anterior
caption: legenda completa para Instagram com tom humano, máximo 150 palavras, incluindo 5 hashtags relevantes no final.
Tema: "${userInput}"
Responda SOMENTE com JSON válido, sem markdown, com EXATAMENTE ${slideCount} slides:
{
  "slides": [
    { ${exampleTexts}, "imagePrompt": "...", "type": "cover" },
    { ${exampleTexts}, "imagePrompt": "...", "type": "content" },
    { ${exampleTexts}, "imagePrompt": "...", "type": "cta" }
  ],
  "caption": "..."
}`
}

export async function generateCarouselContent(userInput: string, slideCount: number, brand?: BrandContext, templateId?: string): Promise<CarouselResponse> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt))
      }
      const url = attempt === 0 ? API_URL : API_URL_FALLBACK
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildCarouselPrompt(userInput, slideCount, brand, templateId) }] }],
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
    } catch (err) {
      lastError = err as Error
    }
  }
  throw lastError
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
  const brandCtx = brand ? `
Marca: ${brand.businessName || ''}
Segmento: ${brand.segment || ''}
Tom: ${brand.tone || ''}
Descricao: ${brand.brandDescription || ''}` : ''

  const text = `Você é um especialista em marketing digital brasileiro. Crie legendas para um post gerado com IA.

Contexto do post: ${prompt}
${brandCtx}

Retorne APENAS JSON válido sem markdown:
{
  "instagram": "legenda curta e impactante para Instagram, máximo 80 palavras, tom humano e direto, sem hashtags",
  "linkedin": "legenda profissional para LinkedIn entre 150 e 250 palavras, começa com dado ou observação relevante, termina com pergunta para engajamento, sem hashtags",
  "hashtags": "6 a 8 hashtags relevantes separadas por espaço em português e inglês"
}`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const url = attempt < 2
? API_URL
        : API_URL_FALLBACK
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: { temperature: 0.7 },
        }),
      })
      const data = await res.json()
      console.log('[caption] raw response:', JSON.stringify(data).slice(0, 200))
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return {
        instagram: parsed.instagram ?? '',
        linkedin: parsed.linkedin ?? '',
        hashtags: parsed.hashtags ?? '',
      }
    } catch {
      if (attempt === 2) return { instagram: '', linkedin: '', hashtags: '' }
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return { instagram: '', linkedin: '', hashtags: '' }
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

export interface AgentResponse {
  ready: boolean
  message?: string
  prompt?: string
  format?: string
  mode?: 'post' | 'carousel'
  slideCount?: number
  templateId?: string
}

export async function agentChat(
  messages: AgentMessage[],
  brand?: BrandContext,
  lockedTemplateId?: string
): Promise<AgentResponse> {
  try {
    const res = await fetch('/api/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, brand, lockedTemplateId }),
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return await res.json() as AgentResponse
  } catch (err) {
    console.error('[agentChat] erro:', err)
    return { ready: false, message: 'Estou com instabilidade no momento. Tente enviar sua mensagem novamente em alguns segundos.' }
  }
}
