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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, slideIndex, totalSlides, styleContext, segment, size, visualReferences, slideTitle, slideBody } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  // Presente apenas em slides de carrossel premium
  const carouselTextOverlay = slideTitle ? `

CAROUSEL SLIDE TEXT OVERLAY — MANDATORY OVERRIDE:
This image is slide ${slideIndex} of ${totalSlides} in an Instagram carousel. This requirement overrides the "Typography is secondary" rule above.
${slideBody
  ? `Render ONLY this exact text visible in the image: "${slideTitle}" as the headline, and "${slideBody}" as a short supporting subtitle. Nothing else. No bullet points, no icons with labels, no lists, no additional text sections.`
  : `Render ONLY this exact text visible in the image: "${slideTitle}". Nothing else. No subtitles, no bullet points, no icons with labels, no lists, no multiple text sections.`}
Text placement rules:
- Position in the lower-center or center zone of the image
- Ensure high contrast: white text on dark areas, or dark text on light areas, or use a semi-transparent background strip
- Typography must be elegant and modern, matching the brand style
- Text in Portuguese (Brazil) as provided above — do NOT translate or change it` : ''

  const visualStyleDirective = styleForSegment(segment || styleContext)

  const photoIdentityRule = visualReferences?.length
    ? '\n- CRITICAL: Use the provided photo as the main subject. Preserve the person\'s face and identity exactly. Enhance lighting and background only.'
    : ''

  const fullPrompt = `You are a professional social media art director generating a high-quality image.

BRAND VISUAL STYLE (follow strictly):
${styleContext || 'clean, minimal, professional'}

VISUAL STYLE DIRECTION: ${visualStyleDirective}

VISUAL BRIEF:
${prompt}

VISUAL SUBJECT RULE (most important rule — read carefully):
- If the brief describes a real person, food dish, physical product, animal, or real location: that subject MUST be rendered as the PHOTOREALISTIC main visual element. The person or subject is the hero of the image. Render them realistically, prominently, clearly.${slideTitle ? ' Typography is essential — see CAROUSEL SLIDE TEXT OVERLAY section below.' : ' Typography is secondary — one minimal text overlay at most.'}
- If the brief is purely informational or typographic (no specific visual subject described): create a strong typographic composition with large, bold text as the focal point.

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
- CRITICAL COMPOSITION: One dominant subject. Generous white space. Text placed in lower third or upper third, never center. The image must breathe.${photoIdentityRule}
${carouselTextOverlay}
QUALITY STANDARD: Photorealistic and polished — indistinguishable from a premium photo shoot or agency design.`

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
