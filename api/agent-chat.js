async function callAnthropicSimple(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(errBody?.error?.message ?? `Erro ${response.status} da API Anthropic`)
  }
  const data = await response.json()
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('')
}

async function callAnthropicWithWebSearch(prompt, apiKey) {
  const messages = [{ role: 'user', content: prompt }]

  for (let round = 0; round < 5; round++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        temperature: 0.7,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
        messages,
      }),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      throw new Error(errBody?.error?.message ?? `Erro ${response.status} da API Anthropic`)
    }

    const data = await response.json()

    if (data.stop_reason === 'end_turn') {
      return data.content.filter(b => b.type === 'text').map(b => b.text).join('')
    }

    if (data.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: data.content })

      // web_search_20250305 é server-side: resultados vêm embutidos na resposta
      const serverResults = {}
      for (const block of data.content) {
        if (block.tool_use_id) serverResults[block.tool_use_id] = block.content ?? []
      }

      const toolResults = data.content
        .filter(b => b.type === 'tool_use')
        .map(tu => ({ type: 'tool_result', tool_use_id: tu.id, content: serverResults[tu.id] ?? [] }))

      messages.push({ role: 'user', content: toolResults })
      continue
    }

    const text = (data.content ?? []).filter(b => b.type === 'text').map(b => b.text).join('')
    if (text) return text
    throw new Error(`Resposta inesperada: stop_reason=${data.stop_reason}`)
  }

  throw new Error('Agente excedeu o limite de rounds de pesquisa')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, brand, lockedTemplateId, editContext } = req.body

  console.log('[agent-chat] lockedTemplateId:', lockedTemplateId ?? '(none)', '| editMode:', !!editContext)

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  // ── MODO EDIÇÃO ──────────────────────────────────────────────────────────────
  if (editContext) {
    const textList = (editContext.textElements ?? [])
      .map(e => `  • id="${e.id}" → "${e.currentValue}"`)
      .join('\n') || '  (nenhum)'

    const shapeList = (editContext.accentElements ?? [])
      .map(e => `  • id="${e.id}" → fill: "${e.currentColor || 'desconhecida'}"`)
      .join('\n') || '  (nenhum)'

    const history = messages
      .map(m => `${m.role === 'user' ? 'Usuário' : 'Agente'}: ${m.content}`)
      .join('\n')

    const editPrompt = `Você é um assistente de edição de posts para redes sociais. O usuário abriu um post existente e quer fazer ajustes.

POST ATUAL:
- Template: ${editContext.templateBase} (formato: ${editContext.format})
- Campos de texto:
${textList}
- Elementos visuais (shapes/cores):
${shapeList}
- Imagem de fundo (prompt): "${editContext.imagePrompt || 'nenhuma'}"

HISTÓRICO DA CONVERSA:
${history}

---

INSTRUÇÕES:
- Interprete o pedido mais recente do usuário e gere as ações de edição necessárias
- Use SOMENTE os IDs de elementos listados acima — nunca invente IDs que não existem na lista
- Para cores, retorne hex válido (#RRGGBB)
- Para "destaque", "accent", "cor de detalhe", "linha colorida": use o shape element mais relevante pelo id
- Para "fundo mais escuro/claro": use recolor_background com uma cor escura ou clara
- Para "nova imagem de fundo" ou "regenera a imagem": retorne needs_confirm:true (custa 4 pulses)
- Você pode combinar múltiplas ações em um único JSON
- Máximo 1 frase no campo "message"

TIPOS DE AÇÃO VÁLIDOS:
- recolor: muda fill de um shape (campos: elementId + color)
- rewrite: muda texto de um campo (campos: fieldId + text)
- resize: muda formato do post (campo: format com valor "1x1", "4x5", "9x16" ou "16x9")
- recolor_background: muda cor sólida de fundo (campo: color)

Retorne APENAS JSON válido sem markdown:

{
  "ready": true,
  "mode": "edit",
  "actions": [
    {"type": "recolor", "elementId": "brand-line", "color": "#FF0000"},
    {"type": "rewrite", "fieldId": "title", "text": "Novo título"},
    {"type": "resize", "format": "9x16"},
    {"type": "recolor_background", "color": "#0a0a0a"}
  ],
  "message": "frase curta confirmando o que foi feito"
}

OU se o usuário pediu regenerar a imagem de fundo (com ou sem outras ações):
{
  "ready": true,
  "mode": "edit",
  "actions": [],
  "needs_confirm": true,
  "confirm_type": "regenerate_image",
  "confirm_prompt": "novo prompt em inglês para a imagem",
  "message": "Regenerar a imagem de fundo custa 4 pulses. Confirmar?"
}

OU se não entendeu o pedido:
{
  "ready": false,
  "message": "pergunta objetiva de esclarecimento em 1 frase"
}`

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
        const raw = await callAnthropicSimple(editPrompt, apiKey)
        if (!raw) throw new Error('Resposta vazia')
        const clean = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        console.log('[agent-chat] edit mode response:', JSON.stringify(parsed).slice(0, 200))
        return res.status(200).json(parsed)
      } catch (err) {
        console.error(`[agent-chat] edit mode erro attempt ${attempt}:`, err)
        if (attempt === 2) {
          return res.status(200).json({
            ready: false,
            message: 'Não consegui interpretar o pedido. Tente descrever a mudança com mais detalhes.',
          })
        }
      }
    }
    return res.status(200).json({ ready: false, message: 'Erro interno. Tente novamente.' })
  }
  // ── FIM MODO EDIÇÃO ──────────────────────────────────────────────────────────

  const brandCtx = brand ? `
Marca: ${brand.businessName || ''}
Segmento: ${brand.segment || ''}
Tom: ${brand.tone || ''}
Descrição: ${brand.brandDescription || ''}
Estilo visual: ${brand.visualStyle || ''}` : ''

  const lockedCtx = lockedTemplateId
    ? `\nTEMPLATE FIXADO PELO USUÁRIO: "${lockedTemplateId}" — o usuário já escolheu este template. Quando retornar ready:true, inclua OBRIGATORIAMENTE "templateId": "${lockedTemplateId}" no JSON. Não sugira nem use outro template.`
    : ''

  const history = messages
    .map(m => `${m.role === 'user' ? 'Usuário' : 'Agente'}: ${m.content}`)
    .join('\n')

  const userMessageCount = messages.filter(m => m.role === 'user').length

  const prompt = `Você é um designer sênior de redes sociais. Fala pouco, pergunta o essencial, gera rápido.

REGRA ABSOLUTA DE RESPOSTA: máximo 2 frases por mensagem de texto. Sem elogios. Sem contexto desnecessário. Sem repetir o que o usuário disse. Uma pergunta por vez quando precisar de informação.

CONTEXTO DA MARCA (já conhecido — não pergunte sobre isso):
${brandCtx || 'Não disponível'}${lockedCtx}

HISTÓRICO DA CONVERSA:
${history}

NÚMERO DE MENSAGENS DO USUÁRIO ATÉ AGORA: ${userMessageCount}

---

SEU PROCESSO DE DECISÃO — siga esta ordem:

1. CLASSIFIQUE o briefing:
   - COMPLETO: tem tema/propósito claro + rede social + tom ou contexto suficiente → vá direto ao passo 3
   - VAGO: tema solto sem objetivo, sem rede social, ou sem tom → faça UMA pergunta estratégica que resolva os gaps mais críticos de uma vez

   Exemplos de briefing VAGO → deve perguntar:
   - "faz um post sobre academia" → "Para qual rede e qual o objetivo — engajar alunos, captar leads ou vender matrícula?"
   - "post de vendas" → "Qual produto, para qual rede e que tom — urgência/oferta ou educativo com CTA?"
   - "algo para o dia das mães" → "Feed ou stories? Tom emocional (homenagem) ou comercial (oferta)?"

   Exemplos de briefing COMPLETO → gere direto:
   - "carrossel LinkedIn sobre os 5 erros de gestão financeira para MEIs, tom didático"
   - "post feed Instagram de nova coleção feminina, tom aspiracional"
   - "stories com oferta relâmpago de 20% no curso de inglês, urgência"

2. VERIFIQUE BOAS PRÁTICAS — mesmo para briefings completos, alerte ANTES de gerar quando identificar:
   - LinkedIn + promocional/oferta/venda → "LinkedIn promocional tem alcance baixo — prefere um post educativo com a oferta no final?"
   - Stories + texto longo/lista/dados → "Stories não funcionam com texto longo — quer adaptar para algo mais visual?"
   - Carrossel 8+ slides para tema simples → "Acima de 7 slides perde engajamento — posso fazer em 5?"
   - Post único para tutorial 5+ etapas → "Esse volume pede carrossel — cada etapa vira um slide. Prefere assim?"
   - Carrossel para conteúdo que cabe em 1 imagem → "Esse tema funciona melhor como post único — mais direto e mais compartilhável. Confirma?"
   Quando alertar, ofereça sempre uma alternativa concreta e aguarde confirmação. Não gere automaticamente após um alerta.

3. SE FALTAR INFORMAÇÃO ESSENCIAL e userMessageCount < 2 → faça UMA pergunta objetiva. Na 3ª interação (userMessageCount ≥ 2), gere com o que tiver. Não pergunte mais.

4. SE TIVER TUDO (ou na 3ª interação) — retorne ready: true com o prompt de briefing.

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

DETECÇÃO DE TÍTULOS DE SLIDES — leia isso antes de escolher a engine:
SE o usuário especificou explicitamente o título ou conteúdo de cada slide individual (ex: "Slide 1: Introdução, Slide 2: Benefícios, Slide 3: CTA"):
- OBRIGATORIAMENTE inclua o campo "slides" no JSON, com os títulos EXATOS do usuário
- O campo "slides" se aplica a qualquer engine (standard OU premium) — não é exclusivo do premium
- Use as palavras EXATAS do usuário — não parafraseie, não resuma, não invente
- slideCount deve ser igual ao número de itens no array "slides"
SE o usuário NÃO especificou títulos individuais de slides → omita o campo "slides" completamente

DECISÃO DE ENGINE (para mode "post" e mode "carousel"):
Ao retornar ready=true, avalie o conteúdo pelo critério abaixo. Em caso de dúvida, prefira premium.

engine: "premium" — escolha sempre que qualquer um destes gatilhos estiver presente:
  VISUAL REALISTA: pessoa real, rosto, atleta, médico, profissional em ação, modelo, equipe, família, cliente
  PRODUTO FÍSICO: produto para venda, embalagem, gadget, roupa, acessório, equipamento, veículo
  ALIMENTO/BEBIDA: prato de comida, lanche, sobremesa, bebida, restaurante, cardápio
  AMBIENTE: imóvel, sala, fachada, loja, escritório, clínica, ambiente interno ou externo realista
  BELEZA/SAÚDE: produto de beleza, cosmético, skincare, suplemento, farmácia
  PALAVRAS-CHAVE DO USUÁRIO: "qualidade", "fotorrealista", "premium", "profissional", "alta qualidade", "realista", "foto", "imagem real", "visual impactante"
  NATUREZA/LIFESTYLE: paisagem, viagem, esporte, lazer, estilo de vida com cena real

engine: "standard" — use SOMENTE quando o conteúdo for claramente tipográfico ou informacional e nenhum gatilho acima se aplicar:
  Posts de dados e números, frases de impacto, citações, vagas de emprego, posts institucionais sem imagem de pessoa/produto, conteúdo 100% textual

CARROSSEL PREMIUM (mode="carousel", engine="premium"): máximo 5 slides — GPT Image 2 gera cada slide individualmente e pode levar ~2 minutos. Se o usuário pediu mais de 5 slides para um tema fotorrealista, avise: "Carrossel premium usa GPT Image 2 — máximo 5 slides. Prefere 5 slides premium (fotorrealista) ou N slides padrão?" e aguarde confirmação antes de enviar ready:true.

REGRA CRÍTICA DO CAMPO "prompt":
- Para posts STANDARD (tipográfico/informativo): máximo 2 frases. Tema, rede social, tom e objetivo. NÃO inclua cores, fontes, layout.
- Para posts PREMIUM (pessoa real, produto físico, prato, imóvel, atleta): O campo "prompt" DEVE incluir a descrição visual completa do sujeito principal — aparência física, ambiente, ação — ANTES do objetivo do post. Isso é o que o GPT Image 2 vai renderizar.
- Para CARROSSEL PREMIUM: o campo "prompt" DEVE descrever o sujeito visual principal que aparecerá em todos os slides — ex: "SUJEITO: garrafa de azeite artesanal em cozinha italiana iluminada. OBJETIVO: diferenciais do produto, tom sofisticado." Os textos de cada slide são gerados automaticamente.

Exemplos:
  standard → "Post Instagram feed sobre os 3 pilares de uma gestão financeira saudável. Tom direto e educativo."
  premium  → "SUJEITO: Médico brasileiro com traços asiáticos, jaleco branco, consultório clean e bem iluminado, postura de confiança e competência. OBJETIVO: Post Instagram feed sobre medicina do esporte. Tom profissional e acolhedor."
  carousel standard → "Carrossel Instagram sobre os 5 erros de gestão financeira para MEIs. Tom didático, objetivo educar e ganhar seguidores."
  carousel premium → "SUJEITO: garrafa de azeite artesanal em cozinha italiana iluminada. OBJETIVO: Carrossel Instagram sobre os diferenciais do produto, tom sofisticado."

---

PESQUISA WEB — use a ferramenta quando necessário:
Use web_search ANTES de retornar ready:true quando o pedido envolver informações externas e atuais:
- Datas de eventos, feriados ou comemorações (Carnaval, Dia do Cliente, Semana do Consumidor, datas específicas)
- Tendências de redes sociais ou de mercado com contexto temporal ("tendências 2025", "o que está em alta")
- Estatísticas, dados ou notícias recentes sobre um tema
- Informações específicas sobre empresas, produtos, eventos ou pessoas reais
NÃO pesquise para temas genéricos ou atemporais ("post motivacional", "dicas de vendas", "frases de impacto").
Após pesquisar, incorpore os dados encontrados no campo "prompt" do JSON de retorno para enriquecer o briefing.

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
  "engine": "standard",
  "templateId": "nome-do-template-se-fixado-pelo-usuario-ou-omitir"
}
OU (post único — produto físico, prato de comida, imóvel, atleta, produto de beleza, pessoa real):
{
  "ready": true,
  "mode": "post",
  "prompt": "SUJEITO: [descrição visual completa — aparência, ambiente, ação]. OBJETIVO: [tema e rede social].",
  "format": "4x5",
  "engine": "premium",
  "templateId": "nome-do-template-se-fixado-pelo-usuario-ou-omitir"
}
OU (carrossel — conteúdo tipográfico, educativo, informativo — sem títulos especificados):
{
  "ready": true,
  "mode": "carousel",
  "slideCount": 5,
  "prompt": "tema e objetivo em 1-2 frases",
  "engine": "standard",
  "templateId": "nome-do-template-se-fixado-pelo-usuario-ou-omitir"
}
OU (carrossel standard — quando o usuário especificou os títulos de cada slide explicitamente):
{
  "ready": true,
  "mode": "carousel",
  "slideCount": 3,
  "prompt": "tema e objetivo em 1-2 frases",
  "engine": "standard",
  "templateId": "nome-do-template-se-fixado-pelo-usuario-ou-omitir",
  "slides": [
    {"title": "título exato do slide 1 como o usuário disse", "body": "subtítulo ou corpo opcional"},
    {"title": "título exato do slide 2", "body": "corpo opcional"},
    {"title": "título exato do slide 3", "body": "corpo opcional"}
  ]
}
OU (carrossel — pessoas, produtos físicos, pratos, ambientes realistas — max 5 slides — sem títulos especificados):
{
  "ready": true,
  "mode": "carousel",
  "slideCount": 5,
  "prompt": "SUJEITO: [elemento visual principal que aparece em todos os slides]. OBJETIVO: [tema e rede social].",
  "engine": "premium"
}
OU (carrossel premium — quando o usuário especificou os títulos de cada slide explicitamente):
{
  "ready": true,
  "mode": "carousel",
  "slideCount": 3,
  "prompt": "SUJEITO: [elemento visual principal]. OBJETIVO: [tema e rede social].",
  "engine": "premium",
  "slides": [
    {"title": "título exato do slide 1 como o usuário disse", "body": "subtítulo ou corpo opcional"},
    {"title": "título exato do slide 2", "body": "corpo opcional"},
    {"title": "título exato do slide 3", "body": "corpo opcional"}
  ]
}

Formatos válidos: "1x1", "4x5", "9x16", "16x9"
slideCount válidos: 3, 4, 5, 7, 10
engine válidos: "standard" ou "premium"`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))

      const raw = await callAnthropicWithWebSearch(prompt, apiKey)
      if (!raw) throw new Error('A API retornou uma resposta vazia')

      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      if (lockedTemplateId && parsed.ready) parsed.templateId = lockedTemplateId
      console.log('[agent-chat] response templateId:', parsed.templateId ?? '(none)')
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
