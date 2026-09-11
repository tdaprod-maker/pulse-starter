export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center' | 'top-center'
export type LogoSize = 'small' | 'medium' | 'large'

const SIZE_RATIO: Record<LogoSize, number> = {
  small: 0.14,
  medium: 0.20,
  large: 0.28,
}

// Margem do logo — DESACOPLADA da safe zone de texto. O logo é um selo de marca no
// canto: só precisa não encostar na borda. A safe zone por proporção (10/8/13 etc.)
// continua valendo, mas só pra headline/subtitle no api/generate-premium.js — ela
// existe pra o texto não ser cortado pela UI/grid do Instagram, o que não se aplica
// a um watermark de canto.
//
// Valor: 4% da largura da imagem, uniforme nas 4 bordas (= ~43px num canvas de
// 1080px de largura, ~77px em 1920px). É o valor que vigorou até o commit 05a9df6
// sem nenhuma reclamação de posição do logo — este bloco é um revert literal desse
// estado, depois que o 05a9df6 (que passou a ancorar o logo na safe zone de texto)
// jogou todo logo 54-153px pra dentro e fez o selo "flutuar". Dentro da faixa 3-5%:
// 3% (~32px) fica colado demais e pode colidir com o respiro interno do próprio
// logo; 5% (~54px) já recomeça a destacar o selo do canto. 4% é o meio e o
// conhecido-bom. Não varia por aspect-ratio de propósito — um selo de canto quer
// um gap de pixel consistente, não um recuo proporcional a cada eixo.
const LOGO_MARGIN_RATIO = 0.04

export function overlayLogoOnImage(
  imageBase64: string,
  logoUrl: string,
  position: LogoPosition = 'bottom-right',
  size: LogoSize = 'medium',
): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const logo = new Image()
      logo.crossOrigin = 'anonymous'
      logo.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        const margin = img.width * LOGO_MARGIN_RATIO
        const sideMargin = margin
        const topMargin = margin
        const bottomMargin = margin
        const maxLogoW = img.width * SIZE_RATIO[size]
        const ratio = logo.naturalWidth / logo.naturalHeight
        const logoW = Math.min(maxLogoW, logo.naturalWidth)
        const logoH = logoW / ratio

        let x = img.width - logoW - sideMargin
        let y = img.height - logoH - bottomMargin
        switch (position) {
          case 'top-left':
            x = sideMargin; y = topMargin
            break
          case 'top-right':
            x = img.width - logoW - sideMargin; y = topMargin
            break
          case 'bottom-left':
            x = sideMargin; y = img.height - logoH - bottomMargin
            break
          case 'bottom-center':
            x = (img.width - logoW) / 2; y = img.height - logoH - bottomMargin
            break
          case 'center':
            x = (img.width - logoW) / 2; y = (img.height - logoH) / 2
            break
          case 'top-center':
            x = (img.width - logoW) / 2; y = topMargin
            break
          case 'bottom-right':
          default:
            x = img.width - logoW - sideMargin; y = img.height - logoH - bottomMargin
        }

        ctx.drawImage(logo, x, y, logoW, logoH)
        resolve(canvas.toDataURL('image/png'))
      }
      logo.onerror = () => resolve(imageBase64)
      logo.src = logoUrl
    }
    img.onerror = () => resolve(imageBase64)
    img.src = imageBase64
  })
}
