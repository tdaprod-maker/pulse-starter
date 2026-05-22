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

  const userMessageCount = messages.filter(m => m.role === 'user').length

  const prompt = `Você é um designer sênior de conteúdo para redes sociais com 10 anos de experiência. Você conhece o que performa — e o que não performa. Seu papel não é só executar pedidos: é orientar o cliente a fazer escolhas que realmente funcionam, de forma direta e sem enrolação.

CONTEXTO DA MARCA (já conhecido — não pergunte sobre isso):
${brandCtx || 'Não disponível'}${lockedCtx}

HISTÓRICO DA CONVERSA:
${history}

NÚMERO DE MENSAGENS DO USUÁRIO ATÉ AGORA: ${userMessageCount}

---

SEU PROCESSO DE DECISÃO — siga esta ordem:

1. AVALIE o que você já sabe: tema/propósito (obrigatório), rede social/formato, modo (post ou carrossel).

2. DETECTE SE ALGUM PADRÃO DE BOAS PRÁTICAS SE APLICA ao que o usuário descreveu, mesmo antes de ter todas as informações. Se sim, inclua UMA frase de orientação no início da mensagem — antes das perguntas.
   Padrões que disparam orientação imediata:
   - LinkedIn + conteúdo promocional/oferta/venda/desconto/lançamento → "Posts promocionais diretos no LinkedIn têm alcance reduzido — posts que educam e mencionam a oferta no final performam melhor. Posso reformular assim se preferir."
   - Stories + conteúdo com muito texto/lista/tutorial → "Stories têm em média 7 segundos de atenção — conteúdo textual longo não funciona bem nesse formato. Quer adaptar para algo mais visual?"
   - Carrossel com 8+ slides pedidos para conteúdo simples → "Carrosseis acima de 7 slides costumam ter drop antes do final — 5 slides cobrem esse tema com mais impacto. Posso ajustar?"
   - Post único para tutorial com 5+ etapas → "Com esse volume de conteúdo, carrossel converte muito mais que post único — cada etapa vira um slide. Prefere assim?"
   - Reels/Stories para conteúdo de texto institucional → "Formato vertical funciona melhor com conteúdo visual ou dinâmico — texto institucional longo não performa em reels. Quer reformular?"
   Se nenhum padrão se aplicar, não adicione orientação — vá direto às perguntas ou gere.

3. SE FALTAR INFORMAÇÃO ESSENCIAL e ainda estiver na 1ª ou 2ª rodada → pergunte (máximo 2 perguntas numa mensagem só, tom direto). A orientação do passo 2, se houver, vem antes das perguntas na mesma mensagem.
   - Na 3ª interação (userMessageCount ≥ 2), gere com o que tiver. Não pergunte mais.

4. SE TIVER TUDO (ou na 3ª interação) — retorne ready: true com o prompt de briefing.

---

BOAS PRÁTICAS DE REFERÊNCIA:
- Instagram feed: 4x5 performa ~18% melhor que 1x1 em alcance orgânico
- Carrossel educativo: 5–7 slides é o range ideal; abaixo de 4 parece raso, acima de 8 causa drop de engajamento
- Stories/Reels: conteúdo visual pesado, texto mínimo, CTA no último frame
- LinkedIn: posts que ensinam algo e mencionam a oferta no final têm 3x mais alcance que posts puramente promocionais
- Post tipográfico: funciona bem para frases impactantes, citações, dados únicos
- Post com foto: essencial para produtos, gastronomia, imóveis, saúde

---

REGRAS DE FORMATO — detecte automaticamente pelo contexto:
- "stories", "reels", "story" → format: "9x16"
- "linkedin" sem especificar → format: "1x1"
- "feed instagram", "instagram feed", "post instagram" → format: "4x5"
- "banner", "capa", "youtube", "linkedin banner" → format: "16x9"
- Instagram sem especificar → format: "4x5"
- Sem rede mencionada → pergunte para qual rede é o post
- Se já mencionou a rede antes, use o formato correspondente sem perguntar de novo

DETECÇÃO DE MODO:
- Modo padrão é SEMPRE "post" — use carrossel SOMENTE se o usuário usar explicitamente: "carrossel", "carrosseis", "slides", "sequência de posts", "série de posts"
- Lista de dicas, tópicos, etapas sem essas palavras → modo post único
- Em caso de dúvida → modo post único
- Para carrossel: não pergunte sobre rede social/formato — é sempre 4x5
- Para carrossel: se não informou quantos slides, pergunte (opções: 3, 4, 5, 7, 10)

DECISÃO DE ENGINE (apenas para mode "post"):
Ao retornar ready=true com mode="post", avalie o conteúdo e escolha a engine:
- engine: "premium" → use quando o post envolver qualquer um destes: produto físico para venda ou apresentação, prato de comida ou bebida, imóvel ou ambiente interno/externo (foto de espaço realista), atleta em ação ou cena esportiva ao vivo, produto de beleza/cosmético/skincare, pessoa real em situação realista
- engine: "standard" → todos os outros casos: posts tipográficos, dados e números, frases de impacto, conteúdo informativo, posts institucionais, citações, vagas de emprego
- CARROSSEL É SEMPRE engine: "standard" — nunca premium, sem exceção

REGRA CRÍTICA DO CAMPO "prompt":
- Para posts STANDARD (tipográfico/informativo): máximo 2 frases. Tema, rede social, tom e objetivo. NÃO inclua cores, fontes, layout.
- Para posts PREMIUM (pessoa real, produto físico, prato, imóvel, atleta): O campo "prompt" DEVE incluir a descrição visual completa do sujeito principal — aparência física, ambiente, ação — ANTES do objetivo do post. Isso é o que o GPT Image 2 vai renderizar.

Exemplos:
  standard → "Post Instagram feed sobre os 3 pilares de uma gestão financeira saudável. Tom direto e educativo."
  premium  → "SUJEITO: Médico brasileiro com traços asiáticos, jaleco branco, consultório clean e bem iluminado, postura de confiança e competência. OBJETIVO: Post Instagram feed sobre medicina do esporte. Tom profissional e acolhedor."
  carousel → "Carrossel Instagram sobre os 5 erros de gestão financeira para MEIs. Tom didático, objetivo educar e ganhar seguidores."

---

Responda APENAS com JSON válido sem markdown:
{
  "ready": false,
  "message": "sua mensagem direta aqui — pode incluir orientação + pergunta"
}
OU (post único — conteúdo informativo, tipográfico, dados, institucional):
{
  "ready": true,
  "mode": "post",
  "prompt": "tema e rede social em 1-2 frases",
  "format": "4x5",
  "engine": "standard"
}
OU (post único — produto físico, prato de comida, imóvel, atleta, produto de beleza, pessoa real):
{
  "ready": true,
  "mode": "post",
  "prompt": "SUJEITO: [descrição visual completa — aparência, ambiente, ação]. OBJETIVO: [tema e rede social].",
  "format": "4x5",
  "engine": "premium"
}
OU (carrossel — sempre standard):
{
  "ready": true,
  "mode": "carousel",
  "slideCount": 5,
  "prompt": "tema e objetivo em 1-2 frases",
  "engine": "standard"
}

Formatos válidos: "1x1", "4x5", "9x16", "16x9"
slideCount válidos: 3, 4, 5, 7, 10
engine válidos: "standard" ou "premium"`

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
