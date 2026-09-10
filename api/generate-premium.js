export const config = { maxDuration: 60 }

function styleForSegment(text) {
  const t = (text || '').toLowerCase()
  if (/food|restaurant|gastronom|comida|culin[aá]ria|card[aá]pio|delivery|chef|bebida/.test(t)) {
    return 'warm cinematic lighting, shallow depth of field, editorial food photography'
  }
  if (/health|sa[uú]de|cl[ií]nic|medic|farm[aá]c|hospital|dentist|odont|paciente/.test(t)) {
    return 'clean clinical aesthetic, soft natural light, professional healthcare photography'
  }
  if (/tech|\bia\b|intelig[eê]ncia artificial|software|startup|\bai\b|saas|agente/.test(t)) {
    return 'dark background, blue/purple neon accents, cinematic corporate photography'
  }
  if (/im[óo]v|constru|realty|real estate|arquitet|imobili[aá]ri/.test(t)) {
    return 'architectural photography, golden hour lighting, aspirational lifestyle'
  }
  if (/moda|fashion|beleza|beauty|cosm[eé]tic|est[eé]tica/.test(t)) {
    return 'high fashion editorial, studio lighting, luxury brand aesthetic'
  }
  return 'cinematic photography, professional lighting, editorial style'
}

function illustrationStyleForSegment(text) {
  const t = (text || '').toLowerCase()
  if (/food|restaurant|gastronom|comida|culin[aá]ria|card[aá]pio|delivery|chef|bebida/.test(t)) {
    return 'warm flat illustration, appetizing color palette, simple food iconography'
  }
  if (/health|sa[uú]de|cl[ií]nic|medic|farm[aá]c|hospital|dentist|odont|paciente/.test(t)) {
    return 'clean clinical flat illustration, calming pastel palette, simple medical iconography'
  }
  if (/tech|\bia\b|intelig[eê]ncia artificial|software|startup|\bai\b|saas|agente/.test(t)) {
    return 'modern tech flat illustration, dark background with blue/purple accent shapes, geometric iconography'
  }
  if (/im[óo]v|constru|realty|real estate|arquitet|imobili[aá]ri/.test(t)) {
    return 'architectural flat illustration, warm golden-hour palette, simplified building shapes'
  }
  if (/moda|fashion|beleza|beauty|cosm[eé]tic|est[eé]tica/.test(t)) {
    return 'elegant fashion flat illustration, refined color palette, minimal luxury iconography'
  }
  return 'professional flat illustration, clean editorial color palette'
}

// Regras específicas por estilo visual — sujeito, padrão de qualidade e negative
// prompt mudam bastante entre foto realista, ilustração vetorial e composição
// tipográfica pura, então cada um tem seu próprio bloco em vez de forçar as
// mesmas instruções fotográficas em todos os casos.
// Nota (09/09/2026): reversão parcial da decisão de 05/09. O gpt-image-2 volta a
// renderizar texto literal quando há `slideTitle`, mas sob regras MAIS rígidas que
// o original (headline de 1 linha ≤ ~25 chars, sem subtítulo salvo pedido
// explícito). `textOverlay.ts`/`premiumCompose.ts` continuam no código como
// ferramenta de overlay manual pós-geração, não mais no caminho padrão.
// Nota (safe-zone, 09/09/2026): a margem única ~6%/8% foi trocada por margens
// medidas de layouts de referência reais, POR proporção (1:1 10/9/9 · 4:5 10/8/13
// · 9:16 15/9/9, lateral/topo/base em %). Ver buildTextTypographyRules().
const SUBJECT_RULE_BY_STYLE = {
  photo: (slideTitle) => `- If the brief describes a real person, food dish, physical product, animal, or real location: that subject MUST be rendered as the PHOTOREALISTIC main visual element. The person or subject is the hero of the image. Render them realistically, prominently, clearly.${slideTitle ? ' Typography is essential — see CAROUSEL SLIDE TEXT OVERLAY section below.' : ' Typography is secondary — one minimal text overlay at most.'}
- If the brief is purely informational or typographic (no specific visual subject described): create a strong typographic composition with large, bold text as the focal point.`,
  illustration: (slideTitle) => `- Render the subject described in the VISUAL BRIEF as a professional vector illustration / flat design graphic — NOT a photograph. Use clean geometric shapes, bold flat colors, confident line work, and simple gradients if any. Style reference: modern SaaS/editorial flat illustration systems (e.g. Stripe, Notion, premium design agency work).
- No photographic textures, no photorealistic skin/materials, no 3D render, no photo-collage. Keep a single consistent illustration style throughout the image.${slideTitle ? ' Typography is essential — see CAROUSEL SLIDE TEXT OVERLAY section below.' : ' Typography is secondary — one minimal text overlay at most.'}`,
  typography: () => `- Do NOT render any photographic or illustrated subject. This is a purely typographic composition — large, bold text IS the entire visual. No people, no products, no photographic background, no complex illustration.
- Background must be a simple solid color, subtle gradient, or minimal geometric shape/pattern that supports the text without competing with it. Typography is always the primary and essential element, regardless of slide title presence.`,
}

