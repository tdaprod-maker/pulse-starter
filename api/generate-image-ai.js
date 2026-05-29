export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, aspectRatio } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  const PERSON_KEYWORDS = /\b(person|people|man|woman|men|women|girl|boy|human|face|portrait|model|athlete|doctor|nurse|worker|team|crowd|couple|family|child|baby|adult|professional|businessman|businesswoman|employee|staff|customer|client|pessoa|pessoas|homem|mulher|homens|mulheres|menina|menino|rosto|retrato|atleta|médico|enfermeiro|trabalhador|equipe|família|criança|bebê|adulto)\b/i

  const finalPrompt = PERSON_KEYWORDS.test(prompt)
    ? `${prompt}, anatomically correct, consistent gender throughout, complete body, professional photography`
    : prompt

  const sizeMap = {
    '9:16': '1024x1792',
    '16:9': '1792x1024',
    '1:1':  '1024x1024',
    '4:5':  '1024x1024',
  }
  const size = sizeMap[aspectRatio] ?? '1024x1024'

  try {
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
