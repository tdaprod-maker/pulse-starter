// Consolida instagram-auth.js + instagram-callback.js + instagram-post.js num único
// arquivo pra reduzir a contagem de Serverless Functions (limite de 12 no plano
// Vercel Hobby). As rotas externas antigas (/api/instagram-auth, /api/instagram-callback,
// /api/instagram-post) continuam funcionando via rewrite em vercel.json — nada muda
// pro app Meta/Instagram registrado (redirect_uri) nem pro frontend.
function handleAuth(req, res) {
  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const redirectUri = 'https://pulse.agente17.com.br/api/instagram-callback'
  const scope = 'instagram_business_basic,instagram_business_content_publish'

  const userEmail = req.query.email ?? ''
  const state = Buffer.from(userEmail).toString('base64')

  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`

  res.redirect(authUrl)
}

async function handleCallback(req, res) {
  // POST com accessToken → refresh lazy antes de publicar
  if (req.method === 'POST') {
    const { accessToken } = req.body ?? {}
    if (!accessToken) {
      return res.status(400).json({ error: 'accessToken é obrigatório' })
    }
    try {
      const refreshRes = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`
      )
      const data = await refreshRes.json()
      if (!data.access_token) {
        return res.status(400).json({ error: data.error?.message ?? 'Falha ao renovar token do Instagram' })
      }
      const expiresAt = new Date(Date.now() + (data.expires_in ?? 5184000) * 1000).toISOString()
      return res.status(200).json({ access_token: data.access_token, expires_at: expiresAt })
    } catch (err) {
      console.error('[instagram/callback] refresh erro:', err)
      return res.status(500).json({ error: err.message || 'Internal server error' })
    }
  }

  // GET com code → OAuth callback
  const { code, error, state } = req.query
  const doneBase = 'https://pulse.agente17.com.br/auth/instagram/done'

  if (error || !code) {
    return res.redirect(`${doneBase}?instagram_error=true`)
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
  const redirectUri = 'https://pulse.agente17.com.br/api/instagram-callback'

  try {
    // Passo 1: troca code por token de curta duração
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    console.log('[instagram/callback] short token:', JSON.stringify(tokenData))

    if (!tokenData.access_token) {
      return res.redirect(`${doneBase}?instagram_error=true`)
    }

    const shortToken = tokenData.access_token
    const igUserIdFromToken = tokenData.user_id

    // Passo 2: troca por token longo (60 dias)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(shortToken)}`
    )
    const longData = await longRes.json()
    console.log('[instagram/callback] long token:', JSON.stringify(longData))

    if (!longData.access_token) {
      return res.redirect(`${doneBase}?instagram_error=true`)
    }

    const longToken = longData.access_token
    const expiresIn = longData.expires_in ?? 5184000

    // Passo 3: busca ig_user_id, username e foto de perfil
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,profile_picture_url&access_token=${encodeURIComponent(longToken)}`
    )
    const profileData = await profileRes.json()
    console.log('[instagram/callback] profile:', JSON.stringify(profileData))

    const igUserId = String(profileData.id ?? igUserIdFromToken ?? '')
    const username = profileData.username ?? ''
    const avatarUrl = profileData.profile_picture_url ?? ''
    console.log('[instagram/callback] avatar_url extraído de profileData.profile_picture_url:', avatarUrl || '(vazio)')
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    const params = new URLSearchParams({
      access_token: longToken,
      ig_user_id: igUserId,
      username,
      avatar_url: avatarUrl,
      expires_at: expiresAt,
      state: state ?? '',
    })

    console.log('[instagram/callback] redirecionando pra done com avatar_url:', params.get('avatar_url') || '(vazio)')
    res.redirect(`${doneBase}?${params.toString()}`)
  } catch (err) {
    console.error('[instagram/callback] oauth erro:', err)
    res.redirect(`${doneBase}?instagram_error=true`)
  }
}

async function handlePost(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageUrl, imageUrls, caption, igUserId, accessToken } = req.body

  if ((!imageUrl && !imageUrls) || !caption || !igUserId || !accessToken) {
    return res.status(400).json({ error: 'imageUrl/imageUrls, caption, igUserId e accessToken são obrigatórios' })
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
        console.log('[instagram/post] child container:', JSON.stringify(childData))
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
      console.log('[instagram/post] carousel container:', JSON.stringify(carouselData))
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
      console.log('[instagram/post] publish:', JSON.stringify(publishData))
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
      console.log('[instagram/post] container:', JSON.stringify(containerData))
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
      console.log('[instagram/post] publish:', JSON.stringify(publishData))
      if (publishData.error) throw new Error(publishData.error.message)
      return res.status(200).json({ success: true, postId: publishData.id })
    }

  } catch (err) {
    console.error('[instagram/post] erro:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}

export default async function handler(req, res) {
  switch (req.query.action) {
    case 'auth': return handleAuth(req, res)
    case 'callback': return handleCallback(req, res)
    case 'post': return handlePost(req, res)
    default: return res.status(400).json({ error: 'Unknown or missing action' })
  }
}
