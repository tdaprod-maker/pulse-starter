export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, slideIndex, totalSlides, styleContext } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  const slidePrompt = `Create a professional Instagram carousel slide ${slideIndex} of ${totalSlides}.
Style context: ${styleContext || 'modern, clean, professional'}
Content: ${prompt}
Requirements:
- Square format 1080x1080px
- Text must be in Portuguese (Brazil)
- Professional typography integrated into the design
- High contrast, readable text
- Modern layout with strong visual hierarchy
- Brand colors and style consistent across slides
- No watermarks`

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: slidePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
        output_format: 'b64_json',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(500).json({ error: `OpenAI API error: ${error}` })
    }

    const data = await response.json()
    const imageB64 = data.data?.[0]?.b64_json

    if (!imageB64) {
      return res.status(500).json({ error: 'No image returned from OpenAI' })
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageB64}`
    })

  } catch (err) {
    console.error('[generate-premium] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
