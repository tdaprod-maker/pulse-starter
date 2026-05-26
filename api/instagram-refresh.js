export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken } = req.body
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
    console.error('[instagram-refresh] erro:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
