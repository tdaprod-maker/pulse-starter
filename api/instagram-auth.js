export default function handler(req, res) {
  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const redirectUri = 'https://pulse-starter.vercel.app/api/instagram-callback'
  const scope = 'instagram_business_basic,instagram_business_content_publish'

  const userEmail = req.query.email ?? ''
  const state = Buffer.from(userEmail).toString('base64')

  const authUrl =
    `https://api.instagram.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`

  res.redirect(authUrl)
}
