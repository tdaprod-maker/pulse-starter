import { supabase } from '../lib/supabase'

export type BrandLogo = { url: string; label: string }

export interface BrandConfig {
  brand_name: string
  logo_url: string | null
  logos: BrandLogo[]
  color_primary: string
  color_secondary: string
  color_accent: string
  font_title: string
  font_body: string
  segment?: string
  tone?: string
  business_name?: string
  brand_description?: string
  visual_style?: string
  visual_references?: string[]
  site_url?: string
  photos: string[]
  nicho_info?: Record<string, string> | null
}

export const DEFAULT_BRAND: BrandConfig = {
  brand_name: 'AGENTE 17',
  logo_url: null,
  logos: [],
  color_primary: '#3A5AFF',
  color_secondary: '#5B8FD4',
  color_accent: '#FFCA1D',
  font_title: 'Bebas Neue',
  font_body: 'Inter',
  segment: '',
  tone: '',
  business_name: 'AGENTE 17',
  brand_description: '',
  photos: [],
  nicho_info: {},
}

export async function uploadPhoto(file: File, email: string): Promise<string | null> {
  const path = `photos/${email}/${Date.now()}_${file.name}`
  return uploadMedia(file, path)
}

export async function uploadLogo(file: File, email: string, label: string): Promise<BrandLogo | null> {
  const path = `logos/${email}/${Date.now()}_${file.name}`
  const url = await uploadMedia(file, path)
  if (!url) return null
  return { url, label }
}

export async function loadBrandConfig(userEmail: string): Promise<BrandConfig> {
  const { data, error } = await supabase
    .from('brand_config')
    .select('*')
    .eq('user_email', userEmail)
    .single()

  if (error || !data) return DEFAULT_BRAND
  return data as BrandConfig
}

export async function saveBrandConfig(
  userEmail: string,
  config: Partial<BrandConfig>
): Promise<void> {
  await supabase
    .from('brand_config')
    .upsert({ user_email: userEmail, ...config, updated_at: new Date().toISOString() }, { onConflict: 'user_email' })
}

export async function uploadMedia(
  file: File,
  path: string
): Promise<string | null> {
  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { upsert: true })

  if (error) return null

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(path)

  return data.publicUrl
}

export interface PostRecord {
  id?: string
  user_email?: string
  template_id: string
  texts: Record<string, string>
  accent_color: string
  image_prompt: string
  thumbnail_url?: string
  created_at?: string
}

export async function savePost(
  userEmail: string,
  post: Omit<PostRecord, 'id' | 'user_email' | 'created_at'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_email: userEmail, ...post })
    .select('id')
    .single()
  if (error) return null
  return data.id
}

export async function loadPosts(userEmail: string): Promise<PostRecord[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return []
  return data as PostRecord[]
}

// Reencoda um data URL de canvas para JPEG antes do upload. cropImageToRatio /
// overlayTextOnImage emitem PNG de canvas de até 4608×8192 → 5-26 MB por thumbnail.
// A thumbnail é preview + base de restauração, nunca o export final; q0.92 é
// visualmente idêntico e corta ~90% do peso. JPEG não tem alpha → pinta fundo
// branco pra transparência não virar preto. Devolve null se a imagem não carregar
// ou o canvas ficar tainted (o chamador trata como falha real, sem gravar).
function reencodeThumbnailToJpeg(dataUrl: string, quality = 0.92): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(null); return }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

export async function uploadThumbnail(
  postId: string,
  userEmail: string,
  dataUrl: string
): Promise<string | null> {
  const blob = await reencodeThumbnailToJpeg(dataUrl)
  if (!blob) return null
  const path = `thumbnails/${userEmail}/${postId}.jpg`

  // cacheControl longo é seguro porque a URL abaixo é versionada (?v=) — cada
  // gravação vira uma chave de cache nova e imutável.
  const { error } = await supabase.storage
    .from('media')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '31536000' })

  if (error) return null

  // Cache-bust: o path é determinístico (upsert sempre sobrescreve o MESMO objeto),
  // então a URL crua do getPublicUrl é byte-idêntica entre gravações. Com
  // Cache-Control + CDN, todo <img src={thumbnail_url}> (LibraryPage,
  // PostLibraryPage, EditorPage na restauração) continuava servindo a 1ª versão
  // depois de uma edição. O ?v={timestamp} muda a string salva a cada gravação e
  // força o refetch dos bytes novos, sem tocar nos consumidores.
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

export async function deletePost(postId: string): Promise<void> {
  await supabase.from('posts').delete().eq('id', postId)
}

export async function updatePostThumbnail(
  postId: string,
  thumbnailUrl: string
): Promise<void> {
  await supabase
    .from('posts')
    .update({ thumbnail_url: thumbnailUrl })
    .eq('id', postId)
}

// Sobrescreve as imagens de um carrossel já salvo (tabela `carousels`, coluna
// `slide_images` — JSON string de data URLs). Usado quando um ajuste pós-geração
// altera um slide de um carrossel Premium restaurado da Biblioteca, para o
// registro salvo refletir a versão ajustada em vez da original.
// Retorna true só se a gravação confirmou (sem erro E uma linha afetada) — o
// chamador (persistAdjustedPremium) depende disso pra não dizer "Biblioteca
// atualizada" quando nada foi gravado.
export async function updateCarouselSlideImages(
  carouselId: string,
  slideImages: string[]
): Promise<boolean> {
  const { data, error } = await supabase
    .from('carousels')
    .update({ slide_images: JSON.stringify(slideImages) })
    .eq('id', carouselId)
    .select('id')
  if (error) {
    console.error('[updateCarouselSlideImages] falha ao gravar:', error)
    return false
  }
  return !!data && data.length > 0
}
