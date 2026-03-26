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

/** Dispara o download de um dataURL no browser. */
function download(dataURL: string, fileName: string): void {
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

  if (transparent) {
    // Oculta todos os nós de fundo (rect sólido, imagem e overlay) pelo name
    const layer = stage.getLayers()[0]
    const nodes = ['bg-rect', 'bg-image', 'bg-overlay']
      .map((n) => layer?.findOne<Konva.Node>(`.${n}`))
      .filter((n): n is Konva.Node => n != null)
    const wasVisible = nodes.map((n) => n.isVisible())

    nodes.forEach((n) => n.visible(false))
    // Deseleciona todos os elementos antes de exportar
    stage.find('Transformer').forEach((tr: any) => tr.nodes([]))
    stage.find('.selected').forEach((node: any) => node.draggable(false))
    stage.batchDraw()

    const dataURL = stage.toDataURL({ pixelRatio })
    download(dataURL, fileName)

    nodes.forEach((n, i) => n.visible(wasVisible[i]))
    stage.batchDraw()
  } else {
    // Deseleciona todos os elementos antes de exportar
    stage.find('Transformer').forEach((tr: any) => tr.nodes([]))
    stage.find('.selected').forEach((node: any) => node.draggable(false))
    stage.batchDraw()
    download(stage.toDataURL({ pixelRatio }), fileName)
  }
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
  // Deseleciona todos os elementos antes de exportar
  stage.find('Transformer').forEach((tr: any) => tr.nodes([]))
  stage.find('.selected').forEach((node: any) => node.draggable(false))
  stage.batchDraw()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataURL = (stage as any).toDataURL({ pixelRatio, mimeType: 'image/jpeg', quality })
  download(dataURL, fileName)
}
