import { supabase } from '../lib/supabase'
import { debitToken } from './tokens'

export async function generateImage(imagePrompt: string): Promise<string> {
  // Debita 1 token antes de gerar
  const { data: authData } = await supabase.auth.getUser()
  const email = authData.user?.email ?? ''
  if (email) {
    const { success } = await debitToken(email)
    if (!success) {
      throw new Error('Tokens insuficientes. Recarregue seu saldo.')
    }
  }

  const res = await fetch('/api/generate-image-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: imagePrompt }),
  })
  if (!res.ok) throw new Error(`Erro ao gerar imagem: ${res.status}`)
  const data = await res.json()
  return data.image
}
