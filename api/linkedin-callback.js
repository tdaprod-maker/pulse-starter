export default async function handler(req, res) {
  const { code, error } = req.query

  if (error || !code) {
    return res.redirect('https://pulse-ashy-eight.vercel.app?linkedin_error=true')
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = 'https://pulse-ashy-eight.vercel.app/auth/linkedin/callback'

  try {
    // Troca o código pelo access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return res.redirect('https://pulse-ashy-eight.vercel.app?linkedin_error=true')
    }

    // Busca o ID do usuário no LinkedIn
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json()

    // Redireciona de volta ao app com o token e o sub (ID do usuário)
    const params = new URLSearchParams({
      linkedin_token: tokenData.access_token,
      linkedin_sub: profile.sub ?? '',
      linkedin_name: profile.name ?? '',
    })

    res.redirect(`https://pulse-ashy-eight.vercel.app?${params.toString()}`)

  } catch (err) {
    console.error('[linkedin-callback] erro:', err)
    res.redirect('https://pulse-ashy-eight.vercel.app?linkedin_error=true')
  }
}
