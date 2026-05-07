export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, slideIndex, totalSlides, styleContext, size } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  const slidePrompt = `Create a professional Instagram post slide ${slideIndex} of ${totalSlides}.
Style context: ${styleContext || 'modern, clean, professional'}
Content: ${prompt}
Requirements:
- Text must be in Portuguese (Brazil)
- Professional typography integrated into the design
- High contrast, readable text
- Modern layout with strong visual hierarchy
- No watermarks`

  try {
    const requestBody = {
      model: 'gpt-image-2',
      prompt: slidePrompt,
      n: 1,
      size: size || '1024x1024',
      quality: 'medium',
    }

    console.log('[premium] sending request:', JSON.stringify(requestBody))

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log('[premium] raw response status:', response.status)
    console.log('[premium] raw response:', responseText.substring(0, 500))

    if (!response.ok) {
      return res.status(500).json({ error: `OpenAI API error: ${responseText}` })
    }

    const data = JSON.parse(responseText)
    console.log('[premium] data keys:', Object.keys(data))
    console.log('[premium] data.data[0] keys:', data.data?.[0] ? Object.keys(data.data[0]) : 'none')

    // Tenta b64_json primeiro, depois url
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
