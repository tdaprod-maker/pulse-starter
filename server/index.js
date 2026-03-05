const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: '*' }))
app.use(express.json())

const UNSPLASH_CLIENT_ID = 'cPcT6cuBJ_5rSEbmhbMWzv4DnyicLdm4S2j1LSPkrR8'
const TIMEOUT_MS = 60000

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

// ─── Tradução PT → EN para melhorar relevância no Unsplash ───────────────────
const PT_TO_EN = {
  // Fitness / Esporte
  'treino':        'workout',
  'musculação':    'weightlifting',
  'academia':      'gym',
  'corrida':       'running',
  'ciclismo':      'cycling',
  'natação':       'swimming',
  'futebol':       'soccer',
  'basquete':      'basketball',
  'tênis':         'tennis',
  'yoga':          'yoga',
  'pilates':       'pilates',
  'esporte':       'sport',
  'esportes':      'sports',
  'atleta':        'athlete',
  'competição':    'competition',
  'campeonato':    'championship',
  // Comida / Nutrição
  'receita':       'food',
  'comida':        'food',
  'alimentação':   'healthy food',
  'nutrição':      'nutrition',
  'dieta':         'diet',
  'café':          'coffee',
  'almoço':        'lunch',
  'jantar':        'dinner',
  'café da manhã': 'breakfast',
  'sobremesa':     'dessert',
  'fruta':         'fruit',
  'verdura':       'vegetables',
  // Negócios / Trabalho
  'negócios':      'business',
  'negocio':       'business',
  'trabalho':      'work',
  'escritório':    'office',
  'reunião':       'meeting',
  'liderança':     'leadership',
  'empreendimento':'entrepreneurship',
  'startup':       'startup',
  'finanças':      'finance',
  'investimento':  'investment',
  'marketing':     'marketing',
  'vendas':        'sales',
  'equipe':        'team',
  'produtividade': 'productivity',
  // Tecnologia
  'tecnologia':    'technology',
  'computador':    'computer',
  'programação':   'programming',
  'código':        'code',
  'inteligência artificial': 'artificial intelligence',
  'inovação':      'innovation',
  'digital':       'digital',
  'celular':       'smartphone',
  'aplicativo':    'app',
  // Motivação / Lifestyle
  'motivação':     'motivation',
  'inspiração':    'inspiration',
  'sucesso':       'success',
  'crescimento':   'growth',
  'foco':          'focus',
  'disciplina':    'discipline',
  'mentalidade':   'mindset',
  'objetivo':      'goal',
  'metas':         'goals',
  'conquista':     'achievement',
  'vitória':       'victory',
  // Natureza / Bem-estar
  'natureza':      'nature',
  'saúde':         'health',
  'bem-estar':     'wellness',
  'meditação':     'meditation',
  'viagem':        'travel',
  'aventura':      'adventure',
  'montanha':      'mountain',
  'praia':         'beach',
  'floresta':      'forest',
  'cidade':        'city',
  // Pessoas
  'pessoa':        'person',
  'pessoas':       'people',
  'mulher':        'woman',
  'homem':         'man',
  'criança':       'child',
  'família':       'family',
  'amigos':        'friends',
  // Misc
  'música':        'music',
  'arte':          'art',
  'moda':          'fashion',
  'arquitetura':   'architecture',
  'educação':      'education',
  'livro':         'book',
  'leitura':       'reading',
  'fotografia':    'photography',
  'minimalismo':   'minimalism',
}

function translateToEnglish(prompt) {
  let result = prompt.toLowerCase().trim()

  // Tenta correspondência de frases completas primeiro (multi-palavra)
  for (const [pt, en] of Object.entries(PT_TO_EN)) {
    if (result === pt) return en
  }

  // Substitui palavra por palavra dentro do prompt
  for (const [pt, en] of Object.entries(PT_TO_EN)) {
    const regex = new RegExp(`\\b${pt}\\b`, 'gi')
    result = result.replace(regex, en)
  }

  // Retorna o resultado traduzido, ou o prompt original se nada mudou
  return result.trim() || prompt
}

async function generateWithUnsplash(query) {
  const searchUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=squarish&client_id=${UNSPLASH_CLIENT_ID}`

  const metaRes = await fetchWithTimeout(searchUrl)
  if (!metaRes.ok) {
    const body = await metaRes.text()
    throw new Error(`Unsplash API returned ${metaRes.status}: ${body}`)
  }

  const data = await metaRes.json()
  const imageUrl = data.urls.regular

  const imgRes = await fetchWithTimeout(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`)

  const arrayBuffer = await imgRes.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
  return { image: `data:${contentType};base64,${base64}` }
}

async function fetchWithRetry(query, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Attempt ${attempt}/${maxAttempts} for query: "${query}"`)
    try {
      const result = await generateWithUnsplash(query)
      return result
    } catch (err) {
      const isTimeout = err.name === 'AbortError'
      console.error(`Attempt ${attempt} failed: ${isTimeout ? 'timeout' : err.message}`)
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        throw err
      }
    }
  }
}

app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' })
  }

  const translatedPrompt = translateToEnglish(prompt)
  if (translatedPrompt !== prompt.toLowerCase().trim()) {
    console.log(`Translated: "${prompt}" → "${translatedPrompt}"`)
  }
  console.log(`Fetching Unsplash image for: "${translatedPrompt}"`)

  try {
    const result = await fetchWithRetry(translatedPrompt)
    console.log('Image fetched successfully')
    return res.json(result)
  } catch (err) {
    const fallbackQuery = prompt.trim().split(/\s+/)[0]
    console.log(`All attempts failed. Trying fallback query: "${fallbackQuery}"`)
    try {
      const result = await fetchWithRetry(fallbackQuery)
      console.log('Image fetched successfully with fallback query')
      return res.json(result)
    } catch (fallbackErr) {
      const isTimeout = fallbackErr.name === 'AbortError'
      const message = isTimeout ? 'Request timed out after 60s' : fallbackErr.message
      console.error(`Fallback also failed: ${message}`)
      return res.status(502).json({ error: message })
    }
  }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
  console.log('Using Unsplash API')
})
