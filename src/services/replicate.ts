import { supabase } from '../lib/supabase'
import { debitToken } from './tokens'

export async function generateImage(imagePrompt: string, referenceImageUrl?: string): Promise<string> {
  // Debita 1 pulse antes de gerar
  const { data: authData } = await supabase.auth.getSession()
  const email = authData.session?.user?.email ?? ''
  if (email) {
    const { success } = await debitToken(email)
    if (!success) {
      throw new Error('Pulses insuficientes. Recarregue seu saldo.')
    }
  }

  // Se tiver imagem de referência, usa FLUX Kontext para replicar o estilo
  if (referenceImageUrl) {
    const res = await fetch('/api/edit-image-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: referenceImageUrl,
        prompt: `Mantendo o estilo visual desta imagem de referência, crie uma nova imagem com o seguinte conteúdo: ${imagePrompt}. Preserve a paleta de cores, composição e atmosfera visual da referência.`,
      }),
    })
    if (!res.ok) throw new Error(`Erro ao gerar imagem com referência: ${res.status}`)
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data.image
  }

  // Sem referência — usa FLUX Schnell normal
  const res = await fetch('/api/generate-image-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: imagePrompt }),
  })
  if (!res.ok) throw new Error(`Erro ao gerar imagem: ${res.status}`)
  const data = await res.json()
  return data.image
}
