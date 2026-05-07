import fetch from 'node-fetch'
import FormData from 'form-data'

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

  const slidePrompt = `You are creating slide ${slideIndex} of ${totalSlides} for an Instagram carousel post.

VISUAL STYLE REQUIREMENTS (follow strictly):
${styleContext || 'modern, clean, professional Brazilian social media post'}

CONTENT:
${prompt}

STRICT RULES:
- All text must be in Portuguese (Brazil)
- Typography must be integrated into the design, not floating over background
- Maintain consistent visual identity across all slides
- No generic stock photo aesthetic
- No watermarks or attribution text
- Format: vertical Instagram post
- The design must feel cohesive with the brand's existing visual references`

  try {
    let imageB64 = null

    // Se tem referencias visuais, usa edits API com a primeira como referencia
    if (visualReferences && visualReferences.length > 0) {
      const refUrl = visualReferences[0]
      const refResponse = await fetch(refUrl)
      const refBuffer = await refResponse.buffer()

      const form = new FormData()
      form.append('model', 'gpt-image-2')
      form.append('prompt', slidePrompt)
      form.append('image', refBuffer, { filename: 'reference.png', contentType: 'image/png' })
      form.append('n', '1')
      form.append('size', size || '1024x1024')
      form.append('quality', 'medium')

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...form.getHeaders(),
        },
        body: form,
      })

      const responseText = await response.text()
      console.log('[premium] edits response status:', response.status)
      console.log('[premium] edits response:', responseText.substring(0, 300))

      if (response.ok) {
        const data = JSON.parse(responseText)
        const item = data.data?.[0]
        if (item?.b64_json) imageB64 = item.b64_json
        else if (item?.url) {
          const imgRes = await fetch(item.url)
          const buf = await imgRes.buffer()
          imageB64 = buf.toString('base64')
        }
      }
    }

    // Fallback para generations se não tem referências ou edits falhou
    if (!imageB64) {
      const requestBody = {
        model: 'gpt-image-2',
        prompt: slidePrompt,
        n: 1,
        size: size || '1024x1024',
        quality: 'medium',
      }

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log('[premium] generations response status:', response.status)

      if (!response.ok) {
        return res.status(500).json({ error: `OpenAI API error: ${responseText}` })
      }

      const data = JSON.parse(responseText)
      const item = data.data?.[0]

      if (item?.b64_json) imageB64 = item.b64_json
      else if (item?.url) {
        const imgRes = await fetch(item.url)
        const buf = await imgRes.buffer()
        imageB64 = buf.toString('base64')
      }
    }

    if (!imageB64) {
      return res.status(500).json({ error: 'No image returned from OpenAI' })
    }

    return res.status(200).json({ image: `data:image/png;base64,${imageB64}` })

  } catch (err) {
    console.error('[generate-premium] erro:', err)
    return res.status(500).json({ error: `Internal server error: ${err.message}` })
  }
}
