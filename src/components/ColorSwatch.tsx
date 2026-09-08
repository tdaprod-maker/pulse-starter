import { useRef } from 'react'

/** Swatch de cor com `<input type="color">` escondido. Extraído de PropertiesPanel
 *  para ser reutilizado nos painéis de overlay de texto do Premium. */
export function ColorSwatch({ color, onChange, title }: { color: string; onChange: (hex: string) => void; title?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={() => inputRef.current?.click()}
      title={title ?? color.toUpperCase()}
      style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: color, border: '2px solid rgba(255,255,255,0.12)',
        cursor: 'pointer', flexShrink: 0, position: 'relative',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        transition: 'transform 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
    >
      <input ref={inputRef} type="color" value={color} onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0, width: '32px', height: '32px', cursor: 'pointer', border: 'none', padding: 0 }} />
    </div>
  )
}
