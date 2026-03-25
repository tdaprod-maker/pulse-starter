export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageBase64, prompt } = req.body

  if (!imageBase64 || !prompt) {
    return res.status(400).json({ error: 'imageBase64 and prompt are required' })
  }

  const apiKey = process.env.FAL_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'FAL_API_KEY not configured' })
  }

  try {
    const response = await fetch('https://fal.run/fal-ai/flux-kontext/dev', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageBase64,
        prompt: prompt,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        output_format: 'jpeg',
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

    const imageResponse = await fetch(imageUrl)
    const arrayBuffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return res.status(200).json({
      image: `data:image/jpeg;base64,${base64}`
    })

  } catch (err) {
    console.error('[edit-image-ai] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
