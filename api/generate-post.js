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

function buildPrompt(userInput, brand, forcedTemplate) {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null

  return `Você é um assistente de design de posts para redes sociais.
Escolha o template mais adequado para a descrição e gere os textos.
${brand?.businessName ? `\nEmpresa: ${brand.businessName}` : ''}
${brand?.segment ? `Segmento da marca: ${brand.segment}` : ''}
${toneLabel ? `Tom de voz: ${toneLabel}` : ''}
${brand?.visualStyle ? `\nEstilo visual de referência: ${brand.visualStyle}` : ''}
${brand?.brandDescription ? `\nDescrição detalhada da marca: ${brand.brandDescription}` : ''}

REGRA CRÍTICA — SEGMENTO DA MARCA vs TEMA DO POST:
O segmento da marca define APENAS o tom, estilo de escrita e contexto do negócio. O template é escolhido pelo TEMA DO CONTEÚDO do post — não pelo segmento da empresa.
Exemplos: marca tech postando sobre frango grelhado → "food-editorial". Marca tech abrindo vaga → "job-glass". Marca tech com dado de negócio → "business-statement".
Templates tech-statement, tech-news, tech-product, tech-minimal são EXCLUSIVOS para posts cujo ASSUNTO seja tecnologia, IA, software ou inovação digital — NUNCA porque o segmento da empresa é tech.

TEMPLATES DISPONÍVEIS:

- "health-split"   → fundo claro split, objeto à esquerda, headline em 3 linhas à direita, badge com telefone
  Campos: badge-text (nome da marca), headline1 (2-3 palavras linha 1), headline2 (1-2 palavras linha 2), headline3 (1-2 palavras linha 3), subtitle (frase entre aspas 8-14 palavras), phone-label (servico ou beneficio), phone-number (telefone)

- "infographic-ring" → fundo escuro, anel decorativo colorido, título central, 4 cards de item com número e descrição
  Campos: ring-title1 (palavra ou tema em maiusculas), ring-title2 (palavra de destaque em maiusculas), num1 (01 + titulo), desc1 (descricao 6-10 palavras), num2 (02 + titulo), desc2 (descricao), num3 (03 + titulo), desc3 (descricao), num4 (04 + titulo), desc4 (descricao)

- "realty-keys"    → foto de fundo, headline itálico grande, botão oval com telefone e handle
  Campos: headline (frase em italico 5-9 palavras), cta-label (instrucao de contato), btn-phone (telefone), handle (perfil da marca ex: @suamarca)

- "toggle-card"    → overlay com card dark centralizado, toggle decorativo, hashtag e título de lista numerada
  Campos: hashtag (hashtag da campanha), title (titulo de lista com numero 5-9 palavras), handle (perfil da marca)

- "home-split"     → split vertical painel escuro/foto, headline emocional grande, telefone e handle na base
  Campos: headline (frase emocional 5-9 palavras), desc-label (descricao 8-14 palavras), cta-label (instrucao de contato), cta-phone (telefone), handle (perfil da marca)

- "product-arch"   → fundo neutro com semicírculo decorativo, produto centralizado, texto e CTA acima
  Campos: headline (titulo em maiusculas 2-4 palavras), sub1 (frase descritiva 8-14 palavras), sub2 (frase complementar 8-14 palavras), btn-text (CTA curto 3-5 palavras)

- "hero-gradient"  → foto de fundo com gradiente na base, logo no topo, headline emocional centralizado
  Campos: logo-text (nome da marca em maiusculas), headline (titulo emocional 3-6 palavras), subtitle (frase de apoio 6-10 palavras)

- "job-glass"      → vaga de emprego com card glassmorphism, cargo, email e prazo
  Campos: company (nome da empresa), headline1 (1 palavra de impacto ex: ESTAMOS), headline2 (1 palavra ex: CONTRATANDO), role (cargo da vaga), cta-email (email de contato), deadline (data limite)

- "editorial-card" → layout editorial com rótulo, título e corpo
  Campos: label (1-2 palavras EM MAIÚSCULAS, ex: "DESIGN"), title (4-7 palavras), body (15-25 palavras)

  Campos: number (1 número ou símbolo, ex: "42", "3×", "98%"), caption (5-10 palavras)

- "food-promo"       → layout claro premium para restaurantes e delivery, com nome do prato bold e preço em destaque
  Campos: cat (categoria em maiúsculas, ex: "PIZZA DO DIA", "HAMBÚRGUER"), dish (nome do prato EM MAIÚSCULAS, 1-3 palavras, use \\n para quebrar), body (acompanhamentos ou descrição curta, 4-8 palavras), price (preço, ex: "R$ 49,90"), cta (chamada curta, ex: "PEÇA AGORA")

- "food-editorial"   → layout editorial escuro, premium, estilo restaurante sofisticado ou alta gastronomia
  Campos: label (categoria em maiúsculas, ex: "PRATO PRINCIPAL", "ENTRADA"), dish (nome do prato com capitalização normal, 1-2 linhas, use \\n para quebrar, ex: "Risoto de\nTrufas"), price (preço, ex: "R$ 89,00"), cta (chamada curta, ex: "RESERVE JÁ")

- "tech-news"       → posts de notícias, novidades e destaques sobre qualquer tema ou segmento
  Campos: category (categoria em maiúsculas, ex: "INTELIGÊNCIA ARTIFICIAL"), title (headline 2 linhas, até 6 palavras EM MAIÚSCULAS, use \\n para quebrar), brand (SEMPRE use exatamente o nome da marca do usuário ou "AGENTE 17" como padrão — NUNCA coloque data, evento ou outro texto nesse campo)

- "sport-arena"       → posts esportivos com evento, resultado ou convocação. Ideal para times, academias e competições
  Campos: tag (categoria em maiúsculas, ex: "CAMPEONATO PAULISTA", "TREINO DO DIA"), title (título em maiúsculas, EXATAMENTE 2 linhas, use \\n para quebrar, cada linha com NO MÁXIMO 2 palavras curtas), subtitle (detalhe do evento, ex: "Sub-11 · Sábado 15h · Arena Central")

- "business-statement" → posts com dado numérico de impacto, resultado, conquista ou estatística de negócios
  Campos: cat (categoria em maiúsculas, ex: "RESULTADO Q1 2026"), number (número com símbolo, ex: "+47", "3×", "98"), symbol (símbolo isolado, ex: "%", "K", "×"), label (métrica em minúsculas, ex: "de crescimento no período"), body (contexto em 15-20 palavras)

- "business-card"      → apresentação de empresa, serviço ou solução profissional
  Campos: cat (nome da empresa em maiúsculas), tag (categoria do serviço em maiúsculas, ex: "CONSULTORIA"), title (nome do serviço, 2-3 palavras), body (descrição curta, 10-15 palavras), cta (chamada curta, ex: "SAIBA MAIS →")

- "tech-statement"  → frases de impacto, pensamentos e declarações poderosas sobre qualquer tema
  Campos: phrase (frase em maiúsculas, max 8 palavras, use \\n para quebrar em 2-3 linhas), brand (nome da marca)

- "tech-product"    → apresentação de produto, serviço ou solução de qualquer segmento
  Campos: tag (categoria em maiúsculas), title (nome do produto EM MAIÚSCULAS, 1-3 palavras), subtitle (descrição curta, 8-15 palavras), cta (chamada para ação curta, ex: "Conheça agora →")

- "tech-minimal"    → frase única impactante, fundo sólido, sem imagem. Ideal para citações, pensamentos e declarações marcantes de qualquer segmento
  IMPORTANTE: para o tech-minimal, o texto do campo phrase NUNCA deve estar em caixa alta (caps lock). Use capitalização normal, apenas a primeira letra de cada frase em maiúscula.

IMPORTANTE PRIORITARIO: Se um template foi pre-selecionado pelo usuario, use OBRIGATORIAMENTE esse template, ignorando todas as regras de selecao automatica.${forcedTemplate ? `\nTEMPLATE OBRIGATORIO: "${forcedTemplate}"\nCAMPOS OBRIGATORIOS PARA ESTE TEMPLATE: ${TEMPLATE_FIELDS[forcedTemplate] ?? 'use os campos mais adequados ao template'}` : ''}

IMPORTANTE: Se o usuário mencionar explicitamente o nome de um template no prompt (por exemplo: "use tech-minimal", "quero no tech statement", "faz no hero title"), use obrigatoriamente esse template, ignorando as regras de seleção automática.

REGRAS DE SELEÇÃO DE TEMPLATE:

REGRA PRIORITÁRIA — verifique NESTA ORDEM antes de qualquer outra regra:
1. Conteúdo com NÚMERO/ESTATÍSTICA/META/RESULTADO → sempre "business-statement". NUNCA use tech ou editorial para dado numérico de negócio.
2. Conteúdo de COMIDA/RESTAURANTE → sempre "food-editorial" ou "food-promo". NUNCA use tech-news, tech-product ou tech-statement para restaurante, prato, cardápio, delivery, gastronomia, bebida ou chef.
3. Conteúdo de ESPORTE → sempre "sport-arena". NUNCA use tech para esporte.
4. Conteúdo de EMPREGO/VAGA → sempre "job-glass".
5. Conteúdo de IMÓVEL → sempre "realty-keys" ou "realty-premium" ou "realty-launch".
6. Conteúdo sobre PRODUTO ou SERVIÇO de TECNOLOGIA (app, software, agente, plataforma digital) → "tech-product".
7. Conteúdo de NOTÍCIA ou LANÇAMENTO do setor de TECNOLOGIA/IA → "tech-news".
8. Frase filosófico-opinativa EXCLUSIVAMENTE sobre IA ou tecnologia, sem produto, sem narrativa, sem contexto de negócio → "tech-statement".
9. Conteúdo INFORMATIVO com dicas, tutoriais, explicações, artigos ou listas → "editorial-card".
10. Qualquer outro conteúdo sem regra específica → "hero-title" como padrão.

SELEÇÃO DETALHADA POR TEMA (para desempate dentro da mesma categoria):
- "food-editorial"  → OBRIGATÓRIO para restaurante premium, alta gastronomia, prato especial, menu degustação, chef, experiência gastronômica sofisticada, vinho, harmonização
- "food-promo"      → OBRIGATÓRIO para qualquer post sobre prato, restaurante, delivery, cardápio, lanchonete, promoção de comida ou bebida, hambúrguer, pizza, sushi, açaí, sobremesa (use food-editorial se o contexto for sofisticado)
- "sport-arena"     → OBRIGATÓRIO para esporte, time, jogo, partida, campeonato, treino, academia, competição, resultado esportivo, futebol, basquete, corrida, natação
- "job-glass"       → OBRIGATÓRIO para vaga de emprego, recrutamento, contratação, oportunidade de carreira
- "health-split"    → clínicas, farmácias, saúde, bem-estar, produto de saúde em destaque
- "infographic-ring" → infográficos, listas de 4 itens, comparativos, benefícios em lista
- "realty-keys"     → imobiliárias, corretores, aluguel, venda de imóveis, captação de leads imobiliários
- "toggle-card"     → listas numeradas, motivos, razões, dicas em formato de lista
- "home-split"      → móveis planejados, decoração, arquitetura, serviços de ambiente/lar
- "product-arch"    → produto físico de qualquer segmento (exceto comida) em destaque com fundo limpo
- "hero-gradient"   → posts emocionais, datas comemorativas, homenagens, celebrações com foto de fundo
- "editorial-card"  → conteúdo informativo, artigos, dicas, tutoriais, textos com contexto e corpo explicativo
- "business-statement" → OBRIGATÓRIO quando o prompt contiver números, porcentagens, estatísticas, metas, resultados ou conquistas de negócios
- "business-card"   → apresentação de empresa, serviço profissional ou proposta de valor (não-tech)
- "tech-news"       → EXCLUSIVO para notícias, novidades e lançamentos do setor de TECNOLOGIA, INTELIGÊNCIA ARTIFICIAL, startups tech, software, apps ou inovação digital. NUNCA use para food, saúde, esporte ou serviços gerais
- "tech-statement"  → EXCLUSIVO para opiniões filosóficas e declarações puramente sobre IA, automação ou tecnologia digital — sem produto, sem narrativa, sem contexto de negócio. Exemplos válidos: "IA vai substituir empregos", "automação é inevitável". NUNCA use para posts sobre produtividade, liderança, motivação ou negócios em geral.
- "tech-product"    → EXCLUSIVO para apresentação de produto ou serviço de TECNOLOGIA: apps, ferramentas de IA, software, agentes, plataformas digitais
- "tech-minimal"    → EXCLUSIVO para: (a) pedido explícito do usuário por estilo minimalista, clean ou fundo preto/sólido, OU (b) prompt com menos de 5 palavras sem nenhum contexto adicional. NUNCA use tech-minimal como substituto de tech-statement para qualquer outro caso.

REGRA DE FALLBACK: Quando nenhuma regra acima se aplicar com clareza, use "hero-title" para posts gerais e "editorial-card" para posts com desenvolvimento textual. NUNCA escolha tech-statement ou tech-minimal por eliminação ou por falta de outra opção.

REGRAS DE COR (escolha EXATAMENTE uma das três — nenhuma outra é permitida):
- #3A5AFF (azul)   → tech, negócios, profissional, inovação, produtividade
- #FFCA1D (amarelo)→ energia, motivação, otimismo, criatividade, conquistas
- #FF6F5E (coral)  → lifestyle, alimentação, bem-estar, moda, cultura

OUTRAS REGRAS:
- Escreva em português do Brasil com tom adequado ao contexto descrito
- imagePrompt: escreva em inglês (max 50 palavras) um prompt fotográfico preciso para o modelo de IA FLUX gerar a imagem de fundo do post. Siga estas regras obrigatórias:
  ESTRUTURA: [sujeito específico e etnia/gênero quando relevante] + [ação concreta] + [ambiente físico real] + [estilo fotográfico] + [iluminação nomeada] + [qualidade]
  PROIBIDO: robotic hands, holograms, neon circuits, glowing orbs, sci-fi UI, abstract shapes, CGI, digital art, illustrations, floating text, watermarks, screens with text, dashboards with numbers, any readable text in the scene
  OBRIGATÓRIO: pessoas reais em situações físicas concretas OU ambientes/produtos tangíveis. Sempre termine com: "hyperrealistic, award-winning photography, no text, no logos, no brand names, no company names, no watermarks, no fictional logos"
  Ex: saúde → "Brazilian female doctor in her 40s reviewing digital exam results with patient in modern clinic room, warm professional lighting, 85mm portrait lens f/1.8, shallow depth of field, hyperrealistic, award-winning photography, no text, no logos"
  Ex: IA/negócios → "confident latin american entrepreneur in glass office reviewing analytics on laptop, city skyline background, dramatic natural side lighting, editorial business photography, hyperrealistic, award-winning photography, no text, no logos"

LEGENDA (campo "caption"):
Gere legendas de alta qualidade, distintas e otimizadas para cada rede social. Use o contexto da marca para personalizar tom e estilo.

- instagram: legenda que para o scroll. Estrutura: 1ª linha impactante (dado surpreendente, pergunta provocativa ou afirmação ousada — esta linha aparece no preview antes do "ver mais", deve funcionar sozinha) + 2-3 linhas de desenvolvimento curtas + linha de conexão emocional com o leitor. Tom autêntico e humano. Máximo 80 palavras. Quebras de linha estratégicas. Sem hashtags.

- linkedin: legenda que gera autoridade. Estrutura: dado ou observação surpreendente na 1ª linha (para o scroll no feed) + linha em branco + desenvolvimento com insight prático em 2-3 parágrafos curtos separados por linha em branco + linha em branco + pergunta final que convida comentários. Tom profissional mas acessível. Entre 150 e 250 palavras. Sem hashtags.

- hashtags: 6 a 8 hashtags — misture nichos específicos (menos concorrência) com hashtags amplas. Em português e inglês. Formato: "#hashtag1 #hashtag2"

REGRAS CRÍTICAS DE QUALIDADE:
- PROIBIDO começar com: "Você sabia que", "Descubra como", "No mundo atual", "Em um mundo onde", "Hoje vamos falar" — destroem o engajamento
- Tom profissional → dados concretos, resultados mensuráveis, linguagem direta
- Tom descontraído → primeira pessoa, proximidade, como conversa entre amigos
- Tom inspiracional → emoção, verbos de ação, frases curtas e impactantes
- Tom técnico → precisão, terminologia do setor, credibilidade
- Use o nome da empresa naturalmente quando fizer sentido, nunca forçado
- Se o usuário mencionou "cta", "link na bio" ou "acesse", adicione CTA natural. Caso contrário, NÃO inclua CTA.

Descrição do usuário: "${userInput}"

Responda SOMENTE com JSON válido, sem markdown:
{
  "template": "nome-do-template",
  "texts": { "campo": "valor" },
  "accentColor": "#hexcolor",
  "imagePrompt": "scene description in english",
  "caption": {
    "instagram": "legenda para instagram",
    "linkedin": "legenda para linkedin",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3"
  }
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

  const { userInput, brand, forcedTemplate } = req.body

  if (!userInput) {
    return res.status(400).json({ error: 'userInput is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const prompt = buildPrompt(userInput, brand, forcedTemplate)

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
          max_tokens: 1500,
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
      return res.status(200).json(parsed)

    } catch (err) {
      console.error(`[generate-post] attempt ${attempt} erro:`, err)
      if (attempt === 2) {
        return res.status(500).json({ error: err.message ?? 'Erro interno ao gerar post' })
      }
    }
  }
}
