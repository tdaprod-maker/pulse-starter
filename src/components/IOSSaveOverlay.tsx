import { useEffect, useState } from 'react'

export interface IOSSaveImage {
  url: string
  label?: string
}

type Listener = (images: IOSSaveImage[] | null) => void
let listener: Listener | null = null

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

/**
 * Abre o overlay de salvar imagem em tela cheia (usado no iOS). Em vez de
 * window.open com blob URL — pouco confiável no Safari e no PWA instalado em
 * modo standalone — a imagem é exibida dentro do próprio app, sem navegação,
 * para que o usuário toque e segure e salve na galeria.
 */
export function openIOSSaveOverlay(images: IOSSaveImage[]) {
  listener?.(images.filter(img => !!img.url))
}

export function closeIOSSaveOverlay() {
  listener?.(null)
}

/** Monte uma única vez perto da raiz do app. */
export function IOSSaveOverlay() {
  const [images, setImages] = useState<IOSSaveImage[] | null>(null)

  useEffect(() => {
    listener = setImages
    return () => { if (listener === setImages) listener = null }
  }, [])

  if (!images || images.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div style={{
        position: 'sticky', top: 0, zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px',
        padding: 'max(14px, env(safe-area-inset-top)) 16px 14px',
        background: 'rgba(20,20,20,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
          👆 Toque e segure a imagem para salvar na galeria
        </span>
        <button
          onClick={() => setImages(null)}
          aria-label="Fechar"
          style={{
            width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '18px', lineHeight: 1,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: '28px',
        padding: '20px 16px calc(20px + env(safe-area-inset-bottom))', alignItems: 'center',
      }}>
        {images.map((img, i) => (
          <div key={i} style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            {img.label && (
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 500 }}>{img.label}</span>
            )}
            <img
              src={img.url}
              alt={img.label ?? `Imagem ${i + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
