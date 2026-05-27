const TEMPLATE_FIELDS = {
  'sport-arena':        'tag (categoria do evento em maiusculas), title (titulo em maiusculas, 2 linhas com \\n), subtitle (detalhe do evento)',
  'sport-brand':        'brand-label (nome da marca), phrase-line1 (1 palavra em maiusculas), phrase-line2 (1 palavra em maiusculas na cor de destaque), tagline (slogan curto com pontos separadores)',
  'food-editorial':     'label (categoria em maiusculas), dish (nome do prato, 1-2 linhas), price (preco com R$), cta (chamada curta)',
  'food-promo':         'cat (categoria em maiusculas), dish (nome do prato em maiusculas), body (acompanhamentos curtos), price (preco com R$), cta (chamada)',
  'business-statement': 'cat (categoria em maiusculas), number (numero com simbolo, ex: +47), symbol (simbolo isolado, ex: %), label (metrica em minusculas), body (contexto em 15-20 palavras)',
  'business-card':      'cat (nome da empresa em maiusculas), tag (categoria do servico em maiusculas), title (nome do servico 2-3 palavras), body (descricao curta 10-15 palavras), cta (chamada curta)',
  'health-content':     'badge (especialidade em maiusculas), title (titulo direto 4-8 palavras), body (explicacao 15-25 palavras), doctor (nome do medico), crm (especialidade e CRM)',
  'health-stats':       'cat (especialidade em maiusculas), tag (tipo do dado em maiusculas), title (pergunta ou afirmacao impactante), stat1-num (primeiro numero), stat1-label (label do primeiro numero), stat2-num (segundo numero), stat2-label (label do segundo numero), cta (chamada)',
  'build-impact':       'cat (categoria em maiusculas), number (numero com unidade, ex: +120), label (metrica em maiusculas), body (descricao da obra em 15-20 palavras)',
  'build-editorial':    'cat (tipo de empresa em maiusculas), tag (categoria do servico em maiusculas), title (nome do servico em maiusculas), body (descricao 10-15 palavras), cta (chamada)',
  'realty-premium':     'cat (tipo de imovel e bairro), tag (classificacao, ex: EXCLUSIVO), type (tipo e localizacao), title (descricao elegante do imovel), detail1-num (area), detail2-num (suites), detail3-num (vagas), price (preco formatado), cta (chamada)',
  'realty-launch':      'cat (tipo de empresa), tag (status, ex: LANCAMENTO), tag-text (texto da badge), title (nome do empreendimento em maiusculas), spec1-val (area), spec2-val (quartos), spec3-val (ano de entrega), price (preco inicial), cta (chamada)',
  'fashion-editorial':  'brand (nome da marca em maiusculas), num (numero da peca, ex: 001), title (nome da peca em portugues, pode ser em 2 linhas), cat (colecao e ano)',
  'fashion-drop':       'brand (nome da marca em maiusculas), tag (tipo de oferta, ex: SALE), label (descricao da oferta em maiusculas), line1 (primeira linha do destaque em maiusculas), line2 (segunda linha do destaque em maiusculas com %), cta (chamada)',
  'health-split':       'badge-text (nome da marca ou clinica), headline1 (2-3 palavras linha 1), headline2 (1-2 palavras linha 2), headline3 (1-2 palavras linha 3 em bold), subtitle (frase entre aspas 8-14 palavras), phone-label (servico ou beneficio ex: Entrega Gratuita), phone-number (telefone de contato)',
  'infographic-ring':   'ring-title1 (palavra ou tema em maiusculas), ring-title2 (palavra de destaque em maiusculas), num1 (01 + titulo do item), desc1 (descricao do item 1, 6-10 palavras), num2 (02 + titulo), desc2 (descricao item 2), num3 (03 + titulo), desc3 (descricao item 3), num4 (04 + titulo), desc4 (descricao item 4)',
  'realty-keys':        'headline (frase em italico 5-9 palavras sobre imovel), cta-label (instrucao de contato ex: Entre em contato!), btn-phone (telefone ou whatsapp), handle (perfil da marca ex: @suamarca)',
  'toggle-card':        'hashtag (hashtag da campanha ex: #suamarca), title (titulo de lista ou pergunta 5-9 palavras com numero), handle (perfil da marca ex: @suamarca)',
  'home-split':         'headline (frase emocional 5-9 palavras), desc-label (descricao do produto/servico 8-14 palavras), cta-label (instrucao de contato ex: Solicite o seu orcamento), cta-phone (telefone ou whatsapp), handle (perfil da marca ex: @suamarca)',
  'product-arch':       'headline (titulo em maiusculas 2-4 palavras), sub1 (frase descritiva 8-14 palavras), sub2 (frase complementar 8-14 palavras), btn-text (CTA curto 3-5 palavras)',
  'hero-gradient':      'logo-text (nome da marca em maiusculas), headline (titulo emocional 3-6 palavras), subtitle (frase de apoio 6-10 palavras)',
  'job-glass':          'company (nome da empresa), headline1 (1 palavra de impacto ex: ESTAMOS), headline2 (1 palavra ex: CONTRATANDO), role (cargo da vaga), cta-email (email de contato), deadline (data limite ex: 31 de Dezembro de 2025)',
  'editorial-card':     'label (1-2 palavras em maiusculas), title (4-7 palavras), body (15-25 palavras)',
  'tech-statement':     'phrase (frase em maiusculas max 8 palavras com \\n), brand (nome da marca)',
  'tech-news':          'category (categoria em maiusculas), title (headline 2 linhas em maiusculas com \\n), brand (nome da marca)',
  'tech-product':       'tag (categoria em maiusculas), title (nome do produto em maiusculas), subtitle (descricao 8-15 palavras), cta (chamada curta)',
  'tech-minimal':       'phrase (frase impactante em capitalizacao normal)',
}

