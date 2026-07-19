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

  const { prompt, aspectRatio, segment, headline, referenceImage } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  const PERSON_KEYWORDS = /\b(person|people|man|woman|men|women|girl|boy|human|face|portrait|model|athlete|doctor|nurse|worker|team|crowd|couple|family|child|baby|adult|professional|businessman|businesswoman|employee|staff|customer|client|pessoa|pessoas|homem|mulher|homens|mulheres|menina|menino|rosto|retrato|atleta|médico|enfermeiro|trabalhador|equipe|família|criança|bebê|adulto)\b/i

  const basePrompt = PERSON_KEYWORDS.test(prompt)
    ? `${prompt}, anatomically correct, consistent gender throughout, complete body, professional photography`
    : prompt

  const visualStyleDirective = styleForSegment(segment)

  const headlineRule = headline
    ? `\nTEXT IN IMAGE: Render ONLY this exact text visible in the image: "${headline}". Nothing else. No subtitles, no bullet points, no icons with labels, no lists, no multiple text sections.`
    : ''

  const photoIdentityRule = referenceImage
    ? '\nPHOTO REFERENCE: Use the provided photo as the main subject. Preserve the person\'s face and identity exactly. Enhance lighting and background only.'
    : ''

  const finalPrompt = `${basePrompt}

VISUAL STYLE: ${visualStyleDirective}
COMPOSITION: One dominant subject. Generous white space. Text placed in lower third or upper third, never center. The image must breathe.${headlineRule}${photoIdentityRule}`

  const sizeMap = {
    '9:16': '1024x1792',
    '16:9': '1792x1024',
    '1:1':  '1024x1024',
    '4:5':  '1024x1024',
  }
  const size = sizeMap[aspectRatio] ?? '1024x1024'

  try {
    // Se tem foto de referência, usa images/edits (preserva o sujeito da foto)
    if (referenceImage) {
      let imageBuffer
      if (referenceImage.startsWith('data:')) {
        const base64Data = referenceImage.split(',')[1]
        imageBuffer = Buffer.from(base64Data, 'base64')
      } else {
        const imgRes = await fetch(referenceImage)
        const ab = await imgRes.arrayBuffer()
        imageBuffer = Buffer.from(ab)
      }

      const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
      const CRLF = '\r\n'
      const parts = []
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}gpt-image-1`)
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="prompt"${CRLF}${CRLF}${finalPrompt}`)
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="n"${CRLF}${CRLF}1`)
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="size"${CRLF}${CRLF}${size}`)
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="quality"${CRLF}${CRLF}high`)

      const preamble = parts.join(CRLF) + CRLF
      const imageHeader = `--${boundary}${CRLF}Content-Disposition: form-data; name="image"; filename="reference.png"${CRLF}Content-Type: image/png${CRLF}${CRLF}`
      const epilogue = `${CRLF}--${boundary}--`

      const body = Buffer.concat([
        Buffer.from(preamble),
        Buffer.from(imageHeader),
        imageBuffer,
        Buffer.from(epilogue),
      ])

      const editsResponse = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length.toString(),
        },
        body,
      })

      const editsText = await editsResponse.text()
      console.log('[generate-image-ai] edits status:', editsResponse.status)

      if (editsResponse.ok) {
        const data = JSON.parse(editsText)
        const item = data.data?.[0]
        if (item?.b64_json) {
          return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` })
        }
        if (item?.url) {
          const imgRes = await fetch(item.url)
          const ab = await imgRes.arrayBuffer()
          const base64 = Buffer.from(ab).toString('base64')
          return res.status(200).json({ image: `data:image/png;base64,${base64}` })
        }
      }
      // Se edits falhou, cai no fallback de generations abaixo
      console.error('[generate-image-ai] edits failed, falling back to generations:', editsText.slice(0, 300))
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: finalPrompt,
        n: 1,
        size,
        quality: 'high',

      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DALL-E] status:', response.status, 'body:', errorText)
      return res.status(500).json({ error: `OpenAI API error: ${errorText}` })
    }

    const data = await response.json()
    const item = data.data?.[0]

    if (!item) {
      return res.status(500).json({ error: 'No image returned from OpenAI' })
    }

    if (item.b64_json) {
      return res.status(200).json({
        image: `data:image/png;base64,${item.b64_json}`
      })
    }

    if (item.url) {
      const imageResponse = await fetch(item.url)
      const arrayBuffer = await imageResponse.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      return res.status(200).json({
        image: `data:image/png;base64,${base64}`
      })
    }

    return res.status(500).json({ error: 'No image data returned from OpenAI' })

  } catch (err) {
    console.error('[generate-image-ai] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
