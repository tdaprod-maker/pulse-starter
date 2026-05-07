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

  const slidePrompt = `You are creating slide ${slideIndex} of ${totalSlides} for an Instagram post.

VISUAL STYLE (follow strictly):
${styleContext || 'modern, clean, professional Brazilian social media post'}

CONTENT:
${prompt}

RULES:
- All text in Portuguese (Brazil)
- Typography integrated into design
- No watermarks
- Cohesive visual identity across slides`

  try {
    const requestBody = {
      model: 'gpt-image-2',
      prompt: slidePrompt,
      n: 1,
      size: size || '1024x1024',
      quality: 'medium',
    }

    console.log('[premium] request size:', size)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log('[premium] status:', response.status)
    console.log('[premium] response preview:', responseText.substring(0, 300))

    if (!response.ok) {
      return res.status(500).json({ error: `OpenAI API error: ${responseText}` })
    }

    const data = JSON.parse(responseText)
    const item = data.data?.[0]

    if (!item) {
      return res.status(500).json({ error: 'No image returned from OpenAI' })
    }

    if (item.b64_json) {
      return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` })
    }

    if (item.url) {
      const imageResponse = await fetch(item.url)
      const arrayBuffer = await imageResponse.arrayBuffer()
      const imageB64 = Buffer.from(arrayBuffer).toString('base64')
      return res.status(200).json({ image: `data:image/png;base64,${imageB64}` })
    }

    return res.status(500).json({ error: 'No image data in response' })

  } catch (err) {
    console.error('[generate-premium] erro:', err)
    return res.status(500).json({ error: `Internal server error: ${err.message}` })
  }
}
