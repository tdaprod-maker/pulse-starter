export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken, linkedinSub, text, imageBase64 } = req.body

  if (!accessToken || !linkedinSub || !text) {
    return res.status(400).json({ error: 'accessToken, linkedinSub e text são obrigatórios' })
  }

  try {
    let postBody

    if (imageBase64) {
      // Passo 1: registra a imagem no LinkedIn
      const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

      if (uploadUrl && asset) {
        // Passo 2: faz upload da imagem
        const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: imageBuffer,
        })

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
    console.log('[linkedin-post] status:', postRes.status)
    console.log('[linkedin-post] response:', postText)

    if (!postRes.ok) {
      return res.status(500).json({ error: `LinkedIn API error: ${postText}` })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('[linkedin-post] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
