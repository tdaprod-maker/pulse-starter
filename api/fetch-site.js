export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' })
  }

  // Normalize URL
  let parsedUrl
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
  } catch {
    return res.status(400).json({ error: 'URL inválida. Verifique e tente novamente.' })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const siteRes = await fetch(parsedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PulseBot/1.0; +https://usepulse.ai)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeoutId)

    if (!siteRes.ok) {
      return res.status(422).json({ error: `O site retornou erro ${siteRes.status}. Verifique a URL ou pule esta etapa.` })
    }

    const contentType = siteRes.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(422).json({ error: 'O endereço não parece ser uma página web. Pule esta etapa se preferir.' })
    }

    const html = await siteRes.text()

    // Strip scripts, styles, nav, footer then all tags
    const cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000)

    if (cleaned.length < 50) {
      return res.status(422).json({ error: 'Não foi possível extrair conteúdo do site. Pule esta etapa se preferir.' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Configuração interna ausente.' })

    const analysisRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: `Você é um especialista em marketing. Analise o texto extraído de um site e escreva uma descrição de negócio em português do Brasil com 2-3 frases. Inclua: o que a empresa faz, os principais produtos ou serviços oferecidos, e o público-alvo. Se não conseguir identificar claramente o negócio, retorne apenas uma string vazia.

Texto do site:
${cleaned}

Retorne APENAS a descrição de negócio, sem aspas, sem markdown, sem explicações.`,
        }],
      }),
    })

    const analysisData = await analysisRes.json()
    const description = (analysisData.content?.[0]?.text ?? '').trim()

    return res.status(200).json({ description, resolvedUrl: parsedUrl.href })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      return res.status(408).json({ error: 'O site demorou demais para responder. Pule esta etapa ou tente outra URL.' })
    }
    console.error('[fetch-site] erro:', err.message)
    return res.status(500).json({ error: 'Não foi possível acessar o site. Verifique a URL ou pule esta etapa.' })
  }
}
