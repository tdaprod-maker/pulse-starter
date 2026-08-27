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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, slideIndex, totalSlides, styleContext, segment, size, visualReferences, slideTitle, slideBody, visualStyle, editMode } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const resolvedVisualStyle = visualStyle === 'illustration' || visualStyle === 'typography' ? visualStyle : 'photo'
  const hasReferencePhoto = !!visualReferences?.length

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

  // Presente apenas em slides de carrossel premium
  const carouselTextOverlay = slideTitle ? `

CAROUSEL SLIDE TEXT OVERLAY — MANDATORY OVERRIDE:
This image is slide ${slideIndex} of ${totalSlides} in an Instagram carousel. This requirement takes priority over any conflicting typography guidance above.
${slideBody
  ? `Render ONLY this exact text visible in the image: "${slideTitle}" as the headline, and "${slideBody}" as a short supporting subtitle. Nothing else. No bullet points, no icons with labels, no lists, no additional text sections.`
  : `Render ONLY this exact text visible in the image: "${slideTitle}". Nothing else. No subtitles, no bullet points, no icons with labels, no lists, no multiple text sections.`}
Text placement rules:
- Position in the lower-center or center zone of the image
- Ensure high contrast: white text on dark areas, or dark text on light areas, or use a semi-transparent background strip
- Typography must be elegant and modern, matching the brand style
- Text in Portuguese (Brazil) as provided above — do NOT translate or change it
- Typography consistency is critical: use only a single clean sans-serif typeface (like Helvetica, Arial or similar) throughout the entire image. Bold weight for headline, regular weight for subtitle. No decorative fonts, no mixed typefaces.
- CRITICAL SAFE ZONE (Instagram compliance): For a 1080x1350px (4:5) canvas, keep all text and logo elements within a safe zone of 1012x1230px centered in the image — that means a margin of approximately 34px from left/right edges and 60px from top/bottom edges. Scale this proportionally for other aspect ratios (1:1, 9:16, 16:9): maintain roughly 3% margin on left/right and 4.5% margin on top/bottom relative to canvas dimensions. NEVER place text or logo outside this safe zone. This is mandatory for correct display in Instagram feed and profile grid without cropping.
- CRITICAL FONT SIZE: All text must be large enough to be read clearly on a mobile phone screen at normal viewing distance. Headline text should be bold and occupy significant visual weight. Never use small, thin, or delicate typography for headlines. Body text should be at minimum 60% the size relative to headline for clear hierarchy.
- CRITICAL SPELLING ACCURACY: reproduce the text EXACTLY character by character as provided, including all accents (á, é, í, ó, ú, â, ê, ô, ã, õ, ç) and diacritics. Double-check Portuguese special characters before finalizing — common errors include confusing ã with ãi, é with ê, ó with õ. The text must be spelled perfectly matching the input, letter by letter.` : ''

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

  // Quando há foto de referência, o prompt de "gerar cena do zero" (VISUAL BRIEF +
  // VISUAL SUBJECT RULE + regras de composição) faz o GPT Image redesenhar a foto
  // inteira em vez de usá-la como base — por isso esse bloco é substituído por uma
  // diretiva de edição que trata a foto como base fixa, só com overlay/ajustes.
  const referenceBaseDirective = hasReferencePhoto ? `

CRITICAL — THE REFERENCE PHOTO IS THE EXACT VISUAL BASE (read first, overrides any instruction below that implies generating a new scene):
Use the provided image as the exact visual base for the output. Do NOT redraw, reinterpret, recreate, or regenerate the scene, subject, people, objects, background, framing, angle, or composition. The output must be recognizably the same photo, unchanged in every region not explicitly modified below.
Only make these changes on top of the untouched base photo:
- Add the text overlay and/or logo space described below (if any)
- Subtly adjust lighting, color grading, or atmosphere ONLY if explicitly requested in the brief below
- THE ONLY EXCEPTION TO EXACT FRAMING: if fitting the mandatory text safe-zone (see CRITICAL SAFE ZONE rule below) requires it, you MAY shrink the photo and add neutral letterboxing/padding (solid color bars matching the photo's dominant tone) around it. This is the single allowed departure from "framing stays exactly as provided" — the photo itself (people, objects, setting, angle, composition) still must not be redrawn, cropped into, or reinterpreted; it is only placed smaller within the canvas, padded, never cropped.
Treat this strictly as a targeted photo edit, not a scene generated from a text brief. Everything else already in the photo — the people, objects, setting, and framing — must remain exactly as provided, except for letterboxing/padding as described above when required to fit the text safe zone.` : ''

  const briefLabel = hasReferencePhoto
    ? 'EDIT INSTRUCTIONS (what to add or adjust on top of the reference photo — this is NOT a new scene to generate)'
    : 'VISUAL BRIEF'

  const visualSubjectSection = hasReferencePhoto
    ? '- N/A — a reference photo is provided as the exact visual base (see the CRITICAL directive above). Do not invent, substitute, or redraw a different subject, person, or scene.'
    : SUBJECT_RULE_BY_STYLE[resolvedVisualStyle](slideTitle)

  const compositionRules = hasReferencePhoto ? `
- Preserve the reference photo's existing background, framing, angle, and composition exactly — do not replace, crop, or restyle it
- Only the added text/logo elements should follow the placement and safe-zone rules below; everything else in the photo stays untouched
- TEXT PRIORITY OVER PHOTO FRAMING: If fitting the text within the safe zone (as specified below in the CRITICAL SAFE ZONE rule) requires reducing, repositioning, or adding letterboxing/padding to the reference photo, DO THIS. The text must NEVER be cut off, cropped, or extend beyond the safe zone — this takes priority over preserving the photo at full frame. It is acceptable and expected to show the photo slightly smaller, with neutral padding (solid color bars matching the photo's dominant tone) above/below or sides, to guarantee 100% of the text fits within the safe zone with proper margins. A photo shown smaller with complete, uncropped text is far better than a full-frame photo with cropped or cut-off text.` : `
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
- CRITICAL TEXT LIMIT: Use NO MAXIMUM 2 lines of headline text and 1 short subtitle. NO bullet points, NO icons with labels, NO lists, NO multiple sections of text. One powerful message only. White space is design.
- CRITICAL SAFE ZONE (Instagram compliance): For a 1080x1350px (4:5) canvas, keep all text and logo elements within a safe zone of 1012x1230px centered in the image — that means a margin of approximately 34px from left/right edges and 60px from top/bottom edges. Scale this proportionally for other aspect ratios (1:1, 9:16, 16:9): maintain roughly 3% margin on left/right and 4.5% margin on top/bottom relative to canvas dimensions. NEVER place text or logo outside this safe zone. This is mandatory for correct display in Instagram feed and profile grid without cropping.
- CRITICAL FONT SIZE: All text must be large enough to be read clearly on a mobile phone screen at normal viewing distance. Headline text should be bold and occupy significant visual weight. Never use small, thin, or delicate typography for headlines. Body text should be at minimum 60% the size relative to headline for clear hierarchy.
- CRITICAL SPELLING ACCURACY: reproduce the text EXACTLY character by character as provided, including all accents (á, é, í, ó, ú, â, ê, ô, ã, õ, ç) and diacritics. Double-check Portuguese special characters before finalizing — common errors include confusing ã with ãi, é with ê, ó with õ. The text must be spelled perfectly matching the input, letter by letter.
${carouselTextOverlay}
QUALITY STANDARD: ${hasReferencePhoto ? 'Polished, professional photo edit — indistinguishable from the original photo with a subtle, high-end text/logo overlay added on top.' : QUALITY_STANDARD_BY_STYLE[resolvedVisualStyle]}

Avoid: ${hasReferencePhoto
    ? 'redrawing or reinterpreting the scene, replacing the background, altering the subject, generic AI aesthetics, plastic skin, oversaturated colors, fake HDR'
    : `${AVOID_BY_STYLE[resolvedVisualStyle]}. Specifically, do NOT default to this segment's most recycled visual cliché: ${namedClichesForSegment(segment || styleContext)}`}.`

  // Prompt minimalista para ajuste pós-geração: a imagem recebida já está pronta
  // (com texto embutido) e o único objetivo é aplicar a mudança pedida sem
  // reinterpretar composição, texto, cores ou sujeito. Nenhuma regra de
  // safe-zone / overlay de texto / letterboxing entra aqui de propósito.
  const adjustPrompt = `Make an image that nobody would suspect was generated by AI.

CRITICAL — THE PROVIDED IMAGE IS THE EXACT VISUAL BASE:
Use the provided image as the exact base for the output. Do NOT redraw, reinterpret,
recreate, regenerate, recompose, or restyle it. The output must be recognizably the
same image, unchanged in every region not covered by the specific adjustment below.

Apply ONLY this specific change to the image: ${prompt}. Preserve everything else exactly
as is — composition, layout, framing, every piece of text and its exact wording, position
and font, colors, subject, people, background — except for the specific adjustment requested.

Do NOT add, remove, move, resize, restyle or rephrase any text. Do NOT add any logo or brand
mark. Do NOT crop, pad, letterbox or change the aspect ratio.
${photoIdentitySection}

QUALITY STANDARD: Polished, professional edit — indistinguishable from the original image
with only the requested adjustment applied.

Avoid: redrawing or reinterpreting the scene, changing or repositioning any text, changing
the layout or composition, replacing the background, altering the subject, generic AI
aesthetics, plastic skin, oversaturated colors, fake HDR.`

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
      parts.push(`--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}gpt-image-2`)
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
        model: 'gpt-image-2',
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
