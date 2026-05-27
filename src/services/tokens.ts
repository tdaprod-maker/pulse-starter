import { supabase } from '../lib/supabase'

// Custo em pulses por ação
export const PULSE_COSTS = {
  POST: 4,           // Gerar post com imagem FAL.ai
  PREMIUM_POST: 8,   // Gerar post com GPT Image 2 (fotorrealista)
  CAROUSEL_SLIDE: 2,         // Por slide do carrossel (FAL.ai)
  PREMIUM_CAROUSEL_SLIDE: 4, // Por slide do carrossel premium (GPT Image 2)
  EDIT_IMAGE: 3,     // Editar imagem com IA
  REVIEW_POST: 1,    // Revisar post com agente
} as const

export async function getTokenBalance(email: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_tokens')
    .select('tokens_remaining')
    .eq('user_email', email)
    .single()
  if (error || !data) return 0
  return data.tokens_remaining
}

export async function debitToken(email: string, amount: number = 1): Promise<{ success: boolean; remaining: number }> {
  const { data, error } = await supabase
    .from('user_tokens')
    .select('tokens_remaining, tokens_used')
    .eq('user_email', email)
    .single()

  if (error || !data) return { success: false, remaining: 0 }
  if (data.tokens_remaining < amount) return { success: false, remaining: data.tokens_remaining }

  const { error: updateError } = await supabase
    .from('user_tokens')
    .update({
      tokens_remaining: data.tokens_remaining - amount,
      tokens_used: data.tokens_used + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_email', email)

  if (updateError) return { success: false, remaining: data.tokens_remaining }
  return { success: true, remaining: data.tokens_remaining - amount }
}

export function notifyBalanceUpdate() {
  window.dispatchEvent(new CustomEvent('pulse-balance-updated'))
}
