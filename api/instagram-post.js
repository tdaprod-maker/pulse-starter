export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageUrl, caption, igUserId } = req.body

  if (!imageUrl || !caption || !igUserId) {
    return res.status(400).json({ error: 'imageUrl, caption e igUserId são obrigatórios' })
  }

  const accessToken = process.env.INSTAGRAM_TOKEN_AGENTE17

  if (!accessToken) {
    return res.status(500).json({ error: 'Token do Instagram não configurado' })
  }

  try {
    // Passo 1: cria o container de mídia no Instagram
    const containerRes = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    )

    const containerData = await containerRes.json()
    console.log('[instagram-post] container:', JSON.stringify(containerData))

    if (containerData.error) {
      return res.status(500).json({ error: containerData.error.message })
    }

    const creationId = containerData.id

    // Aguarda 3 segundos para o Instagram processar a imagem
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Passo 2: publica o container
    const publishRes = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    )

    const publishData = await publishRes.json()
    console.log('[instagram-post] publish:', JSON.stringify(publishData))

    if (publishData.error) {
      return res.status(500).json({ error: publishData.error.message })
    }

    return res.status(200).json({ success: true, postId: publishData.id })

  } catch (err) {
    console.error('[instagram-post] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
