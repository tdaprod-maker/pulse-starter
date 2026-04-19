import { supabase } from '../lib/supabase'
import { debitToken, PULSE_COSTS } from './tokens'

export async function generateImage(imagePrompt: string): Promise<string> {
  // Debita 1 pulse antes de gerar
  const { data: authData } = await supabase.auth.getSession()
  const email = authData.session?.user?.email ?? ''
  if (email) {
    const { success } = await debitToken(email, PULSE_COSTS.POST)
    if (!success) {
      throw new Error('Pulses insuficientes. Recarregue seu saldo.')
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
