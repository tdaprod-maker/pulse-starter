export const config = { maxDuration: 60 }

function styleForSegment(text) {
  const t = (text || '').toLowerCase()
  if (/food|restaurant|gastronom|comida|culin[aá]ria|card[aá]pio|delivery|chef|bebida/.test(t)) {
    return 'warm cinematic lighting, shallow depth of field, editorial food photography'
  }
  if (/health|sa[uú]de|cl[ií]nic|medic|farm[aá]c|hospital|dentist|odont|paciente/.test(t)) {
    return 'clean clinical aesthetic, soft natural light, professional healthcare photography'
  }
  if (/tech|\bia\b|intelig[eê]ncia artificial|software|startup|\bai\b|saas|agente/.test(t)) {
    return 'dark background, blue/purple neon accents, cinematic corporate photography'
  }
  if (/im[óo]v|constru|realty|real estate|arquitet|imobili[aá]ri/.test(t)) {
    return 'architectural photography, golden hour lighting, aspirational lifestyle'
  }
  if (/moda|fashion|beleza|beauty|cosm[eé]tic|est[eé]tica/.test(t)) {
    return 'high fashion editorial, studio lighting, luxury brand aesthetic'
  }
  return 'cinematic photography, professional lighting, editorial style'
}

function illustrationStyleForSegment(text) {
  const t = (text || '').toLowerCase()
  if (/food|restaurant|gastronom|comida|culin[aá]ria|card[aá]pio|delivery|chef|bebida/.test(t)) {
    return 'warm flat illustration, appetizing color palette, simple food iconography'
  }
  if (/health|sa[uú]de|cl[ií]nic|medic|farm[aá]c|hospital|dentist|odont|paciente/.test(t)) {
    return 'clean clinical flat illustration, calming pastel palette, simple medical iconography'
  }
  if (/tech|\bia\b|intelig[eê]ncia artificial|software|startup|\bai\b|saas|agente/.test(t)) {
    return 'modern tech flat illustration, dark background with blue/purple accent shapes, geometric iconography'
  }
  if (/im[óo]v|constru|realty|real estate|arquitet|imobili[aá]ri/.test(t)) {
    return 'architectural flat illustration, warm golden-hour palette, simplified building shapes'
  }
  if (/moda|fashion|beleza|beauty|cosm[eé]tic|est[eé]tica/.test(t)) {
    return 'elegant fashion flat illustration, refined color palette, minimal luxury iconography'
  }
  return 'professional flat illustration, clean editorial color palette'
}

// Regras específicas por estilo visual — sujeito, padrão de qualidade e negative
// prompt mudam bastante entre foto realista, ilustração vetorial e composição
// tipográfica pura, então cada um tem seu próprio bloco em vez de forçar as
// mesmas instruções fotográficas em todos os casos.
const SUBJECT_RULE_BY_STYLE = {
  photo: (slideTitle) => `- If the brief describes a real person, food dish, physical product, animal, or real location: that subject MUST be rendered as the PHOTOREALISTIC main visual element. The person or subject is the hero of the image. Render them realistically, prominently, clearly.${slideTitle ? ' Typography is essential — see CAROUSEL SLIDE TEXT OVERLAY section below.' : ' Typography is secondary — one minimal text overlay at most.'}
- If the brief is purely informational or typographic (no specific visual subject described): create a strong typographic composition with large, bold text as the focal point.`,
  illustration: (slideTitle) => `- Render the subject described in the VISUAL BRIEF as a professional vector illustration / flat design graphic — NOT a photograph. Use clean geometric shapes, bold flat colors, confident line work, and simple gradients if any. Style reference: modern SaaS/editorial flat illustration systems (e.g. Stripe, Notion, premium design agency work).
- No photographic textures, no photorealistic skin/materials, no 3D render, no photo-collage. Keep a single consistent illustration style throughout the image.${slideTitle ? ' Typography is essential — see CAROUSEL SLIDE TEXT OVERLAY section below.' : ' Typography is secondary — one minimal text overlay at most.'}`,
  typography: () => `- Do NOT render any photographic or illustrated subject. This is a purely typographic composition — large, bold text IS the entire visual. No people, no products, no photographic background, no complex illustration.
- Background must be a simple solid color, subtle gradient, or minimal geometric shape/pattern that supports the text without competing with it. Typography is always the primary and essential element, regardless of slide title presence.`,
}

