export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, brand, lockedTemplateId } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const brandCtx = brand ? `
Marca: ${brand.businessName || ''}
Segmento: ${brand.segment || ''}
Tom: ${brand.tone || ''}
Descrição: ${brand.brandDescription || ''}
Estilo visual: ${brand.visualStyle || ''}` : ''

  const lockedCtx = lockedTemplateId
    ? `\nTEMPLATE FIXADO PELO USUÁRIO: "${lockedTemplateId}" — o usuário já escolheu este template. Use-o obrigatoriamente no campo "templateId" da resposta. Não sugira nem use outro template.`
    : ''

  const history = messages
    .map(m => `${m.role === 'user' ? 'Usuário' : 'Agente'}: ${m.content}`)
    .join('\n')

  const prompt = `Você é um agente de design de posts para redes sociais. Seu objetivo é coletar informações suficientes para gerar um post de alta qualidade para o usuário.

CONTEXTO DA MARCA (já conhecido — não pergunte sobre isso):
${brandCtx || 'Não disponível'}${lockedCtx}

HISTÓRICO DA CONVERSA:
${history}

AVALIE se você tem informação suficiente para gerar um bom post. Você precisa saber:
1. O propósito/tema do post (obrigatório)
2. Para qual rede social / onde será publicado (importante para definir formato)
3. Se deve ter imagem de fundo ou ser apenas tipográfico (importante)

REGRAS DE FORMATO — escolha automaticamente com base no contexto:
- "stories", "reels", "story" → format: "9x16"
- "linkedin" sem especificar → format: "1x1"
- "feed instagram", "instagram feed", "post instagram" → format: "4x5"
- "banner", "capa", "youtube", "linkedin banner" → format: "16x9"
- Instagram sem especificar → format: "4x5" (melhor performance no feed)
- Sem rede mencionada → pergunte para qual rede social é o post
- Se já mencionou a rede em mensagem anterior, use o formato correspondente sem perguntar de novo

DETECÇÃO DE MODO:
- Modo padrão é SEMPRE "post" — use carrossel SOMENTE se o usuário usar explicitamente uma dessas palavras: "carrossel", "carrosseis", "slides", "sequência de posts", "série de posts"
- Qualquer outra descrição de conteúdo (lista, dicas, tópicos, etc.) que não use essas palavras → modo post único
- Em caso de dúvida → modo post único

REGRAS DE CONVERSA:
- Se ainda não tem o suficiente, faça NO MÁXIMO 2 perguntas em uma única mensagem natural e amigável
- Nunca faça mais de 2 rodadas de perguntas — na terceira interação, gere com o que tiver
- Se já tem o suficiente, retorne ready: true com um prompt rico em português
- Seja conversacional e direto — não use listas ou bullet points nas perguntas
- Conte as mensagens do usuário: se já tem 2 ou mais respostas, gere
- Para carrossel: se o usuário não informou quantos slides, pergunte (opções: 3, 4, 5, 7, 10)
- Para carrossel: não pergunte sobre rede social ou formato — carrossel é sempre 4x5
- Para carrossel: o campo "prompt" deve ser CURTO — máximo 3 frases descrevendo tema, tom e estilo. NÃO descreva slides individuais nem estrutura de conteúdo — isso é responsabilidade de outra função.

REGRA CRÍTICA PARA O CAMPO "prompt":
O campo "prompt" deve conter APENAS: tema, rede social, tom e objetivo — máximo 2 frases curtas.
NÃO inclua: cores, fontes, elementos visuais, slogans, descrição de layout, estrutura de slides ou qualquer detalhamento criativo.
O detalhamento visual é feito internamente por outra função — o "prompt" aqui é só um briefing mínimo.
Exemplos corretos:
  post → "Post para Instagram feed sobre lançamento de produto de skincare. Tom sofisticado, objetivo: gerar desejo e levar ao link na bio."
  post → "Post LinkedIn anunciando vaga de engenheiro sênior na startup. Tom profissional, objetivo: atrair candidatos qualificados."
  carousel → "Carrossel Instagram sobre os 5 erros mais comuns em gestão financeira para MEIs. Tom didático, objetivo: educar e gerar seguidores."

Responda APENAS com JSON válido sem markdown:
{
  "ready": false,
  "message": "sua pergunta natural aqui"
}
OU (post único):
{
  "ready": true,
  "mode": "post",
  "prompt": "tema e rede social em 1-2 frases — sem detalhes visuais",
  "format": "4x5"
}
OU (carrossel):
{
  "ready": true,
  "mode": "carousel",
  "slideCount": 5,
  "prompt": "tema e objetivo em 1-2 frases — sem descrever slides individuais"
}

Formatos válidos para post: "1x1", "4x5", "9x16", "16x9"
slideCount válidos para carrossel: 3, 4, 5, 7, 10`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 700,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody?.error?.message ?? `Erro ${response.status} da API Anthropic`)
      }

      const data = await response.json()
      const raw = data?.content?.[0]?.text ?? ''
      if (!raw) throw new Error('A API retornou uma resposta vazia')

      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return res.status(200).json(parsed)

    } catch (err) {
      console.error(`[agent-chat] erro attempt ${attempt}:`, err)
      if (attempt === 2) {
        return res.status(200).json({
          ready: false,
          message: 'Estou com instabilidade no momento. Tente enviar sua mensagem novamente em alguns segundos.',
        })
      }
    }
  }
}
