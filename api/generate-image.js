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

// ─── Mapeamento de tema → collection ID do Unsplash ──────────────────────────
const THEME_COLLECTION_MAP = [
  { keywords: ['workout', 'weightlifting', 'gym', 'running', 'cycling', 'swimming', 'soccer', 'basketball', 'tennis', 'yoga', 'pilates', 'sport', 'sports', 'athlete', 'competition', 'championship', 'fitness', 'exercise', 'training'], collection: '317099' },
  { keywords: ['food', 'nutrition', 'diet', 'coffee', 'lunch', 'dinner', 'breakfast', 'dessert', 'fruit', 'vegetables', 'healthy food', 'meal', 'recipe', 'cooking', 'eating'], collection: '3330448' },
  { keywords: ['business', 'work', 'office', 'meeting', 'leadership', 'entrepreneurship', 'startup', 'finance', 'investment', 'marketing', 'sales', 'team', 'productivity', 'corporate'], collection: '3330445' },
  { keywords: ['nature', 'mountain', 'beach', 'forest', 'landscape', 'outdoor', 'wilderness', 'adventure', 'travel'], collection: '3330448' },
]

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'about', 'into', 'over', 'after',
  'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its',
  'our', 'their', 'i', 'me', 'you', 'he', 'she', 'it', 'we', 'they',
  'how', 'when', 'where', 'why', 'what', 'which', 'who', 'very', 'more',
  'most', 'some', 'any', 'all', 'each', 'every', 'both', 'few', 'more',
  'other', 'such', 'own', 'same', 'than', 'too', 'just', 'also', 'make',
  'making', 'get', 'getting', 'use', 'using', 'show', 'showing',
])

function translateToEnglish(prompt) {
  let result = prompt.toLowerCase().trim()

  for (const [pt, en] of Object.entries(PT_TO_EN)) {
    if (result === pt) return en
  }

  for (const [pt, en] of Object.entries(PT_TO_EN)) {
    const regex = new RegExp(`\\b${pt}\\b`, 'gi')
    result = result.replace(regex, en)
  }

  return result.trim() || prompt
}

// Extrai as palavras-chave mais relevantes do prompt traduzido
function extractKeywords(translatedPrompt) {
  const words = translatedPrompt.toLowerCase().split(/\s+/)
  const keywords = words.filter(w => w.length > 3 && !STOP_WORDS.has(w))
  return keywords.slice(0, 4).join(' ') || translatedPrompt
}

// Detecta o ID de collection do Unsplash com base nas palavras do prompt
function detectThemeCollection(translatedPrompt) {
  const lower = translatedPrompt.toLowerCase()
  for (const { keywords, collection } of THEME_COLLECTION_MAP) {
    if (keywords.some(kw => lower.includes(kw))) {
      return collection
    }
  }
  return null
}

// ─── Fallback map: termos específicos → queries genéricas garantidas ─────────
const FALLBACK_MAP = [
  { terms: ['feijoada', 'parmegiana', 'brigadeiro', 'coxinha', 'churrasco'], fallback: 'brazilian food' },
  { terms: ['baseball', 'beisebol', 'cricket', 'rugby', 'lacrosse'],         fallback: 'sport athlete' },
  { terms: ['networking', 'leadership', 'entrepreneurship', 'startup'],       fallback: 'business people meeting' },
  { terms: ['meditation', 'wellness', 'mindfulness'],                         fallback: 'person relaxing nature' },
]

// Nível 2: primeira palavra relevante do prompt
function extractFirstKeyword(translatedPrompt) {
  const words = translatedPrompt.toLowerCase().split(/\s+/)
  const keywords = words.filter(w => w.length > 3 && !STOP_WORDS.has(w))
  return keywords[0] || words[0] || translatedPrompt
}

// Nível 3: verifica FALLBACK_MAP e retorna termo genérico, ou null se não encontrar
function lookupFallbackMap(translatedPrompt) {
  const lower = translatedPrompt.toLowerCase()
  for (const { terms, fallback } of FALLBACK_MAP) {
    if (terms.some(t => lower.includes(t))) return fallback
  }
  return null
}

async function searchUnsplashImages(query, collectionId = null, perPage = 15) {
  let url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=squarish&content_filter=high&client_id=${UNSPLASH_CLIENT_ID}`
  if (collectionId) {
    url += `&collections=${collectionId}`
  }

  const res = await fetchWithTimeout(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Unsplash API returned ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.results || []
}

async function generateWithUnsplash(translatedPrompt) {
  const collectionId = detectThemeCollection(translatedPrompt)

  // Nível 1: query completa com collection
  console.log(`[L1] Query: "${translatedPrompt}"${collectionId ? ` (collection: ${collectionId})` : ''}`)
  let results = await searchUnsplashImages(translatedPrompt, collectionId)

  // Nível 2: primeira palavra-chave sem collection
  if (results.length < 3) {
    const firstKeyword = extractFirstKeyword(translatedPrompt)
    console.log(`[L2] Only ${results.length} results, trying first keyword: "${firstKeyword}"`)
    results = await searchUnsplashImages(firstKeyword)
  }

  // Nível 3: FALLBACK_MAP → termo genérico garantido
  if (results.length < 3) {
    const mappedFallback = lookupFallbackMap(translatedPrompt)
    if (mappedFallback) {
      console.log(`[L3] Still ${results.length} results, trying mapped fallback: "${mappedFallback}"`)
      results = await searchUnsplashImages(mappedFallback)
    }
  }

  if (results.length === 0) {
    throw new Error('No images found on Unsplash')
  }

  const photo = results[Math.floor(Math.random() * results.length)]
  const imageUrl = photo.urls.regular

  const imgRes = await fetchWithTimeout(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`)

  const arrayBuffer = await imgRes.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
  return { image: `data:${contentType};base64,${base64}` }
}

async function fetchWithRetry(translatedPrompt, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Attempt ${attempt}/${maxAttempts} for prompt: "${translatedPrompt}"`)
    try {
      const result = await generateWithUnsplash(translatedPrompt)
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
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
      const isTimeout = err.name === 'AbortError'
      const message = isTimeout ? 'Request timed out after 60s' : err.message
      console.error(`All attempts failed: ${message}`)
      return res.status(502).json({ error: message })
    }
  } catch (err) {
    console.error('Unexpected error in /api/generate-image:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
