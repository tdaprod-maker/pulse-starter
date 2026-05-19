import React, { type RefObject, useState } from 'react'
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

export function ExportPanel({ stageRef, template, variantRefs, allVariants }: ExportPanelProps) {
  const [exportingAll, setExportingAll] = useState(false)
  const autoScale = calcAutoScale(template)
  const exportPixelRatio = 2 / autoScale
  const baseName = buildFileName(template.name, '2x')

  function handlePng() {
    const stage = stageRef.current
    if (!stage) return
    exportToPng(stage, `${baseName}.png`, { pixelRatio: exportPixelRatio })
  }

  async function handleExportAll() {
    if (!variantRefs?.current || !allVariants?.length) return
    setExportingAll(true)
    for (const variant of allVariants) {
      const stage = variantRefs.current[variant.id]
      if (!stage) continue
      const variantAutoScale = calcAutoScale(variant)
      const pixelRatio = 2 / variantAutoScale
      const fileName = `${buildFileName(variant.name, '2x')}.png`
      exportToPng(stage, fileName, { pixelRatio })
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    setExportingAll(false)
  }

  const btnSecondary: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500,
    fontFamily: 'inherit', transition: 'all 0.15s',
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

      {allVariants && allVariants.length > 1 && (
        <button
          onClick={handleExportAll}
          disabled={exportingAll}
          style={{ ...btnSecondary, opacity: exportingAll ? 0.6 : 1, cursor: exportingAll ? 'default' : 'pointer' }}
          onMouseEnter={e => { if (!exportingAll) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
          onMouseLeave={e => { if (!exportingAll) { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
        >
          {exportingAll ? 'Exportando...' : `Baixar todos os formatos (${allVariants.length}×)`}
        </button>
      )}
    </div>
  )
}
