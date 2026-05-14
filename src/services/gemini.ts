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
  'hero-title':           'title (titulo principal 3-6 palavras), subtitle (subtitulo explicativo 8-14 palavras)',
  'big-statement':        'line1 (1-3 palavras), line2 (1-3 palavras)',
  'editorial-card':       'label (1-2 palavras em maiusculas), title (4-7 palavras), body (15-25 palavras)',
  'big-number':           'number (numero ou simbolo), caption (5-10 palavras)',
  'tech-statement':       'phrase (frase em maiusculas max 8 palavras com \\n), brand (nome da marca)',
  'tech-news':            'category (categoria em maiusculas), title (headline 2 linhas em maiusculas com \\n), brand (nome da marca)',
  'tech-product':         'tag (categoria em maiusculas), title (nome do produto em maiusculas), subtitle (descricao 8-15 palavras), cta (chamada curta)',
  'tech-minimal':         'phrase (frase impactante em capitalizacao normal)',
}


function buildPrompt(userInput: string, brand?: BrandContext, forcedTemplate?: string): string {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null
  return `Você é um assistente de design de posts para redes sociais.
Escolha o template mais adequado para a descrição e gere os textos.
${brand?.businessName ? `\nEmpresa: ${brand.businessName}` : ''}
${brand?.segment ? `Segmento: ${brand.segment}` : ''}
${toneLabel ? `Tom de voz: ${toneLabel}` : ''}
${brand?.visualStyle ? `\nEstilo visual de referência: ${brand.visualStyle}` : ''}
${brand?.brandDescription ? `\nDescrição detalhada da marca: ${brand.brandDescription}` : ''}

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

- "food-promo"       → layout claro premium para restaurantes e delivery, com nome do prato bold e preço em destaque
  Campos: cat (categoria em maiúsculas, ex: "PIZZA DO DIA", "HAMBÚRGUER"), dish (nome do prato EM MAIÚSCULAS, 1-3 palavras, use \\n para quebrar), body (acompanhamentos ou descrição curta, 4-8 palavras), price (preço, ex: "R$ 49,90"), cta (chamada curta, ex: "PEÇA AGORA")

- "food-editorial"   → layout editorial escuro, premium, estilo restaurante sofisticado ou alta gastronomia
  Campos: label (categoria em maiúsculas, ex: "PRATO PRINCIPAL", "ENTRADA"), dish (nome do prato com capitalização normal, 1-2 linhas, use \\n para quebrar, ex: "Risoto de\nTrufas"), price (preço, ex: "R$ 89,00"), cta (chamada curta, ex: "RESERVE JÁ")

- "tech-news"       → posts de notícias, novidades e destaques sobre qualquer tema ou segmento
  Campos: category (categoria em maiúsculas, ex: "INTELIGÊNCIA ARTIFICIAL"), title (headline 2 linhas, até 6 palavras EM MAIÚSCULAS, use \\n para quebrar), brand (SEMPRE use exatamente o nome da marca do usuário ou "AGENTE 17" como padrão — NUNCA coloque data, evento ou outro texto nesse campo)

- "sport-arena"       → posts esportivos com evento, resultado ou convocação. Ideal para times, academias e competições
  Campos: tag (categoria em maiúsculas, ex: "CAMPEONATO PAULISTA", "TREINO DO DIA"), title (título em maiúsculas, EXATAMENTE 2 linhas, use \n para quebrar, cada linha com NO MÁXIMO 2 palavras curtas, ex: "BORA\nJOGAR!", "É DIA\nDE JOGO!", "VAMOS\nVENCER!"), subtitle (detalhe do evento, ex: "Sub-11 · Sábado 15h · Arena Central")

- "business-statement" → posts com dado numérico de impacto, resultado, conquista ou estatística de negócios
  Campos: cat (categoria em maiúsculas, ex: "RESULTADO Q1 2026"), number (número com símbolo, ex: "+47", "3×", "98"), symbol (símbolo isolado, ex: "%", "K", "×"), label (métrica em minúsculas, ex: "de crescimento no período"), body (contexto em 15-20 palavras)

- "business-card"      → apresentação de empresa, serviço ou solução profissional
  Campos: cat (nome da empresa em maiúsculas), tag (categoria do serviço em maiúsculas, ex: "CONSULTORIA"), title (nome do serviço, 2-3 palavras), body (descrição curta, 10-15 palavras), cta (chamada curta, ex: "SAIBA MAIS →")

- "tech-statement"  → frases de impacto, pensamentos e declarações poderosas sobre qualquer tema
  Campos: phrase (frase em maiúsculas, max 8 palavras, use \\n para quebrar em 2-3 linhas), brand (nome da marca)

- "tech-product"    → apresentação de produto, serviço ou solução de qualquer segmento
  Campos: tag (categoria em maiúsculas), title (nome do produto EM MAIÚSCULAS, 1-3 palavras), subtitle (descrição curta, 8-15 palavras), cta (chamada para ação curta, ex: "Conheça agora →")

- "tech-minimal"    → frase única impactante, fundo sólido, sem imagem. Ideal para citações, pensamentos e declarações marcantes de qualquer segmento
  IMPORTANTE: para o tech-minimal, o texto do campo phrase NUNCA deve estar em caixa alta (caps lock). Use capitalização normal, apenas a primeira letra de cada frase em maiúscula.

IMPORTANTE PRIORITARIO: Se um template foi pre-selecionado pelo usuario, use OBRIGATORIAMENTE esse template, ignorando todas as regras de selecao automatica.${forcedTemplate ? `\nTEMPLATE OBRIGATORIO: "${forcedTemplate}"\nCAMPOS OBRIGATORIOS PARA ESTE TEMPLATE: ${TEMPLATE_FIELDS[forcedTemplate] ?? 'use os campos mais adequados ao template'}` : ''}

IMPORTANTE: Se o usuário mencionar explicitamente o nome de um template no prompt (por exemplo: "use tech-minimal", "quero no tech statement", "faz no hero title"), use obrigatoriamente esse template, ignorando as regras de seleção automática.

REGRAS DE SELEÇÃO DE TEMPLATE:
- "hero-title"      → quando há um título principal acompanhado de explicação ou subtítulo descritivo
- "big-statement"   → para declarações ousadas, lançamentos ou afirmações de impacto máximo
- "editorial-card"  → para conteúdo informativo, artigos, dicas ou textos com contexto e corpo
- "big-number"      → obrigatório quando o conteúdo contém dados, estatísticas, porcentagens ou conquistas numéricas
- "food-editorial"  → obrigatório quando o conteúdo mencionar restaurante premium, alta gastronomia, prato especial, menu degustação, chef ou experiência gastronômica sofisticada
- "food-promo"      → obrigatório quando o conteúdo mencionar pratos, restaurante, delivery, cardápio, promoção de comida ou bebida (use food-editorial se o contexto for premium/sofisticado)
- "tech-news"       → quando o prompt mencionar notícia, novidade, lançamento, evento, summit, atualização de tecnologia ou IA
- "sport-arena"        → obrigatório quando o conteúdo mencionar esporte, time, jogo, partida, campeonato, treino, academia, competição ou resultado esportivo
- "business-statement" → obrigatório quando o prompt contiver números, porcentagens, estatísticas, metas, resultados ou conquistas de negócios
- "business-card"      → quando o prompt mencionar apresentação de empresa, serviço, produto, solução ou proposta de valor profissional
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

function buildCarouselPrompt(userInput: string, slideCount: number, brand?: BrandContext): string {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null
  const contentSlides = Array.from({ length: slideCount - 2 }, () =>
    `    { "title": "...", "body": "...", "imagePrompt": "...", "type": "content" }`
  ).join(',\n')

  return `Você é um especialista em criação de carrosséis para Instagram.
${brand?.businessName ? `\nEmpresa: ${brand.businessName}` : ''}
${brand?.segment ? `Segmento: ${brand.segment}` : ''}
${toneLabel ? `Tom de voz: ${toneLabel}` : ''}
${brand?.visualStyle ? `\nEstilo visual de referência: ${brand.visualStyle}` : ''}
${brand?.brandDescription ? `\nDescrição detalhada da marca: ${brand.brandDescription}` : ''}
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

export async function generateCarouselContent(userInput: string, slideCount: number, brand?: BrandContext): Promise<CarouselResponse> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
      }
      const url = attempt < 2 ? API_URL : API_URL_FALLBACK
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildCarouselPrompt(userInput, slideCount, brand) }] }],
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
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
      }
      const url = attempt < 2 ? API_URL : API_URL_FALLBACK
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(userInput, brand, forcedTemplate) }] }],
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
      return extractJSON(text) as unknown as AIResponse
    } catch (err) {
      lastError = err as Error
    }
  }
  throw lastError
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

  const prompt = `Você é um especialista em criação de conteúdo para redes sociais.

Contexto da marca:
${systemContext}

O usuário digitou esse prompt simples para gerar um post:
"${userPrompt}"

Reescreva esse prompt de forma mais rica e específica, incorporando o contexto da marca. O prompt turbinado deve:
- Manter a intenção original do usuário
- Incluir detalhes específicos do segmento e tom de voz da marca
- Ser mais descritivo e direcionado
- Ter no máximo 2 linhas
- Estar em português do Brasil

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
      const res = await fetch(`${url}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: { response_mime_type: 'application/json', temperature: 0.7 },
        }),
      })
      const data = await res.json()
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
