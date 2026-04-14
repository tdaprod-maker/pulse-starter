export default function handler(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = 'https://pulse-ashy-eight.vercel.app/auth/linkedin/callback'
  const scope = 'openid profile w_member_social w_organization_social r_organization_social'
  const state = Math.random().toString(36).substring(7)

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`

  res.redirect(authUrl)
}
