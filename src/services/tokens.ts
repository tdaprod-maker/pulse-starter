import { supabase } from '../lib/supabase'

export async function getTokenBalance(email: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_tokens')
    .select('tokens_remaining')
    .eq('user_email', email)
    .single()

  if (error || !data) return 0
  return data.tokens_remaining
}

export async function debitToken(email: string): Promise<{ success: boolean; remaining: number }> {
  // Lê saldo atual
  const { data, error } = await supabase
    .from('user_tokens')
    .select('tokens_remaining, tokens_used')
    .eq('user_email', email)
    .single()

  if (error || !data) return { success: false, remaining: 0 }
  if (data.tokens_remaining <= 0) return { success: false, remaining: 0 }

  // Debita 1 token
  const { error: updateError } = await supabase
    .from('user_tokens')
    .update({
      tokens_remaining: data.tokens_remaining - 1,
      tokens_used: data.tokens_used + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_email', email)

  if (updateError) return { success: false, remaining: data.tokens_remaining }
  return { success: true, remaining: data.tokens_remaining - 1 }
}
