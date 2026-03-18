const PEXELS_API_KEY = process.env.PEXELS_API_KEY
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

// ─── Tradução PT → EN para melhorar relevância no Pexels ────────────────────
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

// ─── Fallback map: termos específicos → queries genéricas garantidas ─────────
const FALLBACK_MAP = [
  { terms: ['feijoada', 'parmegiana', 'brigadeiro', 'coxinha', 'churrasco'], fallback: 'brazilian food' },
  { terms: ['baseball', 'beisebol', 'cricket', 'rugby', 'lacrosse'],         fallback: 'sport athlete' },
  { terms: ['networking', 'leadership', 'entrepreneurship', 'startup'],       fallback: 'business people meeting' },
  { terms: ['meditation', 'wellness', 'mindfulness'],                         fallback: 'person relaxing nature' },
  // Pratos específicos → fotos de comida garantidas no Pexels
  { terms: ['parmesan', 'parmegiana', 'milanese', 'schnitzel', 'chicken breast'], fallback: 'grilled chicken dish plate' },
  { terms: ['fillet', 'filet', 'steak', 'beef'],                              fallback: 'beef steak plate restaurant' },
  { terms: ['pasta', 'spaghetti', 'lasagna', 'lasagne'],                      fallback: 'pasta dish italian food' },
  { terms: ['pizza'],                                                          fallback: 'pizza slice close up' },
  { terms: ['burger', 'hamburguer', 'hamburger'],                             fallback: 'burger sandwich close up' },
  { terms: ['sushi', 'temaki', 'sashimi'],                                    fallback: 'sushi japanese food' },
  { terms: ['salad', 'salada'],                                               fallback: 'fresh salad bowl' },
  // Tech / IA / Negócios
  { terms: ['summit', 'conference', 'congress', 'forum'],                    fallback: 'business conference speakers stage' },
  { terms: ['artificial intelligence', 'machine learning', 'deep learning'], fallback: 'technology innovation digital' },
  { terms: ['robot', 'automation', 'autonomous'],                            fallback: 'technology futuristic digital' },
  { terms: ['startup', 'entrepreneur', 'founder'],                           fallback: 'business people office modern' },
  { terms: ['data', 'analytics', 'algorithm'],                               fallback: 'data technology abstract blue' },
  { terms: ['innovation', 'disruption', 'transformation'],                   fallback: 'business innovation technology' },
  { terms: ['agent', 'agente', 'chatbot', 'assistant'],                      fallback: 'technology digital interface' },
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

async function searchPexelsImages(query, perPage = 15) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: PEXELS_API_KEY },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Pexels API returned ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.photos || []
}

async function generateWithPexels(translatedPrompt) {
  // Nível 1: query completa
  console.log(`[L1] Query: "${translatedPrompt}"`)
  let results = await searchPexelsImages(translatedPrompt)

  // Nível 2: primeira palavra-chave
  if (results.length < 3) {
    const firstKeyword = extractFirstKeyword(translatedPrompt)
    console.log(`[L2] Only ${results.length} results, trying first keyword: "${firstKeyword}"`)
    results = await searchPexelsImages(firstKeyword)
  }

  // Nível 3: FALLBACK_MAP → termo genérico garantido
  if (results.length < 3) {
    const mappedFallback = lookupFallbackMap(translatedPrompt)
    if (mappedFallback) {
      console.log(`[L3] Still ${results.length} results, trying mapped fallback: "${mappedFallback}"`)
      results = await searchPexelsImages(mappedFallback)
    }
  }

  if (results.length === 0) {
    throw new Error('No images found on Pexels')
  }

  const photo = results[Math.floor(Math.random() * results.length)]
  const imageUrl = photo.src.large2x

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
      const result = await generateWithPexels(translatedPrompt)
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
    console.log(`Fetching Pexels image for: "${translatedPrompt}"`)

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
