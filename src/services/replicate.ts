import { supabase } from '../lib/supabase'
import { debitToken, PULSE_COSTS, notifyBalanceUpdate } from './tokens'

export async function generateImage(imagePrompt: string, cost?: number): Promise<string> {
  const { data: authData } = await supabase.auth.getSession()
  const email = authData.session?.user?.email ?? ''
  if (email) {
    const pulses = cost ?? PULSE_COSTS.POST
    const { success } = await debitToken(email, pulses)
    if (!success) {
      throw new Error('Pulses insuficientes. Recarregue seu saldo.')
    }
    notifyBalanceUpdate()
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
