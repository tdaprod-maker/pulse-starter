export async function generateImage(imagePrompt: string): Promise<string> {
  const res = await fetch('/api/generate-image-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: imagePrompt }),
  })
  if (!res.ok) throw new Error(`Erro ao gerar imagem: ${res.status}`)
  const data = await res.json()
  return data.image
}
// cache bust Seg  9 Mar 2026 22:59:49 -03
