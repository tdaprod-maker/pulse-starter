export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, slideIndex, totalSlides, styleContext, size, visualReferences } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  const SEGMENT_PERSON = {
    'Restaurante / Food': 'a confident Latin American woman chef in her 30s, natural curly hair, wearing a clean apron, warm expression, kitchen or food styling environment',
    'Consultoria / Serviços': 'a sharp Black professional man in his 40s, fitted blazer, no tie, calm and authoritative presence, modern office environment',
    'Varejo / E-commerce': 'a young Southeast Asian woman in her late 20s, stylish casual outfit, energetic and approachable expression, bright clean environment',
    'Saúde / Bem-estar': 'a Brazilian woman in her mid 30s, athletic build, natural makeup, white or pastel clothing, serene and healthy look, natural light',
    'Academia / Esportes': 'a muscular mixed-race athlete man in his late 20s, athletic wear, intense focused expression, gym or outdoor environment',
    'Educação / Cursos': 'a Latin American woman educator in her 30s, natural hair, glasses optional, warm and approachable smile, casual smart outfit',
    'Tecnologia / SaaS': 'a young South Asian man in his late 20s, minimal dark outfit, calm and focused expression, modern minimal background',
    'Imobiliário': 'a confident Brazilian woman in her 40s, elegant business casual outfit, professional and trustworthy presence, architectural background',
    'Moda / Beleza': 'a striking Black woman in her late 20s, editorial fashion look, bold style choices, confident posture, fashion environment',
    'Agência / Marketing': 'a creative mixed-race person in their early 30s, modern casual look, expressive and dynamic energy, creative studio setting',
    'Jurídico / Contabilidade': 'a composed Latin American man in his 40s, classic suit, no tie, serious and trustworthy expression, clean neutral background',
    'Outro': 'a diverse professional person in their mid 30s, approachable and confident, neutral professional outfit, clean background',
  }

  const segment = (styleContext?.match(/Segment:\s*([^.]+)/) || [])[1]?.trim() || ''
  const personProfile = SEGMENT_PERSON[segment] || SEGMENT_PERSON['Outro']
  const hasReference = !!(visualReferences?.[0])

  const fullPrompt = `You are a senior art director at a world-class creative agency. Create slide ${slideIndex} of ${totalSlides} for a social media post.

BRAND CONTEXT:
${styleContext || 'clean, minimal, professional brand'}

CONTENT:
${prompt}

${hasReference
  ? `VISUAL DIRECTION: The reference image provided defines the visual identity — replicate its color palette, lighting mood, composition style, and overall aesthetic. This is the anchor. Do not deviate from it.`
  : `VISUAL DIRECTION: No reference provided. Use this person as the subject: ${personProfile}. Photograph style: editorial campaign shot, dramatic directional lighting from one side, shallow depth of field, cinematic color grading. The person should occupy 40-60% of the frame, positioned slightly to one side, with the opposite area reserved for typography.`
}

COMPOSITION RULES:
- The image must feel like a page from a premium international magazine or a top-tier agency campaign
- Lighting: dramatic and directional — one strong light source creating depth and contrast, never flat even lighting
- Color: rich, intentional, and cohesive — commit to a dominant dark palette with one sharp accent color
- If the brand has a primary color defined, use it as the accent — applied to ONE key word or a single graphic element only
- Background: deep, textured, or environmental — never a flat solid color unless it serves a clear artistic purpose
- Typography hierarchy: ONE headline in ultra-bold condensed or display typeface (maximum 5 words), ONE supporting line in regular weight (maximum 8 words) — nothing else
- Text placement: all text confined to safe zone — center 65% width, center 75% height of the image
- Outer edges (20% on each side, 15% top and bottom): background or environment only — no text, no key visual elements

ABSOLUTE PROHIBITIONS — any of these will disqualify the result:
- NO 3D rendered objects: no floating 3D letters, no chrome text on pedestals, no glowing orbs, no abstract 3D tech shapes
- NO generic AI imagery: no neural network visuals, no circuit boards, no brain graphics, no robotic elements, no AI chip imagery
- NO neon gradients, holographic effects, lens flares, particle systems, or sci-fi glow effects
- NO cluttered layouts with multiple competing visual elements
- NO repeated or similar-looking stock businesspeople — the person must match the segment profile described above
- NO invented logos, brand marks, or icons of any kind — bottom-right corner must be kept clear for logo overlay
- NO text near the edges — strict safe zone compliance required
- Text must be written in Portuguese (Brazil) only

QUALITY BAR: This image must be indistinguishable from a campaign produced by a senior human designer with a full production budget. If it looks like it was generated by a free AI tool, it has failed.`

  try {
    const refImage = visualReferences?.[0]

    if (refImage) {
      let imageBuffer
      if (refImage.startsWith('data:')) {
        const base64Data = refImage.split(',')[1]
        imageBuffer = Buffer.from(base64Data, 'base64')
      } else {
        const imgRes = await fetch(refImage)
        const ab = await imgRes.arrayBuffer()
        imageBuffer = Buffer.from(ab)
      }

      const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
      const CRLF = '\r\n'
      const parts = []

      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}gpt-image-2`)
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="prompt"${CRLF}${CRLF}${fullPrompt}`)
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="n"${CRLF}${CRLF}1`)
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="size"${CRLF}${CRLF}${size || '1024x1024'}`)
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
      console.log('[premium] edits failed, falling back to generations')
    }

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
