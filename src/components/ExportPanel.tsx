import { type RefObject } from 'react'
import type Konva from 'konva'
import type { Template } from '../state/useStore'
import { calcAutoScale } from '../engine/CanvasEngine'
import { exportToPng, buildFileName } from '../export/exportUtils'

interface ExportPanelProps {
  stageRef: RefObject<Konva.Stage | null>
  template: Template
  variantRefs?: RefObject<Record<string, Konva.Stage | null>>
  allVariants?: Template[]
}

export function ExportPanel({ stageRef, template }: ExportPanelProps) {
  const autoScale = calcAutoScale(template)
  const exportPixelRatio = 2 / autoScale
  const baseName = buildFileName(template.name, '2x')

  function handlePng() {
    const stage = stageRef.current
    if (!stage) return
    exportToPng(stage, `${baseName}.png`, { pixelRatio: exportPixelRatio })
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', borderTop: '1px solid var(--border)' }}>
      <button
        onClick={handlePng}
        style={{
          width: '100%', padding: '11px 16px', borderRadius: '8px', cursor: 'pointer',
          background: '#3A5AFF', border: 'none', color: '#fff',
          fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        Baixar
      </button>
    </div>
  )
}