function buildCarouselPrompt(userInput, slideCount, brand, templateId) {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null

  const templateFields = templateId ? (TEMPLATE_FIELDS[templateId] ?? '') : ''
  const templateInstruction = templateId && templateFields
    ? `\nTEMPLATE ATIVO: "${templateId}"\nCAMPOS DO TEMPLATE: ${templateFields}\nPara cada slide, preencha o campo "texts" com os IDs exatos dos campos listados acima.`
    : ''

  const exampleTexts = templateId && templateFields
    ? `"texts": { ${templateFields.split(',').map(f => `"${f.trim().split(' ')[0]}": "..."`).join(', ')} }`
    : `"texts": { "title": "...", "body": "..." }`

  return `Você é um especialista em criação de carrosséis para Instagram.
${brand?.businessName ? `\nEmpresa: ${brand.businessName}` : ''}
${brand?.segment ? `Segmento: ${brand.segment}` : ''}
${toneLabel ? `Tom de voz: ${toneLabel}` : ''}
${brand?.visualStyle ? `\nEstilo visual de referência: ${brand.visualStyle}` : ''}
${brand?.brandDescription ? `\nDescrição detalhada da marca: ${brand.brandDescription}` : ''}
${templateInstruction}
Crie um carrossel com EXATAMENTE ${slideCount} slides sobre o tema descrito. NÃO crie mais nem menos que ${slideCount} slides.
REGRAS OBRIGATÓRIAS:
- Slide 1: type "cover" — conteúdo de capa impactante
- Slides 2 a ${slideCount - 1}: type "content" — conteúdo educativo/informativo
- Slide ${slideCount}: type "cta" — call to action claro
- Cada slide deve ter conteúdo diferente mas tematicamente coerente com o anterior
- Os textos de cada slide devem ser mapeados nos campos corretos do template
REGRAS DE imagePrompt:
- Descreva em inglês (máximo 12 palavras) uma cena fotográfica real relacionada ao slide
- Cada slide deve ter uma cena visualmente diferente mas tematicamente coerente
- Não use texto, logos, marcas, hologramas ou mãos robóticas nas imagens
- Termine sempre com: "hyperrealistic, award-winning photography, no text, no logos"
REGRAS DE TEXTO:
- Escrever em português do Brasil
- Tom direto e alinhado com a marca
- Títulos sem ponto final
- Cada slide deve avançar a narrativa do anterior
caption: legenda completa para Instagram com tom humano, máximo 150 palavras, incluindo 5 hashtags relevantes no final.
Tema: "${userInput}"
Responda SOMENTE com JSON válido, sem markdown, com EXATAMENTE ${slideCount} slides:
{
  "slides": [
    { ${exampleTexts}, "imagePrompt": "...", "type": "cover" },
    { ${exampleTexts}, "imagePrompt": "...", "type": "content" },
    { ${exampleTexts}, "imagePrompt": "...", "type": "cta" }
  ],
  "caption": "..."
}`
}