const QUALITY_STANDARD_BY_STYLE = {
  photo: 'Photorealistic and polished — indistinguishable from a premium photo shoot or agency design.',
  illustration: "Polished professional vector illustration — indistinguishable from a premium design agency's custom illustration system.",
  typography: 'Polished minimalist typographic design — indistinguishable from a premium editorial or brand campaign title card.',
}

const AVOID_BY_STYLE = {
  photo: 'generic AI aesthetics, plastic skin, symmetrical faces, oversaturated colors, fake HDR, dramatic god rays, floating particles, lens flares, glowing edges, perfect smiles, perfect hands, perfect offices, exaggerated reflections, random futuristic elements, visual clutter, stock photo feeling, cheap advertising aesthetic, CGI appearance, overly polished rendering, neon colors, excessive gradients',
  illustration: 'photographic realism, photo textures, 3D render, CGI, stock photo look, blurry raster edges, inconsistent illustration styles mixed in one image, generic meaningless AI illustration clichés (random floating blobs/shapes), muddy colors, low-contrast flat shapes, visual clutter',
  typography: 'photographic elements, realistic people or objects, complex illustrations, busy or noisy backgrounds, stock photo textures, 3D render, gradients or shapes that compete with the text, visual clutter',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, slideIndex, totalSlides, styleContext, segment, size, visualReferences, slideTitle, slideBody, visualStyle } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const resolvedVisualStyle = visualStyle === 'illustration' || visualStyle === 'typography' ? visualStyle : 'photo'

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  // Presente apenas em slides de carrossel premium
  const carouselTextOverlay = slideTitle ? `

CAROUSEL SLIDE TEXT OVERLAY — MANDATORY OVERRIDE:
This image is slide ${slideIndex} of ${totalSlides} in an Instagram carousel. This requirement takes priority over any conflicting typography guidance above.
${slideBody
  ? `Render ONLY this exact text visible in the image: "${slideTitle}" as the headline, and "${slideBody}" as a short supporting subtitle. Nothing else. No bullet points, no icons with labels, no lists, no additional text sections.`
  : `Render ONLY this exact text visible in the image: "${slideTitle}". Nothing else. No subtitles, no bullet points, no icons with labels, no lists, no multiple text sections.`}
Text placement rules:
- Position in the lower-center or center zone of the image
- Ensure high contrast: white text on dark areas, or dark text on light areas, or use a semi-transparent background strip
- Typography must be elegant and modern, matching the brand style
- Text in Portuguese (Brazil) as provided above — do NOT translate or change it
- Typography consistency is critical: use only a single clean sans-serif typeface (like Helvetica, Arial or similar) throughout the entire image. Bold weight for headline, regular weight for subtitle. No decorative fonts, no mixed typefaces.
- CRITICAL SAFE ZONE (Instagram compliance): For a 1080x1350px (4:5) canvas, keep all text and logo elements within a safe zone of 1012x1230px centered in the image — that means a margin of approximately 34px from left/right edges and 60px from top/bottom edges. Scale this proportionally for other aspect ratios (1:1, 9:16, 16:9): maintain roughly 3% margin on left/right and 4.5% margin on top/bottom relative to canvas dimensions. NEVER place text or logo outside this safe zone. This is mandatory for correct display in Instagram feed and profile grid without cropping.
- CRITICAL FONT SIZE: All text must be large enough to be read clearly on a mobile phone screen at normal viewing distance. Headline text should be bold and occupy significant visual weight. Never use small, thin, or delicate typography for headlines. Body text should be at minimum 60% the size relative to headline for clear hierarchy.
- CRITICAL SPELLING ACCURACY: reproduce the text EXACTLY character by character as provided, including all accents (á, é, í, ó, ú, â, ê, ô, ã, õ, ç) and diacritics. Double-check Portuguese special characters before finalizing — common errors include confusing ã with ãi, é with ê, ó with õ. The text must be spelled perfectly matching the input, letter by letter.` : ''

  const visualStyleDirective = resolvedVisualStyle === 'illustration'
    ? illustrationStyleForSegment(segment || styleContext)
    : resolvedVisualStyle === 'typography'
    ? 'minimalist typographic design, generous negative space, no photographic or illustrated elements'
    : styleForSegment(segment || styleContext)

  // Seção dedicada (não só um bullet perdido em MANDATORY RULES) para dar o máximo
  // de peso possível à preservação de identidade — GPT Image 2 tende a distorcer
  // rostos, duplicar pessoas com o mesmo rosto e criar desproporções quando há
  // foto de referência com pessoas.
  const photoIdentitySection = visualReferences?.length ? `

CRITICAL FACE AND IDENTITY PRESERVATION:
When a reference photo is provided, you MUST preserve the exact facial features, proportions, and identity of every person shown. Do NOT alter, distort, duplicate, or generate variations of any face. Do NOT create multiple people with similar or identical faces unless the reference photo already shows multiple distinct people — in that case, preserve each person's individual distinct features exactly. Do NOT change body proportions, facial structure, or any physical characteristic. The person(s) in the output must be immediately recognizable as the exact same person(s) from the reference photo. Any deviation from the reference photo's human features is a critical failure.` : ''

  const fullPrompt = `Make an image that nobody would suspect was generated by AI.

You are a professional social media art director generating a high-quality image.

BRAND VISUAL STYLE (follow strictly):
${styleContext || 'clean, minimal, professional'}

VISUAL STYLE DIRECTION: ${visualStyleDirective}

VISUAL BRIEF:
${prompt}

VISUAL SUBJECT RULE (most important rule — read carefully):
${SUBJECT_RULE_BY_STYLE[resolvedVisualStyle](slideTitle)}
${photoIdentitySection}

MANDATORY RULES:
- Clean layout with generous negative space — no clutter
- Dark or neutral background — no loud gradients
- NO: neon glows, particle effects, lens flares, holographic elements, robotic hands, AI chip imagery unless explicitly requested
- NO: generic AI stock imagery (blue brain, neural networks, glowing circuits)
- If the brand has a defined visual style, replicate it: colors, typography weight, spacing, mood
- CRITICAL: Place all key elements in the CENTER 60% of image width and CENTER 70% of image height only
- CRITICAL: Outer edges must be empty or background only — no text or subjects near edges
- CRITICAL: Do NOT include any logo or brand mark — the logo will be overlaid separately
- CRITICAL TEXT LIMIT: Use NO MAXIMUM 2 lines of headline text and 1 short subtitle. NO bullet points, NO icons with labels, NO lists, NO multiple sections of text. One powerful message only. White space is design.
- CRITICAL COMPOSITION: One dominant subject. Generous white space. Text placed in lower third or upper third, never center. The image must breathe.
- CRITICAL SAFE ZONE (Instagram compliance): For a 1080x1350px (4:5) canvas, keep all text and logo elements within a safe zone of 1012x1230px centered in the image — that means a margin of approximately 34px from left/right edges and 60px from top/bottom edges. Scale this proportionally for other aspect ratios (1:1, 9:16, 16:9): maintain roughly 3% margin on left/right and 4.5% margin on top/bottom relative to canvas dimensions. NEVER place text or logo outside this safe zone. This is mandatory for correct display in Instagram feed and profile grid without cropping.
- CRITICAL FONT SIZE: All text must be large enough to be read clearly on a mobile phone screen at normal viewing distance. Headline text should be bold and occupy significant visual weight. Never use small, thin, or delicate typography for headlines. Body text should be at minimum 60% the size relative to headline for clear hierarchy.
- CRITICAL SPELLING ACCURACY: reproduce the text EXACTLY character by character as provided, including all accents (á, é, í, ó, ú, â, ê, ô, ã, õ, ç) and diacritics. Double-check Portuguese special characters before finalizing — common errors include confusing ã with ãi, é with ê, ó with õ. The text must be spelled perfectly matching the input, letter by letter.
${carouselTextOverlay}
QUALITY STANDARD: ${QUALITY_STANDARD_BY_STYLE[resolvedVisualStyle]}

Avoid: ${AVOID_BY_STYLE[resolvedVisualStyle]}.`

  try {
    // Se tem referência de imagem (base64 ou URL), usa edits
    const refImage = visualReferences?.[0]
    
    if (refImage) {
      // Converte base64 para blob via fetch de data URL
      let imageBuffer
      if (refImage.startsWith('data:')) {
        const base64Data = refImage.split(',')[1]
        imageBuffer = Buffer.from(base64Data, 'base64')
      } else {
        // É uma URL — faz fetch
        const imgRes = await fetch(refImage)
        const ab = await imgRes.arrayBuffer()
        imageBuffer = Buffer.from(ab)
      }

      // Monta FormData manualmente
      const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
      const CRLF = '\r\n'
      
      const parts = []
      
      // model
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}gpt-image-2`)
      // prompt
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="prompt"${CRLF}${CRLF}${fullPrompt}`)
      // n
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="n"${CRLF}${CRLF}1`)
      // size
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="size"${CRLF}${CRLF}${size || '1024x1024'}`)
      // quality
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="quality"${CRLF}${CRLF}medium`)

      const preamble = parts.join(CRLF) + CRLF
      const imageHeader = `--${boundary}${CRLF}Content-Disposition: form-data; name="image"; filename="reference.png"${CRLF}Content-Type: image/png${CRLF}${CRLF}`
      const epilogue = `${CRLF}--${boundary}--`

      const body = Buffer.concat([
        Buffer.from(preamble),
        Buffer.from(imageHeader),
        imageBuffer,
        Buffer.from(epilogue),
      ])

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length.toString(),
        },
        body,
      })

      const responseText = await response.text()
      console.log('[premium] edits status:', response.status)
      console.log('[premium] edits preview:', responseText.substring(0, 300))

      if (response.ok) {
        const data = JSON.parse(responseText)
        const item = data.data?.[0]
        if (item?.b64_json) {
          return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` })
        }
        if (item?.url) {
          const imgRes = await fetch(item.url)
          const ab = await imgRes.arrayBuffer()
          const b64 = Buffer.from(ab).toString('base64')
          return res.status(200).json({ image: `data:image/png;base64,${b64}` })
        }
      }
      // Se edits falhou, cai no fallback abaixo
      console.log('[premium] edits failed, falling back to generations')
    }

    // Fallback: generations sem referência
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: fullPrompt,
        n: 1,
        size: size || '1024x1024',
        quality: 'medium',
      }),
    })

    const responseText = await response.text()
    console.log('[premium] generations status:', response.status)

    if (!response.ok) {
      return res.status(500).json({ error: `OpenAI API error: ${responseText}` })
    }

    const data = JSON.parse(responseText)
    const item = data.data?.[0]

    if (item?.b64_json) {
      return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` })
    }
    if (item?.url) {
      const imgRes = await fetch(item.url)
      const ab = await imgRes.arrayBuffer()
      const b64 = Buffer.from(ab).toString('base64')
      return res.status(200).json({ image: `data:image/png;base64,${b64}` })
    }

    return res.status(500).json({ error: 'No image returned from OpenAI' })

  } catch (err) {
    console.error('[generate-premium] erro:', err)
    return res.status(500).json({ error: `Internal server error: ${err.message}` })
  }
}
