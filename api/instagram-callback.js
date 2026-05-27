export default async function handler(req, res) {
  // POST com accessToken → refresh lazy antes de publicar
  if (req.method === 'POST') {
    const { accessToken } = req.body ?? {}
    if (!accessToken) {
      return res.status(400).json({ error: 'accessToken é obrigatório' })
    }
    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
    try {
      const refreshRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&client_secret=${encodeURIComponent(clientSecret)}` +
        `&fb_exchange_token=${encodeURIComponent(accessToken)}`
      )
      const data = await refreshRes.json()
      if (!data.access_token) {
        return res.status(400).json({ error: data.error?.message ?? 'Falha ao renovar token do Instagram' })
      }
      const expiresAt = new Date(Date.now() + (data.expires_in ?? 5184000) * 1000).toISOString()
      return res.status(200).json({ access_token: data.access_token, expires_at: expiresAt })
    } catch (err) {
      console.error('[instagram-callback] refresh erro:', err)
      return res.status(500).json({ error: err.message || 'Internal server error' })
    }
  }

  // GET com code → OAuth callback
  const { code, error, state } = req.query
  const doneBase = 'https://pulse-starter.vercel.app/auth/instagram/done'

  if (error || !code) {
    return res.redirect(`${doneBase}?instagram_error=true`)
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
  const redirectUri = 'https://pulse-starter.vercel.app/api/instagram-callback'

  try {
    // Passo 1: troca code por token de curta duração (Facebook User Access Token)
    const tokenRes = await fetch('https://graph.facebook.com/v21.0/oauth/access_token', {
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
    console.log('[instagram-callback] short token:', JSON.stringify(tokenData))

    if (!tokenData.access_token) {
      return res.redirect(`${doneBase}?instagram_error=true`)
    }

    const shortToken = tokenData.access_token

    // Passo 2: troca por token longo (60 dias)
    const longRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?grant_type=fb_exchange_token` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&client_secret=${encodeURIComponent(clientSecret)}` +
      `&fb_exchange_token=${encodeURIComponent(shortToken)}`
    )
    const longData = await longRes.json()
    console.log('[instagram-callback] long token:', JSON.stringify(longData))

    if (!longData.access_token) {
      return res.redirect(`${doneBase}?instagram_error=true`)
    }

    const longToken = longData.access_token
    const expiresIn = longData.expires_in ?? 5184000

    // Passo 3: busca Instagram Business Account ID e username
    // Tentativa 1: conta IG conectada diretamente ao perfil Facebook
    let igUserId = ''
    let username = ''

    const meRes = await fetch(
      `https://graph.facebook.com/v21.0/me?fields=instagram_business_account%7Bid%2Cusername%7D&access_token=${encodeURIComponent(longToken)}`
    )
    const meData = await meRes.json()
    console.log('[instagram-callback] me:', JSON.stringify(meData))

    if (meData.instagram_business_account?.id) {
      igUserId = String(meData.instagram_business_account.id)
      username = meData.instagram_business_account.username ?? ''
    } else {
      // Tentativa 2: conta IG conectada via Facebook Page
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account%7Bid%2Cusername%7D&access_token=${encodeURIComponent(longToken)}`
      )
      const pagesData = await pagesRes.json()
      console.log('[instagram-callback] pages:', JSON.stringify(pagesData))

      const pageWithIG = pagesData.data?.find(p => p.instagram_business_account?.id)
      if (!pageWithIG) {
        console.error('[instagram-callback] nenhuma conta Instagram Business encontrada')
        return res.redirect(`${doneBase}?instagram_error=no_ig_account`)
      }
      igUserId = String(pageWithIG.instagram_business_account.id)
      username = pageWithIG.instagram_business_account.username ?? ''
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    const params = new URLSearchParams({
      access_token: longToken,
      ig_user_id: igUserId,
      username,
      expires_at: expiresAt,
      state: state ?? '',
    })

    res.redirect(`${doneBase}?${params.toString()}`)
  } catch (err) {
    console.error('[instagram-callback] oauth erro:', err)
    res.redirect(`${doneBase}?instagram_error=true`)
  }
}
