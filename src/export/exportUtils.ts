import Konva from 'konva'

export interface ExportOptions {
  /** Razão de pixels. Use 2/autoScale para obter 2× a resolução nativa. */
  pixelRatio?: number
  /** Apenas para JPEG. Valor entre 0 e 1. Padrão: 0.92 */
  quality?: number
  /** Apenas para PNG. Remove o fundo e exporta com canal alpha. */
  transparent?: boolean
}

/** Gera um nome de arquivo a partir do nome do template. */
export function buildFileName(templateName: string, suffix: string): string {
  const slug = templateName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${slug}-${suffix}`
}

function dataURLtoBlob(dataURL: string): Blob {
  const [header, base64] = dataURL.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return new Blob([array], { type: mime })
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

/** Dispara o download de um dataURL no browser, com suporte nativo a mobile iOS. */
function download(dataURL: string, fileName: string): void {
  const blob = dataURLtoBlob(dataURL)
  const blobURL = URL.createObjectURL(blob)

  if (isIOS()) {
    // iOS Safari ignora o atributo download; abre em nova aba para salvar via toque longo
    window.open(blobURL, '_blank')
    setTimeout(() => URL.revokeObjectURL(blobURL), 60_000)
  } else {
    const link = document.createElement('a')
    link.download = fileName
    link.href = blobURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(blobURL), 1_000)
  }
}

/**
 * Exporta o stage ativo como PNG e baixa o arquivo.
 *
 * @param stage      Instância do Konva.Stage obtida via ref.
 * @param fileName   Nome do arquivo de saída (ex: "hero-title-1x1-2x.png").
 * @param options    pixelRatio, transparent.
 *
 * Para resolução nativa 2×: passe pixelRatio = 2 / autoScale.
 * Para fundo transparente: passe transparent = true (oculta o Rect de fundo
 * temporariamente antes de renderizar e o restaura logo após).
 */
export function exportToPng(
  stage: Konva.Stage,
  fileName = 'pulse-export-2x.png',
  options: Pick<ExportOptions, 'pixelRatio' | 'transparent'> = {}
): void {
  const { pixelRatio = 2, transparent = false } = options

  // Deseleciona transformer antes de exportar
  stage.find('Transformer').forEach((tr: any) => tr.nodes([]))
  stage.batchDraw()

  setTimeout(() => {
    // Esconde stroke de seleção temporariamente
    const selectedNodes: any[] = []
    stage.find('Text, Rect, Image').forEach((node: any) => {
      if (node.stroke() === '#3A5AFF' && node.strokeWidth() > 0) {
        selectedNodes.push({ node, stroke: node.stroke(), strokeWidth: node.strokeWidth() })
        node.stroke('')
        node.strokeWidth(0)
      }
    })
    stage.batchDraw()

    if (transparent) {
      const layer = stage.getLayers()[0]
      const nodes = ['bg-rect', 'bg-image', 'bg-overlay']
        .map((n) => layer?.findOne<Konva.Node>(`.${n}`))
        .filter((n): n is Konva.Node => n != null)
      const wasVisible = nodes.map((n) => n.isVisible())
      nodes.forEach((n) => n.visible(false))
      stage.batchDraw()
      const dataURL = stage.toDataURL({ pixelRatio })
      selectedNodes.forEach(({ node, stroke, strokeWidth }) => {
        node.stroke(stroke)
        node.strokeWidth(strokeWidth)
      })
      nodes.forEach((n, i) => n.visible(wasVisible[i]))
      stage.batchDraw()
      download(dataURL, fileName)
    } else {
      const dataURL = stage.toDataURL({ pixelRatio })
      selectedNodes.forEach(({ node, stroke, strokeWidth }) => {
        node.stroke(stroke)
        node.strokeWidth(strokeWidth)
      })
      stage.batchDraw()
      download(dataURL, fileName)
    }
  }, 100)
}

/**
 * Exporta o stage ativo como JPEG e baixa o arquivo.
 *
 * @param stage      Instância do Konva.Stage obtida via ref.
 * @param fileName   Nome do arquivo de saída (ex: "hero-title-1x1-2x.jpg").
 * @param options    pixelRatio, quality (0–1).
 *
 * Para resolução nativa 2×: passe pixelRatio = 2 / autoScale.
 * JPEG não suporta transparência — o fundo sempre é renderizado.
 */
export function exportToJpeg(
  stage: Konva.Stage,
  fileName = 'pulse-export-2x.jpg',
  options: Pick<ExportOptions, 'pixelRatio' | 'quality'> = {}
): void {
  const { pixelRatio = 2, quality = 0.92 } = options

  // Deseleciona transformer antes de exportar
  stage.find('Transformer').forEach((tr: any) => tr.nodes([]))
  stage.batchDraw()

  setTimeout(() => {
    // Esconde stroke de seleção temporariamente
    const selectedNodes: any[] = []
    stage.find('Text, Rect, Image').forEach((node: any) => {
      if (node.stroke() === '#3A5AFF' && node.strokeWidth() > 0) {
        selectedNodes.push({ node, stroke: node.stroke(), strokeWidth: node.strokeWidth() })
        node.stroke('')
        node.strokeWidth(0)
      }
    })
    stage.batchDraw()
    const dataURL = (stage as any).toDataURL({ pixelRatio, mimeType: 'image/jpeg', quality })
    selectedNodes.forEach(({ node, stroke, strokeWidth }) => {
      node.stroke(stroke)
      node.strokeWidth(strokeWidth)
    })
    stage.batchDraw()
    download(dataURL, fileName)
  }, 100)
}
