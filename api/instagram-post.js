export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageBase64, caption, igUserId } = req.body

  if (!imageBase64 || !caption || !igUserId) {
    return res.status(400).json({ error: 'imageBase64, caption e igUserId são obrigatórios' })
  }

  const accessToken = process.env.INSTAGRAM_TOKEN_AGENTE17

  if (!accessToken) {
    return res.status(500).json({ error: 'Token do Instagram não configurado' })
  }

  try {
    // Passo 1: faz upload da imagem para um servidor temporário
    // O Instagram não aceita base64 diretamente — precisa de uma URL pública
    // Vamos usar o upload para o Supabase Storage como intermediário
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Passo 2: cria o container de mídia no Instagram
    const containerRes = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageBase64, // temporário — vamos ajustar
          caption,
          access_token: accessToken,
        }),
      }
    )

    const containerData = await containerRes.json()
    console.log('[instagram-post] container:', containerData)

    if (containerData.error) {
      return res.status(500).json({ error: containerData.error.message })
    }

    const creationId = containerData.id

    // Passo 3: publica o container
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
    console.log('[instagram-post] publish:', publishData)

    if (publishData.error) {
      return res.status(500).json({ error: publishData.error.message })
    }

    return res.status(200).json({ success: true, postId: publishData.id })

  } catch (err) {
    console.error('[instagram-post] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
