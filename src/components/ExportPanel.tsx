import React, { type RefObject } from 'react'
import type Konva from 'konva'
import type { Template } from '../state/useStore'
import { calcAutoScale } from '../engine/CanvasEngine'
import { exportToPng, exportToJpeg, buildFileName } from '../export/exportUtils'

interface ExportPanelProps {
  stageRef: RefObject<Konva.Stage | null>
  template: Template
}

export function ExportPanel({ stageRef, template }: ExportPanelProps) {
  const autoScale = calcAutoScale(template)
  // pixelRatio que produz exatamente 2× a resolução nativa do template
  const exportPixelRatio = 2 / autoScale

  const exportW = template.width * 2
  const exportH = template.height * 2
  const baseName = buildFileName(template.name, '2x')

  function handlePng() {
    const stage = stageRef.current
    if (!stage) return
    exportToPng(stage, `${baseName}.png`, { pixelRatio: exportPixelRatio })
  }

  function handlePngTransparent() {
    const stage = stageRef.current
    if (!stage) return
    exportToPng(stage, `${buildFileName(template.name, 'transparent-2x')}.png`, {
      pixelRatio: exportPixelRatio,
      transparent: true,
    })
  }

  function handleJpeg() {
    const stage = stageRef.current
    if (!stage) return
    exportToJpeg(stage, `${baseName}.jpg`, { pixelRatio: exportPixelRatio, quality: 0.92 })
  }

  const btnBase: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
    padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
    fontFamily: 'inherit', transition: 'all 0.15s',
  }
  function btnEnter(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = 'var(--bg-hover)'
    e.currentTarget.style.borderColor = 'var(--border-active)'
    e.currentTarget.style.color = 'var(--text-primary)'
  }
  function btnLeave(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = 'var(--bg-surface)'
    e.currentTarget.style.borderColor = 'var(--border)'
    e.currentTarget.style.color = 'var(--text-secondary)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', borderTop: '1px solid var(--border)' }}>
      <div>
        <h3 style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
          Exportar
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          {exportW} × {exportH} px · 2×
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* PNG */}
        <button onClick={handlePng} style={btnBase} onMouseEnter={btnEnter} onMouseLeave={btnLeave}>
          <PngIcon />
          PNG 2×
        </button>

        {/* PNG Transparente */}
        <button onClick={handlePngTransparent} style={btnBase} onMouseEnter={btnEnter} onMouseLeave={btnLeave}>
          <PngTransparentIcon />
          PNG Transparente
        </button>

        {/* JPEG */}
        <button onClick={handleJpeg} style={btnBase} onMouseEnter={btnEnter} onMouseLeave={btnLeave}>
          <JpegIcon />
          JPEG 2×
        </button>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
        PNG preserva transparência. JPEG é menor em tamanho de arquivo.
      </p>
    </div>
  )
}

// ─── Ícones inline (SVG minimalistas) ────────────────────────────────────────

function PngIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="#6D6D6E" strokeWidth="1.2" />
      <path d="M4 9.5V5h2a1.5 1.5 0 0 1 0 3H4" stroke="#6D6D6E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 5v4.5" stroke="#6D6D6E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function PngTransparentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="#6D6D6E" strokeWidth="1.2" strokeDasharray="2 1.5" />
      <path d="M4 9.5V5h2a1.5 1.5 0 0 1 0 3H4" stroke="#6D6D6E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function JpegIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="#6D6D6E" strokeWidth="1.2" />
      <path d="M7 5v3.5a1.5 1.5 0 0 1-3 0" stroke="#6D6D6E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9.5 9.5V5l-1.5 2.5 1.5 2" stroke="#6D6D6E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