const QUALITY_STANDARD_BY_STYLE = {
  photo: 'Photorealistic and polished — indistinguishable from a premium photo shoot or agency design.',
  illustration: "Polished professional vector illustration — indistinguishable from a premium design agency's custom illustration system.",
  typography: 'Polished minimalist typographic design — indistinguishable from a premium editorial or brand campaign title card.',
}

const AVOID_BY_STYLE = {
  photo: 'generic AI aesthetics, plastic skin, symmetrical faces, oversaturated colors, fake HDR, dramatic god rays, floating particles, lens flares, glowing edges, perfect smiles, perfect hands, perfect offices, exaggerated reflections, random futuristic elements, visual clutter, stock photo feeling, cheap advertising aesthetic, CGI appearance, overly polished rendering, neon colors, excessive gradients',
  illustration: 'photographic realism, photo textures, 3D render, CGI, stock photo look, blurry raster edges, inconsistent illustration styles mixed in one image, generic meaningless AI illustration clichés (random floating blobs/shapes), muddy colors, low-contrast flat shapes, visual clutter',
  typography: 'photographic elements, realistic people or objects, complex illustrations, busy or noisy backgrounds, stock photo textures, 3D render, gradients or shapes that compete with the text, visual clutter',
}

// Clichês visuais NOMEADOS por segmento — mais eficazes que termos genéricos
// ("evite cores neon") porque atacam o exato default que o GPT Image cai quando
// não é instruído explicitamente a fugir dele para aquele nicho específico.
function namedClichesForSegment(text) {
  const t = (text || '').toLowerCase()
  if (/food|restaurant|gastronom|comida|culin[aá]ria|card[aá]pio|delivery|chef|bebida/.test(t)) {
    return 'a dish shot centered at a 45-degree angle on a plain white studio background, with artificial steam rising in an identical straight line and cutlery aligned like a stock catalog still'
  }
  if (/health|sa[uú]de|cl[ií]nic|medic|farm[aá]c|hospital|dentist|odont|paciente/.test(t)) {
    return "a doctor in a spotless white coat smiling with arms crossed staring directly at the camera, a stethoscope hung purely as a prop, and a blurred generic clinical-blue background"
  }
  if (/tech|\bia\b|intelig[eê]ncia artificial|software|startup|\bai\b|saas|agente/.test(t)) {
    return 'a glowing blue brain made of neural network nodes connected by light trails, or a white robotic hand touching a floating hologram — the two most recycled stock-image clichés for "AI"'
  }
  if (/im[óo]v|constru|realty|real estate|arquitet|imobili[aá]ri/.test(t)) {
    return 'a generic couple holding hands in front of a house silhouette against an identical orange golden-hour sky, or a shiny gold key being handed over in a stock-photo-of-a-stock-photo pose'
  }
  if (/moda|fashion|beleza|beauty|cosm[eé]tic|est[eé]tica/.test(t)) {
    return 'a diffuse pink-to-lilac glow gradient behind the product or face — the single most recycled cliché in AI-generated beauty/aesthetics content — combined with unrealistic plastic, doll-like skin glow'
  }
  return 'a generic handshake between people in suits inside a glass corporate office under cold blue stock-photo lighting, or a floating holographic upward growth chart'
}

// "Design Read" — nomeia deliberadamente o contexto (segmento, estilo, base) antes
// de gerar, em vez de deixar o modelo cair no default genérico do nicho em
// silêncio. Também logado no servidor para dar visibilidade do que foi "lido" em
// cada geração ao debugar resultados fora do esperado.
function buildDesignRead(segment, resolvedVisualStyle, hasReferencePhoto) {
  const segmentLabel = (segment || '').trim() || 'unspecified segment'
  const styleName = resolvedVisualStyle === 'illustration'
    ? 'vector illustration'
    : resolvedVisualStyle === 'typography'
    ? 'typographic composition'
    : 'photography'
  const basis = hasReferencePhoto
    ? 'preserving the provided reference photo as the exact visual base'
    : 'generating a fresh scene from the brief'
  return `Reading this as: a social post for the "${segmentLabel}" segment, ${styleName}, ${basis}. Deliberately avoid this segment's generic AI default — see the named clichés banned below.`
}

