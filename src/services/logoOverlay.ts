export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center' | 'top-center'
export type LogoSize = 'small' | 'medium' | 'large'

const SIZE_RATIO: Record<LogoSize, number> = {
  small: 0.14,
  medium: 0.20,
  large: 0.28,
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

        const margin = img.width * 0.04
        const maxLogoW = img.width * SIZE_RATIO[size]
        const ratio = logo.naturalWidth / logo.naturalHeight
        const logoW = Math.min(maxLogoW, logo.naturalWidth)
        const logoH = logoW / ratio

        let x = img.width - logoW - margin
        let y = img.height - logoH - margin
        switch (position) {
          case 'top-left':
            x = margin; y = margin
            break
          case 'top-right':
            x = img.width - logoW - margin; y = margin
            break
          case 'bottom-left':
            x = margin; y = img.height - logoH - margin
            break
          case 'bottom-center':
            x = (img.width - logoW) / 2; y = img.height - logoH - margin
            break
          case 'center':
            x = (img.width - logoW) / 2; y = (img.height - logoH) / 2
            break
          case 'top-center':
            x = (img.width - logoW) / 2; y = img.height / 3 - logoH / 2
            break
          case 'bottom-right':
          default:
            x = img.width - logoW - margin; y = img.height - logoH - margin
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
