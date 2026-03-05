import type { RefObject } from 'react'
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

  return (
    <div className="flex flex-col p-4 gap-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          Exportar
        </h3>
        <p className="text-xs text-gray-600">
          {exportW} × {exportH} px · 2×
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* PNG */}
        <button
          onClick={handlePng}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-[#3A5AFF] transition text-sm text-white font-medium"
        >
          <PngIcon />
          PNG 2×
        </button>

        {/* PNG Transparente */}
        <button
          onClick={handlePngTransparent}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-[#3A5AFF] transition text-sm text-white font-medium"
        >
          <PngTransparentIcon />
          PNG Transparente
        </button>

        {/* JPEG */}
        <button
          onClick={handleJpeg}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-[#3A5AFF] transition text-sm text-white font-medium"
        >
          <JpegIcon />
          JPEG 2×
        </button>
      </div>

      <div className="mt-auto">
        <p className="text-xs text-gray-600 leading-relaxed">
          PNG preserva transparência. JPEG é menor em tamanho de arquivo.
        </p>
      </div>
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