// BURACO 4: o modelo só gera em 1024x1024 / 1024x1536 / 1536x1024, mas o post final
// pode ser 4:5 ou 9:16 — o cliente faz um center-crop pós-geração (cropImageToRatio).
// Esse crop remove ~8% de duas bordas e pode comer a margem de safe-zone que o modelo
// respeitou no frame que ele viu. Aqui calculamos quanto será cortado e avisamos o
// modelo pra compor com essa folga extra. `size` = frame gerado; `outputRatio` (ex:
// "4/5") = proporção final. Vazio quando as proporções batem (1:1) ou faltam dados.
function cropInsetNote(size, outputRatio) {
  if (!size || !outputRatio) return ''
  const [w, h] = String(size).split('x').map(Number)
  const [rw, rh] = String(outputRatio).split('/').map(Number)
  if (!w || !h || !rw || !rh) return ''
  const genRatio = w / h
  const targetRatio = rw / rh
  if (Math.abs(genRatio - targetRatio) < 0.01) return ''
  let pct, edges, verbose
  if (genRatio > targetRatio) {
    const keptW = h * targetRatio
    pct = Math.round(((w - keptW) / 2 / w) * 100)
    edges = 'the left and right edges'
    verbose = 'left and right'
  } else {
    const keptH = w / targetRatio
    pct = Math.round(((h - keptH) / 2 / h) * 100)
    edges = 'the top and bottom edges'
    verbose = 'top and bottom'
  }
  if (pct < 1) return ''
  return `

IMPORTANT — POST-CROP: after you generate it, this image is centre-cropped to a ${rw}:${rh} aspect ratio for publishing, which permanently removes the outer ${pct}% of ${edges}. Compose as if those ${pct}% strips are already gone: keep ALL text — and the entire safe-zone margin — at least ${pct}% further inside on the ${verbose} than the safe-zone rule alone would require. Nothing important (no text, no faces, no key subject detail) may sit in those outer ${pct}% strips on the ${verbose}.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, slideIndex, totalSlides, styleContext, segment, size, visualReferences, slideTitle, slideBody, visualStyle, editMode, addingText, outputRatio } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const resolvedVisualStyle = visualStyle === 'illustration' || visualStyle === 'typography' ? visualStyle : 'photo'
  const hasReferencePhoto = !!visualReferences?.length
  // BURACO 4: aviso sobre o center-crop client-side pós-geração (vazio se não houver
  // mismatch de proporção). Entra em todos os prompts que renderizam/movem texto.
  const cropNote = cropInsetNote(size, outputRatio)

  // Ajuste pós-geração: a imagem já renderizada (com texto embutido) é a base e o
  // pedido é uma alteração pontual ("escurece o fundo"). O prompt normal de
  // referência injeta safe-zone, letterboxing e regras de overlay de texto —
  // feitas pra gerar cena nova / cravar texto — que aqui fazem o modelo
  // reposicionar ou reescrever o texto já existente. Nesse modo trocamos por uma
  // diretiva curta de preservação e pulamos todas essas seções.
  const isAdjust = editMode === 'adjust' && hasReferencePhoto

  // Recomposição parcial: o usuário quer manter a pessoa da imagem base mas trocar
  // o ambiente/cenário ao redor. Diferente do 'adjust' (preservação total), aqui a
  // instrução é para RECRIAR o entorno preservando só a identidade da pessoa e o
  // texto já embutido. Também pula safe-zone / overlay de texto / letterboxing
  // pelo mesmo motivo do 'adjust'.
  const isRecompose = editMode === 'recompose' && hasReferencePhoto

  const designRead = buildDesignRead(segment || styleContext, resolvedVisualStyle, hasReferencePhoto)
  console.log('[premium] design read:', designRead)
  if (isAdjust) console.log('[premium] adjust mode — pedido:', String(prompt).slice(0, 120))
  if (isRecompose) console.log('[premium] recompose mode — pedido:', String(prompt).slice(0, 120))

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
  }

  // Regras de tipografia/safe-zone compartilhadas por qualquer caminho que renderize
  // texto de verdade na imagem — geração normal (via carouselTextOverlay abaixo) e o
  // modo de ajuste quando o pedido é ADICIONAR texto novo (ver adjustPrompt). Fonte
  // única de propósito: um bug real já aconteceu por essas regras divergirem entre
  // duas cópias.
  //
  // Reversão parcial (09/09/2026) da decisão "texto sempre via overlay de canvas"
  // (4dcf72f). O modelo volta a renderizar texto, mas com dois tetos MAIS rígidos
  // que o original: (1) safe-zone por proporção, medida de layouts de referência
  // reais (1:1 10/9/9 · 4:5 10/8/13 · 9:16 15/9/9 — lateral/topo/base em %), bem
  // acima do ~3%/4.5% original; (2) headline de UMA linha, ~25 caracteres no
  // máximo (teto validado em scripts/test-model-text.mjs, 0 vazamentos visíveis
  // nos 12 casos), sem subtítulo salvo quando `slideBody` é explicitamente passado.
  // Regra adicional: texto nunca sobre o rosto de uma pessoa (ver abaixo).
  function buildTextTypographyRules() {
    return `- Typography must be elegant and modern, matching the brand style
- Text in Portuguese (Brazil) as provided — do NOT translate or change it
- Typography consistency is critical: use only a single clean sans-serif typeface (like Helvetica, Arial or similar) throughout the entire image. Bold weight for the headline, regular weight for the subtitle when one is explicitly provided. No decorative fonts, no mixed typefaces, no serif fonts.
- CRITICAL TEXT LIMIT: render the headline on ONE single line only — never wrap it to a second line. Keep it short, about 25 characters or fewer. Do NOT render a subtitle or any supporting line unless one is explicitly provided below. NO bullet points, NO icons with labels, NO lists, NO multiple sections of text, NO decorative badges, shapes, ribbons or underlines around the text. One powerful line only. White space is design.
- CRITICAL SAFE ZONE (Instagram compliance) — these margins were measured from real reference layouts and differ by aspect ratio. Keep ALL text and logo elements inside the following margins, expressed as a percentage of the canvas width (left/right) and height (top/bottom):
  * 1:1 square (e.g. 1080x1080): at least 10% left, 10% right, 9% top, 9% bottom
  * 4:5 portrait feed (e.g. 1080x1350): at least 10% left, 10% right, 8% top, 13% bottom
  * 9:16 stories/reels (e.g. 1080x1920): at least 15% left, 15% right, 9% top, 9% bottom
  * 16:9 or any other ratio: at least 12% on every edge
  These are MINIMUMS, not targets — err well inside the safe zone and leave visibly generous empty margin between the text and every edge; never let text sit up against the safe-zone boundary. NEVER place text or logo outside this safe zone. This is mandatory for correct display in the Instagram feed and profile grid without cropping — text must NEVER be cropped, cut off, or touch any edge.
- CRITICAL — TEXT NEVER OVER A FACE: when the image contains one or more people, the rendered text must NOT overlap, touch, or cross any person's face or head. Position the headline in clear space (background, sky, wall, floor, or an empty area of the frame) with obvious separation from every face. If the text would only fit across a face, make the subject smaller or shift the composition so there is empty room for it — a smaller subject with unobstructed text is correct; text crossing a face is a critical failure.
- CRITICAL FONT SIZE: The headline must be large enough to be read clearly on a mobile phone screen at normal viewing distance — bold, occupying significant visual weight. Never use small, thin, or delicate typography for the headline. If a subtitle is explicitly provided, it must be between 55% and 70% of the headline size for clear hierarchy.
- CRITICAL SPELLING ACCURACY: reproduce the text EXACTLY character by character as provided, including all accents (á, é, í, ó, ú, â, ê, ô, ã, õ, ç) and diacritics. Double-check Portuguese special characters before finalizing — common errors include confusing ã with ãi, é with ê, ó with õ. The text must be spelled perfectly matching the input, letter by letter.`
  }

  // Presente quando há um título/headline específico a renderizar — slides de
  // carrossel premium e (desde a correção do bug de "post sem texto") posts únicos
  // cujo brief contém texto literal a ser exibido (ver PremiumPage.tsx / AgentChat,
  // extração de texto entre aspas no prompt do usuário).
  const carouselTextOverlay = slideTitle ? `

MANDATORY TEXT TO RENDER — OVERRIDE:
${totalSlides > 1 ? `This image is slide ${slideIndex} of ${totalSlides} in an Instagram carousel. ` : ''}This requirement takes priority over any conflicting typography guidance above.
${slideBody
  ? `Render ONLY this exact text visible in the image: "${slideTitle}" as a single-line headline, and "${slideBody}" as one short supporting subtitle line directly under it. Nothing else. No bullet points, no icons with labels, no lists, no additional text sections, no decorative shapes around the text.`
  : `Render ONLY this exact text visible in the image: "${slideTitle}" as a single-line headline. Nothing else — no subtitle, no supporting line, no bullet points, no icons with labels, no lists, no multiple text sections, no decorative shapes around the text.`}
The headline MUST fit on ONE line (about 25 characters or fewer) — never wrap it.
Text placement rules:
- Position the text block in the lower-center or center zone of the image, kept well inside the safe zone with generous empty margin to every edge
- Ensure high contrast: white text on dark areas, or dark text on light areas, or use a semi-transparent background strip
${buildTextTypographyRules()}` : ''

  const visualStyleDirective = hasReferencePhoto
    ? "Match the lighting, color grading, and photographic style already present in the reference photo. Do NOT impose a new visual style, mood, or photographic treatment — the reference photo's existing look is the target, not a starting point to redesign."
    : resolvedVisualStyle === 'illustration'
    ? illustrationStyleForSegment(segment || styleContext)
    : resolvedVisualStyle === 'typography'
    ? 'minimalist typographic design, generous negative space, no photographic or illustrated elements'
    : styleForSegment(segment || styleContext)

  // Seção dedicada (não só um bullet perdido em MANDATORY RULES) para dar o máximo
  // de peso possível à preservação de identidade — GPT Image 2 tende a distorcer
  // rostos, duplicar pessoas com o mesmo rosto e criar desproporções quando há
  // foto de referência com pessoas.
  const photoIdentitySection = hasReferencePhoto ? `

CRITICAL FACE AND IDENTITY PRESERVATION:
When a reference photo is provided, you MUST preserve the exact facial features, proportions, and identity of every person shown. Do NOT alter, distort, duplicate, or generate variations of any face. Do NOT create multiple people with similar or identical faces unless the reference photo already shows multiple distinct people — in that case, preserve each person's individual distinct features exactly. Do NOT change body proportions, facial structure, or any physical characteristic. The person(s) in the output must be immediately recognizable as the exact same person(s) from the reference photo. Any deviation from the reference photo's human features is a critical failure.
When the reference photo shows MULTIPLE people, you MUST preserve EACH individual person's exact facial features and identity — not just the most prominent one. Every single face in the group must remain recognizable and unaltered, regardless of how many people are present or their position in the frame.` : ''

  // Com foto de referência o endpoint roda `images/edits`. Esse modelo NÃO obedece
  // "encolha a foto + letterboxe pra abrir espaço" (op incomum, ele resiste) — mas
  // OBEDECE "recomponha o enquadramento / feche o crop / desloque o sujeito". Então
  // a defesa da safe zone aqui é REENQUADRAR a foto (buraco 2), não letterbox
  // (buraco 1, removido). Trade-off aceito pelo produto: a foto pode voltar com
  // crop mais fechado / sujeito deslocado; o que é preservado é o CONTEÚDO
  // (pessoas, produto, local, luz, cor, identidade), não o enquadramento original.
  const referenceBaseDirective = hasReferencePhoto ? `

CRITICAL — THE REFERENCE PHOTO IS THE SOURCE OF THE SUBJECT AND THE LOOK (read first, overrides any instruction below that implies inventing a new scene):
The provided image defines WHAT is in the picture and HOW it looks. You MUST preserve exactly, with no deviation:
- every person's identity, face, features, proportions, hair, skin tone, expression, age and clothing (see the identity rule below)
- the specific subject / product / animal / location shown — never substitute it for a different one
- the lighting direction and quality, the colour grading, and the overall photographic treatment
You MAY and SHOULD recompose the FRAMING so the layout works: crop into the photo, zoom, move the subject off-centre, tighten or widen the shot, shift the horizon — whatever it takes to leave a clean, uncluttered area for the headline inside the text safe zone. Reframing this exact shot is expected and allowed; changing who or what is in it, their appearance, the setting, or the light is a critical failure.
Do NOT add letterboxing, padding, or solid bars around the whole photo to "make room" — recompose the shot itself so the room is already there. Treat this like a director reframing existing footage for a title card, not like generating a new scene from text.` : ''

  const briefLabel = hasReferencePhoto
    ? 'EDIT INSTRUCTIONS (what to add or adjust on top of the reference photo — this is NOT a new scene to generate)'
    : 'VISUAL BRIEF'

  const visualSubjectSection = hasReferencePhoto
    ? '- The reference photo defines the subject and the look (see the CRITICAL directive above). Do NOT invent, substitute, or redraw a different subject, person, or scene. You MAY recompose the framing of that same subject — crop in, zoom, move it off-centre — to open a clean area for the text.'
    : SUBJECT_RULE_BY_STYLE[resolvedVisualStyle](slideTitle)

  const compositionRules = hasReferencePhoto ? `
- Preserve the reference photo's subject, setting, lighting and colour treatment exactly; you MAY recompose its framing (crop in, zoom, shift the subject) to make room for the text — see the CRITICAL directive above
- CRITICAL: recompose so the subject and every important visual element sit within the CENTER 60% of image width and CENTER 70% of image height. The outer margins stay clean — background, out-of-focus area, or plain surface only — no subject, no important detail near the edges
- CRITICAL: put the headline in the lower third (or the upper third), fully inside the text safe zone, over a clean area — background, wall, sky, floor, or an out-of-focus region. NEVER over a person's face or head, NEVER over busy photographic detail
- FALLBACK — only when the subject genuinely fills the whole frame and cannot be reframed to free a clean text area: lay a solid or near-solid colour band (the photo's dominant tone, or the brand colour) across the third where the text goes, kept fully inside the safe zone, and place the headline on that band. Always prefer reframing the shot over adding the band.
- The headline must NEVER be cut off, cropped, or cross the safe-zone margins — guaranteeing that is more important than keeping the photo at its original framing` : `
- Clean layout with generous negative space — no clutter
- Dark or neutral background — no loud gradients
- CRITICAL: Place all key elements in the CENTER 60% of image width and CENTER 70% of image height only
- CRITICAL: Outer edges must be empty or background only — no text or subjects near edges
- CRITICAL COMPOSITION: One dominant subject. Generous white space. Text placed in lower third or upper third, never center. The image must breathe.`

  const fullPrompt = `Make an image that nobody would suspect was generated by AI.
${referenceBaseDirective}

You are a professional social media art director generating a high-quality image.

DESIGN READ: ${designRead}

BRAND VISUAL STYLE (follow strictly):
${styleContext || 'clean, minimal, professional'}

VISUAL STYLE DIRECTION: ${visualStyleDirective}

${briefLabel}:
${prompt}

VISUAL SUBJECT RULE (most important rule — read carefully):
${visualSubjectSection}
${photoIdentitySection}

MANDATORY RULES:
${compositionRules}
- NO: neon glows, particle effects, lens flares, holographic elements, robotic hands, AI chip imagery unless explicitly requested
- NO: generic AI stock imagery (blue brain, neural networks, glowing circuits)
- If the brand has a defined visual style, replicate it: colors, typography weight, spacing, mood
- CRITICAL: Do NOT include any logo or brand mark — the logo will be overlaid separately
- Any text rendered in the image MUST follow every typography rule below without exception (these apply even if you would otherwise add only incidental text):
${buildTextTypographyRules()}${cropNote}
${carouselTextOverlay}
QUALITY STANDARD: ${hasReferencePhoto ? 'Polished and professional — reads as one real photograph of the exact same subject, setting and lighting as the reference, recomposed for the layout, with a clean high-end headline sitting well inside the safe zone.' : QUALITY_STANDARD_BY_STYLE[resolvedVisualStyle]}

Avoid: ${hasReferencePhoto
    ? "substituting the subject or scene for a different one, changing any person's identity or appearance, replacing the setting, restyling the lighting or colour treatment, letterboxing or padding the photo, text outside the safe zone, text over a face or over busy detail, generic AI aesthetics, plastic skin, oversaturated colours, fake HDR"
    : `${AVOID_BY_STYLE[resolvedVisualStyle]}. Specifically, do NOT default to this segment's most recycled visual cliché: ${namedClichesForSegment(segment || styleContext)}`}.`

  // Prompt para ajuste pós-geração: a imagem recebida já está pronta (com texto
  // embutido) e o objetivo é aplicar a mudança pedida sem reinterpretar
  // composição, texto, cores ou sujeito.
  // Os DOIS ramos (addingText e ajuste normal) incluem buildTextTypographyRules()
  // + "não reenquadrar / não ampliar / não cortar a FOTO". Motivo (09/09/2026,
  // teste real): um pedido de ajuste geral ("destacar mais o texto") deixou o texto
  // quase vazando a safe-zone E a foto levemente ampliada.
  // BURACO 3 (10/09/2026): o "preserve tudo exatamente" brigava com "traga o texto
  // pra dentro da safe zone" quando o texto já nascia fora (comum no caminho com
  // foto). Resolvido com prioridade explícita — SE o texto já está fora da safe
  // zone/sobre rosto, corrigir POSIÇÃO e TAMANHO **do texto** vence a preservação;
  // isso é uma edição só-do-texto e NÃO autoriza reenquadrar/cortar/letterboxar a
  // foto (coisas diferentes). Texto já dentro da safe zone: não encostar.
  const adjustPrompt = addingText ? `Make an image that nobody would suspect was generated by AI.

CRITICAL — THE PROVIDED IMAGE IS THE EXACT VISUAL BASE:
Use the provided image as the exact base for the output. Do NOT redraw, reinterpret,
recreate, regenerate, recompose, or restyle it. The output must be recognizably the
same image, unchanged in every region not covered by the text being added below.

The user is requesting new text to be added on top of this image: ${prompt}
Add exactly the text requested above, spelled exactly as provided, as a single-line
headline (about 25 characters or fewer, never wrapped to a second line), in the position
requested (or the lower-third of the image if no position was specified). Preserve
everything else exactly as is — composition, layout, framing, any text already present
and its exact wording, position and font, colors, subject, people, background.

MANDATORY RULES FOR THE TEXT BEING ADDED:
${buildTextTypographyRules()}${cropNote}

Do NOT rephrase, translate or restyle any text that was already present, and do NOT change
its wording. Keep pre-existing text where it is UNLESS it is outside the safe zone, crossing
a margin, or over a face — in that case move it (and the added text) fully inside the safe
zone and clear of every face; this is a text-only correction and must not reframe, crop or
letterbox the photo.
Do NOT add any logo or brand mark. If a logo or brand mark is ALREADY present in the
provided image, keep it identical — exact same size, exact same position — and never
enlarge, move, redraw, restyle or duplicate it. Do NOT crop, pad, letterbox or change the
aspect ratio of the photo.
${photoIdentitySection}

QUALITY STANDARD: Polished, professional edit — indistinguishable from the original image
with only the requested text added.

Avoid: redrawing or reinterpreting the scene, changing or repositioning any pre-existing
text, enlarging / moving / redrawing / duplicating a logo already in the image, changing the
layout or composition, replacing the background, altering the subject, serif or decorative
typefaces, text touching or crossing the safe-zone margins, generic AI aesthetics, plastic
skin, oversaturated colors, fake HDR.` : `Make an image that nobody would suspect was generated by AI.

CRITICAL — THE PROVIDED IMAGE IS THE EXACT VISUAL BASE:
Use the provided image as the exact base for the output. Do NOT redraw, reinterpret,
recreate, regenerate, recompose, or restyle it. The output must be recognizably the
same image, unchanged in every region not covered by the specific adjustment below.

CRITICAL — PRESERVE THE EXACT ORIGINAL FRAMING OF THE PHOTO (the image-edit model tends to
subtly zoom in or re-crop even when told to preserve the scene — this is a known failure and
must NOT happen here): keep the EXACT framing, scale, zoom level, crop and centering of the
provided image. Do NOT enlarge, zoom in, zoom out, crop, re-crop, re-center, pan, pad,
letterbox, or change the aspect ratio. The subject, the background and the photo framing must
stay exactly as they already are — the photo must not grow, shrink, or shift even slightly.
(The POSITION of any text is governed separately, in the TEXT block below — that is a
different thing from reframing the photo.)

Apply ONLY this specific change to the image: ${prompt}. Preserve everything else exactly
as is — composition, layout, framing, colors, subject, people, background, and every piece of
text's exact wording and font — except for the specific adjustment requested and any text
safe-zone correction described below.

Do NOT add, remove, rephrase, translate or restyle any text, and do NOT change its wording or
length. Do NOT add any logo or brand mark. If a logo or brand mark is ALREADY present in the
provided image, keep it identical — exact same size, exact same position — and never enlarge,
move, redraw, restyle or duplicate it. Do NOT crop, pad, letterbox or change the aspect ratio
of the photo.
${photoIdentitySection}

TEXT ALREADY IN THE IMAGE — its wording is correct: do NOT add, remove, shorten, lengthen,
rewrite, translate or restyle it. Its POSITION and SIZE follow this priority:
- If every piece of text is already fully inside the text safe zone and clear of every face:
  leave it exactly where and what size it is. Do not nudge it.
- If any text is already outside the safe zone, touching an edge, crossing the safe-zone
  margins, or sitting over a person's face or head: you MUST move it, and resize it if
  needed, to bring it fully inside the safe zone and clear of every face. This position
  correction OVERRIDES "keep everything exactly as is" — but it applies to the TEXT ONLY.
  Moving or resizing text is NOT the same as reframing the photo: the photo's subject,
  background, framing, scale and crop still must not change at all. Do not zoom, pan, crop,
  pad or letterbox the image to fix the text — just relocate the text within the existing
  frame.
The rules below define where the safe zone is and the typography the corrected text must keep:
${buildTextTypographyRules()}${cropNote}

QUALITY STANDARD: Polished, professional edit — indistinguishable from the original image
with only the requested adjustment applied (plus any text moved inside the safe zone), at the
exact same photo framing.

Avoid: redrawing or reinterpreting the scene, zooming or re-cropping the image, enlarging or
shifting the subject or the photo framing, rephrasing or restyling any text, moving text that
is already correctly inside the safe zone, enlarging / moving / redrawing / duplicating a logo
already in the image, leaving text across or outside the safe-zone margins, text over a face,
changing the layout or composition, replacing the background, altering the subject, generic AI
aesthetics, plastic skin, oversaturated colors,
fake HDR.`

  // Recomposição parcial: mantém a(s) pessoa(s) e o texto já embutido na imagem,
  // mas SUBSTITUI o ambiente/cenário/fundo conforme o pedido. gpt-image-2 em
  // images/edits tende a ser conservador demais e só reenquadrar a base — por isso
  // a linguagem aqui é enfática ("you MUST replace the entire surrounding
  // environment"). As mesmas seções puladas no modo adjust (safe-zone / overlay de
  // texto de carrossel / letterboxing) também não entram aqui: elas foram feitas
  // pra gerar cena nova e reposicionariam o texto já renderizado.
  const recomposePrompt = `Make an image that nobody would suspect was generated by AI.

CRITICAL — PARTIAL RECOMPOSITION (keep the person, rebuild the scene around them):
The provided image contains one or more people. You MUST replace the entire surrounding
environment / background with a new scene as described below, WHILE preserving the
person(s) exactly. This is the whole point of the task — a conservative result that only
reframes or lightly retouches the original background is a failure.

PRESERVE EXACTLY (do not alter in any way):
- Every person's face, facial features, proportions, hair, skin tone, expression, age
- Every person's body, pose, and clothing
- The lighting direction and quality falling on the person(s)
- Any text already rendered in the image — same wording, position, font, size, color

REPLACE / REBUILD (per the brief):
- The entire background, setting, location, environment and surroundings behind and
  around the person(s)

New environment / scene to build around the person(s):
${prompt}

Blend the person(s) naturally into the new environment: match perspective, ground
contact, cast shadows, depth of field and color temperature so the final result reads as
one real photograph taken on location — not a cut-out pasted onto a new background.

Do NOT add, remove, move, restyle or rephrase any text. Do NOT add any logo or brand
mark. Do NOT crop, pad, letterbox or change the aspect ratio. Do NOT duplicate the
person or generate extra people.
${photoIdentitySection}

QUALITY STANDARD: Photorealistic and polished — indistinguishable from a real photo shoot
of this exact person on location in the new environment.

Avoid: altering or duplicating the person, only reframing the original background instead
of replacing it, plastic skin, symmetrical faces, oversaturated colors, fake HDR,
compositing halos, mismatched lighting between subject and background, generic AI
aesthetics, stock photo feeling.`

  const finalPrompt = isRecompose ? recomposePrompt : isAdjust ? adjustPrompt : fullPrompt

  try {
    // Se tem referência de imagem (base64 ou URL), usa edits
    const refImage = visualReferences?.[0]
    
    if (refImage) {
      // Converte base64 para blob via fetch de data URL
      let imageBuffer
      if (refImage.startsWith('data:')) {
        const base64Data = refImage.split(',')[1]
        imageBuffer = Buffer.from(base64Data, 'base64')
      } else {
        // É uma URL — faz fetch
        const imgRes = await fetch(refImage)
        const ab = await imgRes.arrayBuffer()
        imageBuffer = Buffer.from(ab)
      }

      // Monta FormData manualmente
      const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
      const CRLF = '\r\n'
      
      const parts = []
      
      // model
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}gpt-image-2.5-flare`)
      // prompt
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="prompt"${CRLF}${CRLF}${finalPrompt}`)
      // n
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="n"${CRLF}${CRLF}1`)
      // size
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="size"${CRLF}${CRLF}${size || '1024x1024'}`)
      // quality
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="quality"${CRLF}${CRLF}medium`)

      const preamble = parts.join(CRLF) + CRLF
      const imageHeader = `--${boundary}${CRLF}Content-Disposition: form-data; name="image"; filename="reference.jpg"${CRLF}Content-Type: image/jpeg${CRLF}${CRLF}`
      const epilogue = `${CRLF}--${boundary}--`

      const body = Buffer.concat([
        Buffer.from(preamble),
        Buffer.from(imageHeader),
        imageBuffer,
        Buffer.from(epilogue),
      ])

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length.toString(),
        },
        body,
      })

      const responseText = await response.text()
      console.log('[premium] edits status:', response.status)
      console.log('[premium] edits preview:', responseText.substring(0, 300))

      if (response.ok) {
        const data = JSON.parse(responseText)
        const item = data.data?.[0]
        if (item?.b64_json) {
          return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` })
        }
        if (item?.url) {
          const imgRes = await fetch(item.url)
          const ab = await imgRes.arrayBuffer()
          const b64 = Buffer.from(ab).toString('base64')
          return res.status(200).json({ image: `data:image/png;base64,${b64}` })
        }
        // Resposta ok mas sem imagem — não faz sentido cair pro fallback sem referência
        return res.status(500).json({ error: 'OpenAI images/edits não retornou imagem' })
      }

      // edits falhou de verdade — propaga o erro real da OpenAI em vez de gerar
      // uma imagem nova ignorando a foto de referência do usuário
      return res.status(response.status).json({ error: `OpenAI images/edits error: ${responseText}` })
    }

    // Fallback: generations sem referência
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2.5-flare',
        prompt: finalPrompt,
        n: 1,
        size: size || '1024x1024',
        quality: 'medium',
      }),
    })

    const responseText = await response.text()
    console.log('[premium] generations status:', response.status)

    if (!response.ok) {
      return res.status(500).json({ error: `OpenAI API error: ${responseText}` })
    }

    const data = JSON.parse(responseText)
    const item = data.data?.[0]

    if (item?.b64_json) {
      return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` })
    }
    if (item?.url) {
      const imgRes = await fetch(item.url)
      const ab = await imgRes.arrayBuffer()
      const b64 = Buffer.from(ab).toString('base64')
      return res.status(200).json({ image: `data:image/png;base64,${b64}` })
    }

    return res.status(500).json({ error: 'No image returned from OpenAI' })

  } catch (err) {
    console.error('[generate-premium] erro:', err)
    return res.status(500).json({ error: `Internal server error: ${err.message}` })
  }
}
