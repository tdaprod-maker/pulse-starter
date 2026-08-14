// Consolida linkedin-auth.js + linkedin-callback.js + linkedin-post.js num único
// arquivo pra reduzir a contagem de Serverless Functions (limite de 12 no plano
// Vercel Hobby). As rotas externas antigas (/api/linkedin-auth, /api/linkedin-callback,
// /auth/linkedin/callback, /api/linkedin-post) continuam funcionando via rewrite em
// vercel.json — nada muda pro app LinkedIn registrado (redirect_uri) nem pro frontend.
function handleAuth(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = 'https://pulse-starter.vercel.app/auth/linkedin/callback'
  const scope = 'openid profile w_member_social'
  const state = Math.random().toString(36).substring(7)

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`

  res.redirect(authUrl)
}

async function handleCallback(req, res) {
  const { code, error } = req.query

  if (error || !code) {
    return res.redirect('https://pulse-starter.vercel.app/auth/linkedin/done?linkedin_error=true')
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = 'https://pulse-starter.vercel.app/auth/linkedin/callback'

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
      return res.redirect('https://pulse-starter.vercel.app/auth/linkedin/done?linkedin_error=true')
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

    res.redirect(`https://pulse-starter.vercel.app/auth/linkedin/done?${params.toString()}`)

  } catch (err) {
    console.error('[linkedin/callback] erro:', err)
    res.redirect('https://pulse-starter.vercel.app/auth/linkedin/done?linkedin_error=true')
  }
}

async function handlePost(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken, linkedinSub, text, imageBase64, images } = req.body

  if (!accessToken || !linkedinSub || !text) {
    return res.status(400).json({ error: 'accessToken, linkedinSub e text são obrigatórios' })
  }

  const apiKey = accessToken

  try {
    // Função para fazer upload de uma imagem
    async function uploadImage(base64) {
      const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: `urn:li:person:${linkedinSub}`,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            }],
          },
        }),
      })
      const registerData = await registerRes.json()
      const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl
      const asset = registerData.value?.asset

      if (!uploadUrl || !asset) throw new Error('Falha ao registrar imagem no LinkedIn')

      const imageBuffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: imageBuffer,
      })

      return asset
    }

    let postBody

    // Múltiplas imagens (carrossel)
    if (images && images.length > 0) {
      const assets = []
      for (const img of images) {
        const asset = await uploadImage(img)
        assets.push(asset)
      }

      postBody = {
        author: `urn:li:person:${linkedinSub}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'IMAGE',
            media: assets.map(asset => ({
              status: 'READY',
              description: { text: '' },
              media: asset,
              title: { text: 'Carrossel via Pulse' },
            })),
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }
    } else if (imageBase64) {
      // Imagem única
      const asset = await uploadImage(imageBase64)
      postBody = {
        author: `urn:li:person:${linkedinSub}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'IMAGE',
            media: [{
              status: 'READY',
              description: { text: '' },
              media: asset,
              title: { text: 'Post via Pulse' },
            }],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }
    } else {
      postBody = {
        author: `urn:li:person:${linkedinSub}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }
    }

    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    })

    const postText = await postRes.text()
    console.log('[linkedin/post] status:', postRes.status)
    console.log('[linkedin/post] response:', postText)

    if (!postRes.ok) {
      return res.status(500).json({ error: `LinkedIn API error: ${postText}` })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('[linkedin/post] erro:', err)
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
