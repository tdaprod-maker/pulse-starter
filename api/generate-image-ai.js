export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.FAL_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'FAL_API_KEY not configured' })
  }

  const PERSON_KEYWORDS = /\b(person|people|man|woman|men|women|girl|boy|human|face|portrait|model|athlete|doctor|nurse|worker|team|crowd|couple|family|child|baby|adult|professional|businessman|businesswoman|employee|staff|customer|client|pessoa|pessoas|homem|mulher|homens|mulheres|menina|menino|rosto|retrato|atleta|médico|enfermeiro|trabalhador|equipe|família|criança|bebê|adulto)\b/i

  const finalPrompt = PERSON_KEYWORDS.test(prompt)
    ? `${prompt}, anatomically correct, consistent gender throughout, complete body, professional photography`
    : prompt

  try {
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        image_size: { width: 1080, height: 1350 },
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(500).json({ error: `FAL API error: ${error}` })
    }

    const data = await response.json()
    const imageUrl = data.images?.[0]?.url

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image returned from FAL' })
    }

    // Busca a imagem e converte para base64
    const imageResponse = await fetch(imageUrl)
    const arrayBuffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = 'image/jpeg'

    return res.status(200).json({
      image: `data:${mimeType};base64,${base64}`
    })

  } catch (err) {
    console.error('[generate-image-ai] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
