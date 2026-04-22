export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, per_page = 6, orientation = 'portrait' } = req.query

  if (!query) {
    return res.status(400).json({ error: 'query é obrigatório' })
  }

  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'PEXELS_API_KEY não configurada' })
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${per_page}&orientation=${orientation}`,
      { headers: { Authorization: apiKey } }
    )

    if (!response.ok) {
      return res.status(500).json({ error: `Pexels API error: ${response.status}` })
    }

    const data = await response.json()

    // Retorna apenas os dados necessários
    const videos = data.videos.map(v => ({
      id: v.id,
      duration: v.duration,
      thumbnail: v.image,
      url: v.video_files
        .filter(f => f.quality === 'hd' || f.quality === 'sd')
        .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
        .find(f => f.file_type === 'video/mp4')?.link ?? v.video_files[0]?.link,
    })).filter(v => v.url)

    return res.status(200).json({ videos })

  } catch (err) {
    console.error('[search-videos] erro:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