function extractJSON(raw) {
  const text = raw.trim()
  try { return JSON.parse(text) } catch { /* segue */ }
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (block) try { return JSON.parse(block[1]) } catch { /* segue */ }
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) try { return JSON.parse(obj[0]) } catch { /* segue */ }
  throw new Error('Resposta da IA não pôde ser interpretada como JSON')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userInput, slideCount, brand, templateId, captionOnly, captionPrompt } = req.body

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  // Modo legenda: gera apenas caption via Claude Haiku, sem slides
  if (captionOnly) {
    if (!captionPrompt) return res.status(400).json({ error: 'captionPrompt é obrigatório no modo captionOnly' })
    const brandCtx = brand
      ? `Marca: ${brand.businessName || ''}. Segmento: ${brand.segment || ''}. Tom: ${brand.tone || ''}.`
      : ''
    const prompt = `Você é um especialista em marketing digital brasileiro. Crie legendas para um post de redes sociais.

Contexto do post: ${captionPrompt}
${brandCtx}

Retorne APENAS JSON válido sem markdown:
{
  "instagram": "legenda curta e impactante para Instagram, máximo 80 palavras, tom humano e direto, sem hashtags",
  "linkedin": "legenda profissional para LinkedIn entre 150 e 250 palavras, começa com dado ou observação relevante, termina com pergunta para engajamento, sem hashtags",
  "hashtags": "6 a 8 hashtags relevantes separadas por espaço em português e inglês"
}`
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, temperature: 0.7, messages: [{ role: 'user', content: prompt }] }),
      })
      if (!response.ok) throw new Error(`Anthropic error ${response.status}`)
      const data = await response.json()
      const raw = data?.content?.[0]?.text ?? '{}'
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return res.status(200).json({
        instagram: parsed.instagram ?? '',
        linkedin: parsed.linkedin ?? '',
        hashtags: parsed.hashtags ?? '',
      })
    } catch (err) {
      console.error('[generate-carousel/caption] erro:', err)
      return res.status(500).json({ error: `Erro ao gerar legenda: ${err.message}` })
    }
  }

  if (!userInput || !slideCount) {
    return res.status(400).json({ error: 'userInput e slideCount são obrigatórios' })
  }

  const prompt = buildCarouselPrompt(userInput, slideCount, brand, templateId)

  // max_tokens: cada slide tem texts + imagePrompt. 10 slides × ~150 tokens + caption ≈ 2000
  const maxTokens = Math.min(500 + slideCount * 200, 3000)

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 3000 * attempt))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          temperature: 0.8,
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

      const parsed = extractJSON(raw)

      if (!parsed.slides || !Array.isArray(parsed.slides)) {
        throw new Error('Resposta não contém array de slides válido')
      }

      return res.status(200).json(parsed)

    } catch (err) {
      console.error(`[generate-carousel] attempt ${attempt} erro:`, err)
      if (attempt === 2) {
        return res.status(500).json({ error: err.message ?? 'Erro interno ao gerar carrossel' })
      }
    }
  }
}
