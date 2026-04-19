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
  photos: string[]
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
    .upsert({ user_email: userEmail, ...config, updated_at: new Date().toISOString() })
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

export async function uploadThumbnail(
  postId: string,
  userEmail: string,
  dataUrl: string
): Promise<string | null> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `thumbnails/${userEmail}/${postId}.jpg`

  const { error } = await supabase.storage
    .from('media')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

  if (error) return null

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
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
