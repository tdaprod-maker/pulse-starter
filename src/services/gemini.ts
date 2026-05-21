// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AIResponse {
  template: string
  texts: Record<string, string>
  accentColor?: string
  /** Prompt em inglês para gerar a imagem de fundo via Replicate. */
  imagePrompt?: string
  caption?: {
    instagram: string
    linkedin: string
    hashtags: string
  }
}

// ─── Brand Context ────────────────────────────────────────────────────────────

export interface BrandContext {
  businessName?: string
  segment?: string
  tone?: string
  visualStyle?: string
  brandDescription?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`
const API_URL_FALLBACK = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`

// ─── Prompt ───────────────────────────────────────────────────────────────────


const TEMPLATE_FIELDS: Record<string, string> = {
  'sport-arena':          'tag (categoria do evento em maiusculas), title (titulo em maiusculas, 2 linhas com \\n), subtitle (detalhe do evento)',
  'sport-brand':          'brand-label (nome da marca), phrase-line1 (1 palavra em maiusculas), phrase-line2 (1 palavra em maiusculas na cor de destaque), tagline (slogan curto com pontos separadores)',
  'food-editorial':       'label (categoria em maiusculas), dish (nome do prato, 1-2 linhas), price (preco com R$), cta (chamada curta)',
  'food-promo':           'cat (categoria em maiusculas), dish (nome do prato em maiusculas), body (acompanhamentos curtos), price (preco com R$), cta (chamada)',
  'business-statement':   'cat (categoria em maiusculas), number (numero com simbolo, ex: +47), symbol (simbolo isolado, ex: %), label (metrica em minusculas), body (contexto em 15-20 palavras)',
  'business-card':        'cat (nome da empresa em maiusculas), tag (categoria do servico em maiusculas), title (nome do servico 2-3 palavras), body (descricao curta 10-15 palavras), cta (chamada curta)',
  'health-content':       'badge (especialidade em maiusculas), title (titulo direto 4-8 palavras), body (explicacao 15-25 palavras), doctor (nome do medico), crm (especialidade e CRM)',
  'health-stats':         'cat (especialidade em maiusculas), tag (tipo do dado em maiusculas), title (pergunta ou afirmacao impactante), stat1-num (primeiro numero), stat1-label (label do primeiro numero), stat2-num (segundo numero), stat2-label (label do segundo numero), cta (chamada)',
  'build-impact':         'cat (categoria em maiusculas), number (numero com unidade, ex: +120), label (metrica em maiusculas), body (descricao da obra em 15-20 palavras)',
  'build-editorial':      'cat (tipo de empresa em maiusculas), tag (categoria do servico em maiusculas), title (nome do servico em maiusculas), body (descricao 10-15 palavras), cta (chamada)',
  'realty-premium':       'cat (tipo de imovel e bairro), tag (classificacao, ex: EXCLUSIVO), type (tipo e localizacao), title (descricao elegante do imovel), detail1-num (area), detail2-num (suites), detail3-num (vagas), price (preco formatado), cta (chamada)',
  'realty-launch':        'cat (tipo de empresa), tag (status, ex: LANCAMENTO), tag-text (texto da badge), title (nome do empreendimento em maiusculas), spec1-val (area), spec2-val (quartos), spec3-val (ano de entrega), price (preco inicial), cta (chamada)',
  'fashion-editorial':    'brand (nome da marca em maiusculas), num (numero da peca, ex: 001), title (nome da peca em portugues, pode ser em 2 linhas), cat (colecao e ano)',
  'fashion-drop':         'brand (nome da marca em maiusculas), tag (tipo de oferta, ex: SALE), label (descricao da oferta em maiusculas), line1 (primeira linha do destaque em maiusculas), line2 (segunda linha do destaque em maiusculas com %), cta (chamada)',
  'health-split':        'badge-text (nome da marca ou clinica), headline1 (2-3 palavras linha 1), headline2 (1-2 palavras linha 2), headline3 (1-2 palavras linha 3 em bold), subtitle (frase entre aspas 8-14 palavras), phone-label (servico ou beneficio ex: Entrega Gratuita), phone-number (telefone de contato)',
  'infographic-ring':    'ring-title1 (palavra ou tema em maiusculas), ring-title2 (palavra de destaque em maiusculas), num1 (01 + titulo do item), desc1 (descricao do item 1, 6-10 palavras), num2 (02 + titulo), desc2 (descricao item 2), num3 (03 + titulo), desc3 (descricao item 3), num4 (04 + titulo), desc4 (descricao item 4)',
  'realty-keys':         'headline (frase em italico 5-9 palavras sobre imovel), cta-label (instrucao de contato ex: Entre em contato!), btn-phone (telefone ou whatsapp), handle (perfil da marca ex: @suamarca)',
  'toggle-card':         'hashtag (hashtag da campanha ex: #suamarca), title (titulo de lista ou pergunta 5-9 palavras com numero), handle (perfil da marca ex: @suamarca)',
  'home-split':          'headline (frase emocional 5-9 palavras), desc-label (descricao do produto/servico 8-14 palavras), cta-label (instrucao de contato ex: Solicite o seu orcamento), cta-phone (telefone ou whatsapp), handle (perfil da marca ex: @suamarca)',
  'product-arch':        'headline (titulo em maiusculas 2-4 palavras), sub1 (frase descritiva 8-14 palavras), sub2 (frase complementar 8-14 palavras), btn-text (CTA curto 3-5 palavras)',
  'hero-gradient':       'logo-text (nome da marca em maiusculas), headline (titulo emocional 3-6 palavras), subtitle (frase de apoio 6-10 palavras)',
  'job-glass':            'company (nome da empresa), headline1 (1 palavra de impacto ex: ESTAMOS), headline2 (1 palavra ex: CONTRATANDO), role (cargo da vaga), cta-email (email de contato), deadline (data limite ex: 31 de Dezembro de 2025)',
  'editorial-card':       'label (1-2 palavras em maiusculas), title (4-7 palavras), body (15-25 palavras)',
  'tech-statement':       'phrase (frase em maiusculas max 8 palavras com \\n), brand (nome da marca)',
  'tech-news':            'category (categoria em maiusculas), title (headline 2 linhas em maiusculas com \\n), brand (nome da marca)',
  'tech-product':         'tag (categoria em maiusculas), title (nome do produto em maiusculas), subtitle (descricao 8-15 palavras), cta (chamada curta)',
  'tech-minimal':         'phrase (frase impactante em capitalizacao normal)',
}


function buildPrompt(userInput: string, brand?: BrandContext, forcedTemplate?: string): string {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null
  return `Você é um assistente de design de posts para redes sociais.
Escolha o template mais adequado para a descrição e gere os textos.
${brand?.businessName ? `\nEmpresa: ${brand.businessName}` : ''}
${brand?.segment ? `Segmento: ${brand.segment}` : ''}
${toneLabel ? `Tom de voz: ${toneLabel}` : ''}
${brand?.visualStyle ? `\nEstilo visual de referência: ${brand.visualStyle}` : ''}
${brand?.brandDescription ? `\nDescrição detalhada da marca: ${brand.brandDescription}` : ''}

TEMPLATES DISPONÍVEIS:
  Campos: title (3-6 palavras, impactante), subtitle (8-14 palavras, explicativo)

  Campos: line1 (1-3 palavras), line2 (1-3 palavras)
  Juntas formam uma frase ou contraste. Ex: line1="NOVO", line2="PRODUTO"

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
  Campos: tag (categoria em maiúsculas, ex: "CAMPEONATO PAULISTA", "TREINO DO DIA"), title (título em maiúsculas, EXATAMENTE 2 linhas, use \n para quebrar, cada linha com NO MÁXIMO 2 palavras curtas, ex: "BORA\nJOGAR!", "É DIA\nDE JOGO!", "VAMOS\nVENCER!"), subtitle (detalhe do evento, ex: "Sub-11 · Sábado 15h · Arena Central")

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
- "health-split"    → para clínicas, farmácias, saúde, bem-estar ou qualquer serviço com produto em destaque
- "infographic-ring" → para infográficos, listas de 4 itens, comparativos, dados ou apresentação de benefícios
- "realty-keys"     → para imobiliárias, corretores, aluguel, venda de imóveis ou captação de leads
- "toggle-card"     → para listas numeradas, motivos, razões, dicas ou conteúdo do tipo carrossel de capa
- "home-split"      → para móveis planejados, decoração, arquitetura ou qualquer serviço de ambiente/lar
- "product-arch"    → para posts de produto físico, lançamento ou destaque de item com fundo limpo
- "hero-gradient"   → para posts emocionais, datas comemorativas, homenagens ou celebrações com foto de fundo
- "job-glass"       → obrigatório quando o conteúdo é sobre vaga de emprego, recrutamento ou contratação
- "editorial-card"  → para conteúdo informativo, artigos, dicas ou textos com contexto e corpo
- "food-editorial"  → obrigatório quando o conteúdo mencionar restaurante premium, alta gastronomia, prato especial, menu degustação, chef ou experiência gastronômica sofisticada
- "food-promo"      → obrigatório quando o conteúdo mencionar pratos, restaurante, delivery, cardápio, promoção de comida ou bebida (use food-editorial se o contexto for premium/sofisticado)
- "tech-news"       → quando o prompt mencionar notícia, novidade, lançamento, evento, summit, atualização de tecnologia ou IA
- "sport-arena"        → obrigatório quando o conteúdo mencionar esporte, time, jogo, partida, campeonato, treino, academia, competição ou resultado esportivo
- "business-statement" → obrigatório quando o prompt contiver números, porcentagens, estatísticas, metas, resultados ou conquistas de negócios
- "business-card"      → quando o prompt mencionar apresentação de empresa, serviço, produto, solução ou proposta de valor profissional
- "tech-statement"  → quando o prompt for uma frase, reflexão, provocação ou pensamento sobre negócios, IA ou automação
- "tech-product"    → quando o prompt mencionar produto, serviço, agente, solução, ferramenta de IA ou automação
- "food-vertical"    → faixa vertical escura à esquerda com texto rotacionado + bloco escuro à direita com título, tag e contato. Ideal para restaurantes, promoções food, delivery e lançamentos de produtos
- "bold-circle"      → fundo colorido vibrante com círculo escuro no topo + texto bold dentro do círculo + palavra com highlight box. Ideal para posts de impacto, lançamentos, promoções e conteúdo motivacional
- "editorial-cover"  → foto de fundo com overlays escuros, tipografia grande + palavra em itálico colorido, estilo magazine/editorial. Ideal para posts autorais, reflexões, lifestyle e conteúdo inspiracional
- "split-editorial" → layout split metade escura/metade clara com badge, número decorativo, título bold e corpo. Ideal para listas, dicas, tutoriais e conteúdo educativo
- "geo-impact"      → layout geométrico com círculo grande + título bold + linha de destaque. Ideal para posts de impacto, listas, dicas ou conteúdo inspiracional de qualquer segmento
- "geo-impact"      → layout geométrico com círculo grande + título bold. Use para posts de listas, dicas, hábitos, conquistas ou qualquer conteúdo inspiracional
- "tech-minimal"    → fundo sólido sem imagem, frase única e impactante de até 8 palavras. Use quando o usuário pedir algo minimalista, clean, fundo preto, ou quando a mensagem for uma frase curta e poderosa sem necessidade de imagem de fundo.

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
  Ex: academia → "muscular mixed-race athlete performing deadlift in premium gym, dramatic rim lighting from behind, motion blur on weights, editorial sports photography style, hyperrealistic, award-winning photography, no text, no logos"
  Ex: restaurante → "head chef carefully plating gourmet dish in stainless steel professional kitchen, warm ambient tungsten lighting, close-up macro shot, food editorial photography, hyperrealistic, award-winning photography, no text, no logos"
  Ex: imobiliário → "luxury apartment living room with floor-to-ceiling windows overlooking city at golden hour, architectural interior photography, warm natural backlight, wide angle shot, hyperrealistic, award-winning photography, no text, no logos"

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

// ─── Parse robusto: aceita JSON puro ou embutido em markdown ──────────────────

function extractJSON(raw: string): AIResponse {
  const text = raw.trim()

  // 1. JSON puro
  try { return JSON.parse(text) } catch { /* segue */ }

  // 2. Bloco ```json ... ```
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (block) try { return JSON.parse(block[1]) } catch { /* segue */ }

  // 3. Primeiro objeto JSON encontrado no texto
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) try { return JSON.parse(obj[0]) } catch { /* segue */ }

  throw new Error('A IA retornou uma resposta que não pode ser interpretada')
}

// ─── Carrossel ────────────────────────────────────────────────────────────────

export interface CarouselSlide {
  title: string
  body?: string
  imagePrompt: string
  type: 'cover' | 'content' | 'cta'
  texts?: Record<string, string>
}

export interface CarouselResponse {
  slides: CarouselSlide[]
  caption: string
}

function buildCarouselPrompt(userInput: string, slideCount: number, brand?: BrandContext, templateId?: string): string {
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

export async function generateCarouselContent(userInput: string, slideCount: number, brand?: BrandContext, templateId?: string): Promise<CarouselResponse> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt))
      }
      const url = attempt === 0 ? API_URL : API_URL_FALLBACK
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildCarouselPrompt(userInput, slideCount, brand, templateId) }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.8,
            maxOutputTokens: 1200,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(body?.error?.message ?? `Erro ${res.status} da API Gemini`)
      }
      const data = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('A API retornou uma resposta vazia')
      return extractJSON(text) as unknown as CarouselResponse
    } catch (err) {
      lastError = err as Error
    }
  }
  throw lastError
}

// ─── Chamada principal ────────────────────────────────────────────────────────

export async function generatePostContent(userInput: string, brand?: BrandContext, forcedTemplate?: string): Promise<AIResponse> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt))
      }
      const url = attempt === 0 ? API_URL : API_URL_FALLBACK
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(userInput, brand, forcedTemplate) }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.8,
            maxOutputTokens: 500,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(body?.error?.message ?? `Erro ${res.status} da API Gemini`)
      }
      const data = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('A API retornou uma resposta vazia')
      return extractJSON(text) as unknown as AIResponse
    } catch (err) {
      console.error(`[generatePostContent] attempt ${attempt} erro:`, err)
      lastError = err as Error
    }
  }
  throw lastError
}

export async function analyzeVisualReferences(imageUrls: string[]): Promise<string> {
  const imageParts = await Promise.all(
    imageUrls.slice(0, 5).map(async (url) => {
      const res = await fetch(url)
      const blob = await res.blob()
      // Redimensiona para máximo 800px antes de converter
      const bitmap = await createImageBitmap(blob)
      const maxSize = 800
      const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]
      return {
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64,
        }
      }
    })
  )

  const prompt = `Você é um especialista em design e identidade visual de marcas para redes sociais.

Analise essas ${imageUrls.slice(0, 5).length} imagem(ns) de referência visual e extraia um perfil detalhado e acionável em português.

Responda SOMENTE com JSON válido, sem markdown:
{
  "estilo_geral": "descrição precisa do estilo visual (ex: esportivo e dinâmico com muito contraste, minimalista corporativo com espaço negativo, colorido e festivo com elementos gráficos)",
  "cores_predominantes": ["cor hex ou nome 1", "cor hex ou nome 2", "cor hex ou nome 3"],
  "proporcao_texto_imagem": "descrição de quanto espaço o texto ocupa vs imagem (ex: texto domina 40% do layout, imagem de fundo com overlay, texto pequeno no rodapé)",
  "estilo_tipografia": "como os textos aparecem (ex: títulos em caixa alta bold, textos curtos e impactantes, mix de tamanhos grandes e pequenos, serifado elegante)",
  "tipo_imagem": "que tipo de foto ou visual é usado (ex: atletas em ação com motion blur, produtos em fundo branco, pessoas celebrando, abstratos geométricos, paisagens urbanas)",
  "composicao": "como os elementos são organizados (ex: título no topo esquerdo com imagem ocupando 70% direito, texto centralizado sobre gradiente escuro, grade de 3 colunas)",
  "elementos_recorrentes": "elementos visuais que aparecem com frequência (ex: barra colorida lateral, moldura dourada, logo sempre no canto inferior direito, ícones esportivos)",
  "tom_visual": "sensação emocional transmitida (ex: energia e adrenalina, sofisticação e exclusividade, acolhimento e comunidade, urgência e escassez)",
  "tamanho_textos": "os títulos são curtos ou longos (ex: títulos de 1-3 palavras em destaque, frases completas de 8-12 palavras, combinação de headline curto com subtítulo longo)",
  "instrucoes_geracao": "instrução direta e específica de 3-4 linhas para a IA usar ao gerar novos posts neste estilo. Inclua dicas sobre imagePrompt, escolha de template e tom do texto"
}`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              ...imageParts,
              { text: prompt }
            ]
          }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 1000,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return text
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  return '{}'
}

export async function turboPromptEditor(userPrompt: string, brand?: BrandContext): Promise<string> {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null

  const systemContext = [
    brand?.businessName ? `Empresa: ${brand.businessName}` : '',
    brand?.segment ? `Segmento: ${brand.segment}` : '',
    toneLabel ? `Tom de voz: ${toneLabel}` : '',
    brand?.brandDescription ? `Descrição da marca: ${brand.brandDescription}` : '',
    brand?.visualStyle ? `Estilo visual: ${brand.visualStyle}` : '',
  ].filter(Boolean).join('\n')

  const prompt = `Você é um especialista em marketing de conteúdo e copywriting para redes sociais.

Contexto da marca:
${systemContext}

O usuário quer criar um post com esse tema:
"${userPrompt}"

Reescreva como um briefing rico e específico para geração de post. O briefing deve:
- Manter a intenção original do usuário
- Incluir o ângulo mais impactante do tema para o segmento da marca
- Especificar o tom emocional e o gatilho mental (urgência, curiosidade, prova social, autoridade)
- Sugerir um dado, número ou frase de impacto se aplicável
- Indicar o objetivo do post (engajar, informar, converter, inspirar)
- Máximo de 3 linhas, direto e específico
- Em português do Brasil

Responda APENAS com o briefing turbinado, sem explicações, sem aspas, sem markdown.`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return text.trim()
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  return userPrompt
}

export async function turboPrompt(userPrompt: string, brand?: BrandContext): Promise<string> {
  const toneLabel = brand?.tone === 'professional' ? 'profissional e formal'
    : brand?.tone === 'casual' ? 'descontraído e próximo'
    : brand?.tone === 'inspirational' ? 'inspiracional e motivador'
    : brand?.tone === 'technical' ? 'técnico e especialista'
    : null

  const systemContext = [
    brand?.businessName ? `Empresa: ${brand.businessName}` : '',
    brand?.segment ? `Segmento: ${brand.segment}` : '',
    toneLabel ? `Tom de voz: ${toneLabel}` : '',
    brand?.brandDescription ? `Descrição da marca: ${brand.brandDescription}` : '',
    brand?.visualStyle ? `Estilo visual: ${brand.visualStyle}` : '',
  ].filter(Boolean).join('\n')

  const prompt = `Você é um diretor de arte e especialista em prompt engineering para geração de imagens com IA.

Contexto da marca:
${systemContext}

O usuário quer criar um post para redes sociais com esse tema:
"${userPrompt}"

Reescreva como um prompt rico e preciso para geração de imagem com IA. O prompt deve incluir:
- O tema e mensagem principal do post
- Estilo visual e mood compatível com a marca (tom, segmento, personalidade)
- Direção de composição: onde fica o sujeito, onde fica o texto, hierarquia visual
- Iluminação e paleta de cores
- Referência de qualidade (ex: campanha publicitária premium, editorial de revista)
- Máximo de 4 linhas, direto e específico
- Em português do Brasil

Responda APENAS com o prompt turbinado, sem explicações, sem aspas, sem markdown.`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return text.trim()
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  return userPrompt
}

export interface PostReview {
  score_visual: number
  score_legenda: number
  pontos_positivos: string[]
  sugestoes: string[]
  resumo: string
}

export async function reviewPost(params: {
  imageBase64: string
  titulo: string
  legenda: string
  hashtags: string
  segmento?: string
  tone?: string
}): Promise<PostReview> {
  const { imageBase64, titulo, legenda, hashtags, segmento, tone } = params

  const prompt = `Você é um especialista em marketing digital e redes sociais para pequenas empresas.

Analise este post para Instagram e dê um feedback simples e encorajador.

Informações do post:
- Título/texto principal: "${titulo}"
- Legenda: "${legenda}"
- Hashtags: "${hashtags}"
${segmento ? `- Segmento da empresa: ${segmento}` : ''}
${tone ? `- Tom de voz: ${tone}` : ''}

Analise a imagem e os textos e retorne um JSON com:
{
  "score_visual": número de 0 a 10 baseado em: contraste texto/fundo, presença e tamanho do logo, qualidade da imagem, hierarquia visual,
  "score_legenda": número de 0 a 10 baseado em: clareza da mensagem, presença de CTA, adequação ao segmento, engajamento potencial,
  "pontos_positivos": ["ponto positivo 1 em linguagem simples", "ponto positivo 2"],
  "sugestoes": ["sugestão prática 1 em linguagem simples, máximo 15 palavras", "sugestão prática 2", "sugestão prática 3"],
  "resumo": "frase encorajadora de 1 linha resumindo a avaliação"
}

Use linguagem simples e encorajadora. O usuário é leigo em design e marketing.
Responda SOMENTE com JSON válido, sem markdown.`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: imageBase64.replace(/^data:image\/\w+;base64,/, '') } },
              { text: prompt }
            ]
          }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.4,
            maxOutputTokens: 600,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Resposta vazia')
      return JSON.parse(text) as PostReview
    } catch (err) {
      if (attempt === 2) throw err
    }
  }
  throw new Error('Falha na análise')
}

export async function generatePremiumCaption(prompt: string, brand?: BrandContext): Promise<{ instagram: string; linkedin: string; hashtags: string }> {
  const brandCtx = brand ? `
Marca: ${brand.businessName || ''}
Segmento: ${brand.segment || ''}
Tom: ${brand.tone || ''}
Descricao: ${brand.brandDescription || ''}` : ''

  const text = `Você é um especialista em marketing digital brasileiro. Crie legendas para um post gerado com IA.

Contexto do post: ${prompt}
${brandCtx}

Retorne APENAS JSON válido sem markdown:
{
  "instagram": "legenda curta e impactante para Instagram, máximo 80 palavras, tom humano e direto, sem hashtags",
  "linkedin": "legenda profissional para LinkedIn entre 150 e 250 palavras, começa com dado ou observação relevante, termina com pergunta para engajamento, sem hashtags",
  "hashtags": "6 a 8 hashtags relevantes separadas por espaço em português e inglês"
}`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const url = attempt < 2
? API_URL
        : API_URL_FALLBACK
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: { temperature: 0.7 },
        }),
      })
      const data = await res.json()
      console.log('[caption] raw response:', JSON.stringify(data).slice(0, 200))
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return {
        instagram: parsed.instagram ?? '',
        linkedin: parsed.linkedin ?? '',
        hashtags: parsed.hashtags ?? '',
      }
    } catch {
      if (attempt === 2) return { instagram: '', linkedin: '', hashtags: '' }
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return { instagram: '', linkedin: '', hashtags: '' }
}

export async function breakCarouselIntoSlides(prompt: string, slideCount: number, brand?: BrandContext): Promise<string[]> {
  const brandCtx = brand ? `Marca: ${brand.businessName || ''}, Segmento: ${brand.segment || ''}, Tom: ${brand.tone || ''}` : ''

  const middleSlides = slideCount - 2
  const middleStructure = Array.from({length: middleSlides}, (_, i) =>
    `- Slide ${i + 2}: desenvolvimento ${i + 1} de ${middleSlides} — aborda um aspecto ÚNICO e DIFERENTE dos outros slides, com conteúdo específico e concreto sobre o tema`
  ).join('\n')

  const text = `Você é um especialista em copywriting para redes sociais.

Tema do carrossel: "${prompt}"
${brandCtx}
Número de slides: ${slideCount}

Crie EXATAMENTE ${slideCount} headlines ultra-curtos para um carrossel Instagram. Cada headline será renderizado como texto principal em uma imagem gerada por IA — por isso deve ter NO MÁXIMO 4 PALAVRAS.

Estrutura OBRIGATÓRIA:
- Slide 1 (GANCHO): headline de impacto, máximo 4 palavras, que para o scroll
${middleStructure}
- Slide ${slideCount} (CTA): ação direta, máximo 3 palavras, ex: "Fale Conosco", "Comece Agora", "Saiba Mais"

REGRAS CRÍTICAS:
- Máximo 4 palavras por headline — sem exceção
- Cada headline completamente diferente dos outros — sem repetir palavras
- Sem prefixos: não escreva "CTA:", "Gancho:", "Slide X:"
- Seja direto e impactante
- Em português do Brasil

Retorne APENAS um array JSON com ${slideCount} strings curtas. Sem markdown, sem explicações.
Exemplo para 3 slides: ["IA já chegou aqui?", "3x mais rápido", "Fale conosco"]`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      })
      const data = await res.json()
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      if (Array.isArray(parsed) && parsed.length === slideCount) return parsed
    } catch {
      if (attempt === 2) {
        // Fallback: retorna slides genéricos
        return Array.from({length: slideCount}, (_, i) =>
          i === 0 ? `Gancho: ${prompt}` :
          i === slideCount - 1 ? `CTA: Entre em contato` :
          `Ponto ${i}: ${prompt}`
        )
      }
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return Array.from({length: slideCount}, (_, i) => `Slide ${i + 1}: ${prompt}`)
}

export interface AgentMessage {
  role: 'user' | 'agent'
  content: string
}

export interface AgentResponse {
  ready: boolean
  message?: string
  prompt?: string
  format?: string
  mode?: 'post' | 'carousel'
  slideCount?: number
  templateId?: string
}

export async function agentChat(
  messages: AgentMessage[],
  brand?: BrandContext,
  lockedTemplateId?: string
): Promise<AgentResponse> {
  try {
    const res = await fetch('/api/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, brand, lockedTemplateId }),
    })
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return await res.json() as AgentResponse
  } catch (err) {
    console.error('[agentChat] erro:', err)
    return { ready: false, message: 'Estou com instabilidade no momento. Tente enviar sua mensagem novamente em alguns segundos.' }
  }
}
