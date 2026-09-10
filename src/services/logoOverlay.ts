export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center' | 'top-center'
export type LogoSize = 'small' | 'medium' | 'large'

const SIZE_RATIO: Record<LogoSize, number> = {
  small: 0.14,
  medium: 0.20,
  large: 0.28,
}

// Safe zone por proporção — os MESMOS mínimos que api/generate-premium.js impõe ao
// modelo ("Keep ALL text and logo elements inside..."), medidos de layouts reais.
// `side` é % da largura; `top`/`bottom` são % da altura. Antes daqui saía um 4%
// fixo em todas as bordas, o que deixava o logo bem fora dessa safe zone (ex.: 4:5
// pede 10% lateral / 13% base). Ver CLAUDE.md, "safe zone do texto Premium por
// proporção".
function safeZoneMargins(width: number, height: number): { side: number; top: number; bottom: number } {
  const r = width / height
  if (Math.abs(r - 1) < 0.05) return { side: 0.10, top: 0.09, bottom: 0.09 } // 1:1
  if (r < 1) {
    return r < 0.66
      ? { side: 0.15, top: 0.09, bottom: 0.09 } // 9:16
      : { side: 0.10, top: 0.08, bottom: 0.13 } // 4:5
  }
  return { side: 0.12, top: 0.12, bottom: 0.12 } // 16:9 ou qualquer outra
}

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

        const mz = safeZoneMargins(img.width, img.height)
        const sideMargin = img.width * mz.side
        const topMargin = img.height * mz.top
        const bottomMargin = img.height * mz.bottom
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
