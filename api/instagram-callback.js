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

    // Passo 3: lista Facebook Pages do usuário
    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${encodeURIComponent(longToken)}`
    )
    const accountsData = await accountsRes.json()
    console.log('[instagram-callback] accounts:', JSON.stringify(accountsData))

    if (!accountsData.data?.length) {
      console.error('[instagram-callback] nenhuma Facebook Page encontrada')
      return res.redirect(`${doneBase}?instagram_error=no_page`)
    }

    // Passo 4: busca Instagram Business Account na primeira Page que tiver um
    let igUserId = ''
    let username = ''

    for (const page of accountsData.data) {
      const pageRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${encodeURIComponent(longToken)}`
      )
      const pageData = await pageRes.json()
      console.log(`[instagram-callback] page ${page.id}:`, JSON.stringify(pageData))

      if (pageData.instagram_business_account?.id) {
        igUserId = String(pageData.instagram_business_account.id)

        // Busca username do IG Business Account
        const igRes = await fetch(
          `https://graph.facebook.com/v21.0/${igUserId}?fields=username&access_token=${encodeURIComponent(longToken)}`
        )
        const igData = await igRes.json()
        username = igData.username ?? ''
        break
      }
    }

    if (!igUserId) {
      console.error('[instagram-callback] nenhuma conta Instagram Business encontrada nas Pages')
      return res.redirect(`${doneBase}?instagram_error=no_ig_account`)
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
