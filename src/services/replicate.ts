/**
 * Geração de imagem via proxy local (porta 3001) que consulta Pollinations.ai.
 * Retorna a imagem como base64 data URL pronta para uso como src do <img>.
 */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export async function generateImage(imagePrompt: string): Promise<string> {
  const res = await fetch(`${SERVER_URL}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: imagePrompt }),
  })
  if (!res.ok) throw new Error(`Erro ao gerar imagem: ${res.status}`)
  const data = await res.json()
  return data.image
}
