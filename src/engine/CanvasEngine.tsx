import { forwardRef, useState, useLayoutEffect, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import type { CanvasElement, Template } from '../state/useStore'
import { useStore } from '../state/useStore'

interface CanvasEngineProps {
  template: Template
  scale?: number
  onSelectElement?: (id: string | null) => void
  selectedElementId?: string | null
  /** ID do elemento cujo texto está sendo editado — oculta o nó Konva */
  editingElementId?: string | null
  /** Chamado no double-click de um Text para iniciar a edição inline */
  onEditStart?: (el: CanvasElement) => void
}

export const PREVIEW_MAX = 600

/** Calcula o fator de escala para caber no preview sem distorcer. */
export function calcAutoScale(template: Template): number {
  return Math.min(PREVIEW_MAX / template.width, PREVIEW_MAX / template.height)
}

export const CanvasEngine = forwardRef<Konva.Stage, CanvasEngineProps>(
  function CanvasEngine(
    { template, scale, onSelectElement, selectedElementId, editingElementId, onEditStart },
    ref
  ) {
    const autoScale = scale ?? calcAutoScale(template)

    const { setTemplateImageStyle, setTemplateImageOffset, setTemplateLogoPosition } = useStore()

    // ── Logo image preload ────────────────────────────────────────────────────
    const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)
    useEffect(() => {
      if (!template.logoImage) { setLogoImg(null); return }
      const img = new window.Image()
      img.onload = () => setLogoImg(img)
      img.src = template.logoImage
    }, [template.logoImage])

    // ── Drag state (background image pan) ────────────────────────────────────
    const [dragging, setDragging] = useState(false)
    const dragActiveRef   = useRef(false)
    const currentOffsetRef = useRef({ x: 0, y: 0 })

    // ── Layout dinâmico ───────────────────────────────────────────────────────
    const layerRef = useRef<Konva.Layer>(null)
    const [overrideY, setOverrideY] = useState<Record<string, number>>({})

    useLayoutEffect(() => {
      const layer = layerRef.current
      if (!layer) return

      const updates: Record<string, number> = {}

      for (const el of template.elements) {
        const afterId = el.props.layoutAfter as string | undefined
        if (!afterId) continue

        const refNode = layer.findOne<Konva.Text>(`#${afterId}`)
        const refEl   = template.elements.find((e) => e.id === afterId)
        if (!refNode || !refEl) continue

        const gap  = (el.props.layoutGap as number) ?? 0
        // refNode.height() retorna 0 quando height não é passado explicitamente ao <Text>
        // (herda height:0 do Shape base). getClientRect mede o bounding box real do texto.
        const rect = refNode.getClientRect({ relativeTo: layer, skipStroke: true })
        updates[el.id] = rect.y + rect.height + gap
      }

      setOverrideY((prev) => {
        const hasChange =
          Object.keys(updates).length !== Object.keys(prev).length ||
          Object.entries(updates).some(([id, y]) => prev[id] !== y)
        return hasChange ? updates : prev
      })
    }, [template])

    const w = template.width  * autoScale
    const h = template.height * autoScale

    const bgOffsetX = template.backgroundOffsetX ?? 0
    const bgOffsetY = template.backgroundOffsetY ?? 0
    const bgZoom    = template.backgroundZoom ?? 100

    // ── Logo positioning ──────────────────────────────────────────────────────
    const logoSize   = template.logoSize ?? 120
    const logoAspect = logoImg ? logoImg.height / logoImg.width : 1
    const logoH      = logoSize * logoAspect
    const logoX      = template.logoX ?? (template.width  - logoSize - 16)
    const logoY      = template.logoY ?? (template.height - logoH    - 16)

    return (
      // Wrapper posicionado: <img> HTML atrás do canvas Konva.
      // Isso elimina CORS/tainted-canvas — o <img> carrega a URL diretamente
      // sem passar pelo pipeline de pixels do canvas.
      <div style={{
        position: 'relative',
        width: w,
        height: h,
        overflow: 'hidden',
        cursor: template.backgroundImage ? (dragging ? 'grabbing' : 'grab') : 'default',
      }}>

        {/* Fundo sólido via CSS — sempre visível, inclusive enquanto a imagem carrega */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: template.background ?? '#ffffff',
          }}
        />

        {/* Imagem de fundo em HTML puro: object-fit cover + overlay escuro */}
        {template.backgroundImage && (
          <>
            <img
              src={template.backgroundImage}
              draggable={false}
              style={{
                position:        'absolute',
                inset:           0,
                width:           '100%',
                height:          '100%',
                objectFit:       'cover',
                objectPosition:  `center ${template.backgroundAlign ?? 'center'}`,
                transform:       `translate(${bgOffsetX}px, ${bgOffsetY}px) scale(${bgZoom / 100})`,
                transformOrigin: 'center center',
                display:         'block',
                userSelect:      'none',
                pointerEvents:   'none',
              }}
            />
            <div
              style={{
                position:   'absolute',
                inset:      0,
                background: template.id.startsWith('editorial-card')
                  ? 'rgba(0,0,0,0.6)'
                  : template.id.startsWith('hero-title')
                    ? 'rgba(0,0,0,0.65)'
                    : template.id.startsWith('food-promo')
                      ? 'rgba(0,0,0,0.35)'
                      : 'rgba(0,0,0,0.5)',
              }}
            />
          </>
        )}

        {/* Stage Konva — canvas transparente; texto/shapes renderizam por cima da imagem */}
        <Stage
          ref={ref}
          width={w}
          height={h}
          scaleX={autoScale}
          scaleY={autoScale}
          style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'transparent' }}
          onClick={(e) => {
            if (e.target === e.target.getStage()) onSelectElement?.(null)
          }}
          onWheel={(e) => {
            if (!template.backgroundImage) return
            e.evt.preventDefault()
            const direction = e.evt.deltaY < 0 ? 1 : -1
            const newZoom = Math.max(50, Math.min(200, bgZoom + direction * 5))
            setTemplateImageStyle(template.id, newZoom, undefined)
          }}
          onMouseDown={(e) => {
            if (!template.backgroundImage) return
            if (e.target !== e.target.getStage()) return
            dragActiveRef.current = true
            currentOffsetRef.current = { x: bgOffsetX, y: bgOffsetY }
            setDragging(true)
          }}
          onMouseMove={(e) => {
            if (!dragActiveRef.current) return
            currentOffsetRef.current.x += e.evt.movementX
            currentOffsetRef.current.y += e.evt.movementY
            setTemplateImageOffset(
              template.id,
              currentOffsetRef.current.x,
              currentOffsetRef.current.y,
            )
          }}
          onMouseUp={() => {
            dragActiveRef.current = false
            setDragging(false)
          }}
          onMouseLeave={() => {
            dragActiveRef.current = false
            setDragging(false)
          }}
        >
          <Layer ref={layerRef}>
            {/* bg-rect apenas quando não há imagem de fundo — preenche o canvas com a cor sólida */}
            {!template.backgroundImage && (
              <Rect
                name="bg-rect"
                x={0}
                y={0}
                width={template.width}
                height={template.height}
                fill={template.background ?? '#ffffff'}
              />
            )}

            {template.elements.map((el) => {
              // bg-color é o fundo sólido do food-promo: ocultado quando há imagem de fundo
              // para não bloquear a foto do produto
              if (el.id === 'bg-color' && template.backgroundImage) return null
              return renderElement(el, {
                selectedId:   selectedElementId,
                editingId:    editingElementId,
                onSelect:     onSelectElement,
                onEditStart,
                overrideY,
                templateId:   template.id,
                backgroundImage: template.backgroundImage,
              })
            })}

            {/* Logotipo — renderizado no Konva para ser incluído no export */}
            {logoImg && (
              <KonvaImage
                name="logo"
                image={logoImg}
                x={logoX}
                y={logoY}
                width={logoSize}
                height={logoH}
                draggable
                onDragEnd={(e) => {
                  setTemplateLogoPosition(template.id, e.target.x(), e.target.y())
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>
    )
  }
)

// ─── Font auto-fit ────────────────────────────────────────────────────────────

/**
 * Reduz o fontSize até o texto caber em maxWidth, com mínimo de minFontSize.
 *
 * - wrap === 'none': o texto inteiro deve caber em uma única linha.
 * - wrap === 'word' (default): cada palavra individual deve caber — Konva
 *   quebra o restante automaticamente, então só tokens únicos podem transbordar.
 */
function calcFitFontSize(
  text: string,
  fontFamily: string,
  fontStyle: string,
  fontSize: number,
  maxWidth: number,
  minFontSize = 80,
  wrap = 'word',
): number {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const weight = fontStyle === 'bold' ? 'bold ' : ''
  const family = fontFamily.split(',')[0].trim()
  const tokens = wrap === 'none'
    ? [text]
    : text.split(/\s+|\n+/).filter(Boolean)
  let size = fontSize
  while (size > minFontSize) {
    ctx.font = `${weight}${size}px ${family}`
    const widest = Math.max(...tokens.map(t => ctx.measureText(t).width))
    if (widest <= maxWidth) break
    size -= 2
  }
  return size
}

// ─── Render de elementos individuais ──────────────────────────────────────────

interface RenderOptions {
  selectedId?:     string | null
  editingId?:      string | null
  onSelect?:       (id: string | null) => void
  onEditStart?:    (el: CanvasElement) => void
  overrideY?:      Record<string, number>
  templateId?:     string
  backgroundImage?: string
}

function renderElement(el: CanvasElement, opts: RenderOptions) {
  const { selectedId, editingId, onSelect, onEditStart, overrideY, templateId, backgroundImage } = opts
  const isSelected = el.id === selectedId
  const isEditing  = el.id === editingId
  const selectionStroke = isSelected && !isEditing ? '#3A5AFF' : undefined

  const y = overrideY?.[el.id] ?? el.y

  if (el.type === 'text') {
    const rawFontSize = (el.props.fontSize as number) ?? 24
    const wrap = (el.props.wrap as string) ?? 'word'
    const fontSize = el.props.autoFit
      ? calcFitFontSize(
          (el.props.text as string) ?? '',
          (el.props.fontFamily as string) ?? 'Inter',
          (el.props.fontStyle as string) ?? 'normal',
          rawFontSize,
          el.width,
          80,
          wrap,
        )
      : rawFontSize

    // Editorial Card com imagem de fundo: título e corpo ficam brancos para legibilidade;
    // o label mantém a cor definida (cor de destaque definida pela IA).
    const isEditorialWithBg =
      templateId?.startsWith('editorial-card') && !!backgroundImage
    // Hero Title com imagem de fundo: subtítulo passa a branco (título já é branco).
    const isHeroWithBg =
      templateId?.startsWith('hero-title') && !!backgroundImage
    const fill =
      (isEditorialWithBg && (el.id === 'title' || el.id === 'body')) ||
      (isHeroWithBg && el.id === 'subtitle')
        ? '#FFFFFF'
        : (el.props.fill as string) ?? '#000000'

    return (
      <Text
        key={el.id}
        id={el.id}
        x={el.x}
        y={y}
        width={el.width || undefined}
        text={(el.props.text as string) ?? 'Texto'}
        fontSize={fontSize}
        fontFamily={(el.props.fontFamily as string) ?? 'Inter, sans-serif'}
        fontStyle={(el.props.fontStyle as string) ?? 'normal'}
        lineHeight={(el.props.lineHeight as number) ?? 1.2}
        letterSpacing={(el.props.letterSpacing as number) ?? 0}
        align={(el.props.align as 'left' | 'center' | 'right') ?? 'left'}
        wrap={(el.props.wrap as 'word' | 'char' | 'none') ?? 'word'}
        fill={fill}
        opacity={isEditing ? 0 : 1}
        draggable={!isEditing}
        onClick={() => onSelect?.(el.id)}
        onDblClick={() => onEditStart?.(el)}
        stroke={selectionStroke}
        strokeWidth={isSelected && !isEditing ? 0.5 : 0}
      />
    )
  }

  if (el.type === 'shape') {
    return (
      <Rect
        key={el.id}
        id={el.id}
        x={el.x}
        y={y}
        width={el.width}
        height={el.height}
        fill={(el.props.fill as string) ?? '#e5e7eb'}
        cornerRadius={(el.props.cornerRadius as number) ?? 0}
        draggable
        onClick={() => onSelect?.(el.id)}
        stroke={selectionStroke}
        strokeWidth={isSelected ? 2 : 0}
      />
    )
  }

  return null
}
