import { supabase } from '../lib/supabase'

export interface SocialConnection {
  access_token: string
  platform_user_id: string
  platform_username: string | null
  expires_at: string | null
  is_valid: boolean
}

export async function getConnection(email: string, platform: string): Promise<SocialConnection | null> {
  const { data, error } = await supabase
    .from('social_connections')
    .select('access_token, platform_user_id, platform_username, expires_at, is_valid')
    .eq('user_email', email)
    .eq('platform', platform)
    .single()

  if (error || !data) return null
  return data as SocialConnection
}

export async function saveConnection(
  email: string,
  platform: string,
  access_token: string,
  platform_user_id: string,
  platform_username: string | null,
  expires_at: string | null,
): Promise<void> {
  await supabase.from('social_connections').upsert(
    {
      user_email: email,
      platform,
      access_token,
      platform_user_id,
      platform_username,
      expires_at,
      is_valid: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_email,platform' },
  )
}

export async function removeConnection(email: string, platform: string): Promise<void> {
  await supabase.from('social_connections').delete().eq('user_email', email).eq('platform', platform)
}

export async function getInstagramConnection(
  email: string,
): Promise<{ access_token: string; ig_user_id: string; username: string } | null> {
  const conn = await getConnection(email, 'instagram')
  if (!conn || !conn.is_valid) return null

  // Lazy refresh: renova se expira em menos de 7 dias
  if (conn.expires_at) {
    const expiresAt = new Date(conn.expires_at)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    if (expiresAt < sevenDaysFromNow) {
      try {
        const res = await fetch('/api/instagram-refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: conn.access_token }),
        })
        const refreshed = await res.json()
        if (refreshed.access_token) {
          await saveConnection(email, 'instagram', refreshed.access_token, conn.platform_user_id, conn.platform_username, refreshed.expires_at)
          return { access_token: refreshed.access_token, ig_user_id: conn.platform_user_id, username: conn.platform_username ?? '' }
        }
      } catch {
        // continua com token atual se refresh falhar
      }
    }
  }

  return { access_token: conn.access_token, ig_user_id: conn.platform_user_id, username: conn.platform_username ?? '' }
}
