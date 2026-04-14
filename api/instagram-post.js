export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageUrl, imageUrls, caption, igUserId } = req.body

  if ((!imageUrl && !imageUrls) || !caption || !igUserId) {
    return res.status(400).json({ error: 'imageUrl ou imageUrls, caption e igUserId são obrigatórios' })
  }

  const accessToken = process.env.INSTAGRAM_TOKEN_AGENTE17

  if (!accessToken) {
    return res.status(500).json({ error: 'Token do Instagram não configurado' })
  }

  try {
    // Carrossel (múltiplas imagens)
    if (imageUrls && imageUrls.length > 1) {
      // Passo 1: cria container para cada imagem
      const childIds = []
      for (const url of imageUrls) {
        const childRes = await fetch(
          `https://graph.instagram.com/v21.0/${igUserId}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: url,
              is_carousel_item: true,
              access_token: accessToken,
            }),
          }
        )
        const childData = await childRes.json()
        console.log('[instagram-post] child container:', JSON.stringify(childData))
        if (childData.error) throw new Error(childData.error.message)
        childIds.push(childData.id)
      }

      // Passo 2: cria container do carrossel
      const carouselRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: 'CAROUSEL',
            children: childIds.join(','),
            caption,
            access_token: accessToken,
          }),
        }
      )
      const carouselData = await carouselRes.json()
      console.log('[instagram-post] carousel container:', JSON.stringify(carouselData))
      if (carouselData.error) throw new Error(carouselData.error.message)

      // Aguarda processamento
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Passo 3: publica o carrossel
      const publishRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: carouselData.id,
            access_token: accessToken,
          }),
        }
      )
      const publishData = await publishRes.json()
      console.log('[instagram-post] publish:', JSON.stringify(publishData))
      if (publishData.error) throw new Error(publishData.error.message)
      return res.status(200).json({ success: true, postId: publishData.id })

    } else {
      // Imagem única
      const url = imageUrl || imageUrls[0]
      const containerRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: url,
            caption,
            access_token: accessToken,
          }),
        }
      )
      const containerData = await containerRes.json()
      console.log('[instagram-post] container:', JSON.stringify(containerData))
      if (containerData.error) throw new Error(containerData.error.message)

      await new Promise(resolve => setTimeout(resolve, 3000))

      const publishRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accessToken,
          }),
        }
      )
      const publishData = await publishRes.json()
      console.log('[instagram-post] publish:', JSON.stringify(publishData))
      if (publishData.error) throw new Error(publishData.error.message)
      return res.status(200).json({ success: true, postId: publishData.id })
    }

  } catch (err) {
    console.error('[instagram-post] erro:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
