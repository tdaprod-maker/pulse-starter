import { createClient } from '@supabase/supabase-js'

// Mesma URL de projeto usada em src/lib/supabase.ts — não é secreta (é pública por
// natureza no Supabase, o que protege os dados é RLS + a chave usada).
const SUPABASE_URL = 'https://gnqhjcmvyhhodjghpuop.supabase.co'

/**
 * Client server-side com a service role key — ignora RLS. Só deve ser usado em
 * rotas /api que nunca expõem a chave ao browser (webhooks, crons). Nunca importe
 * este arquivo de código que roda no cliente.
 */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } })
}
