import { create } from 'zustand'

export interface Template {
  id: string
  name: string
  category?: string
  width: number
  height: number
  background?: string
  /** Data URL da imagem de fundo enviada pelo usuário (opcional). */
  backgroundImage?: string
  /** Zoom da imagem de fundo em % (50–150). Default: 100. */
  backgroundZoom?: number
  /** Alinhamento vertical da imagem de fundo. Default: 'center'. */
  backgroundAlign?: 'top' | 'center' | 'bottom'
  /** Offset horizontal da imagem de fundo em px (canvas display). Default: 0. */
  backgroundOffsetX?: number
  /** Offset vertical da imagem de fundo em px (canvas display). Default: 0. */
  backgroundOffsetY?: number
  /** Prompt usado para gerar a imagem de fundo via IA (para regeneração). */
  imagePrompt?: string
  /** Data URL do logotipo (PNG com transparência suportado). */
  logoImage?: string
  /** Largura do logotipo em px (coordenadas do template). Default: 120. */
  logoSize?: number
  /** Posição X do logotipo em coordenadas do template. */
  logoX?: number
  /** Posição Y do logotipo em coordenadas do template. */
  logoY?: number
  elements: CanvasElement[]
}

export interface CanvasElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  props: Record<string, unknown>
}

interface PulseStore {
  templates: Template[]
  activeTemplateId: string | null
  selectedElementId: string | null

  setActiveTemplate: (id: string) => void
  setSelectedElement: (id: string | null) => void
  addTemplate: (template: Template) => void
  updateElement: (templateId: string, elementId: string, props: Partial<CanvasElement>) => void
  syncElementStyle: (templateId: string, elementId: string, props: Partial<CanvasElement['props']>) => void
  setTemplateBackground: (templateId: string, url: string | null) => void
  setTemplateImageStyle: (templateId: string, zoom?: number, align?: 'top' | 'center' | 'bottom') => void
  setTemplateImageOffset: (templateId: string, offsetX: number, offsetY: number) => void
  setTemplateLogo: (templateId: string, url: string | null) => void
  setTemplateLogoStyle: (templateId: string, size: number) => void
  setTemplateLogoPosition: (templateId: string, x: number, y: number) => void
  setTemplateImagePrompt: (templateId: string, prompt: string) => void
}

export const useStore = create<PulseStore>((set) => ({
  templates: [],
  activeTemplateId: null,
  selectedElementId: null,

  setActiveTemplate: (id) => set({ activeTemplateId: id, selectedElementId: null }),
  setSelectedElement: (id) => set({ selectedElementId: id }),
  addTemplate: (template) =>
    set((state) => {
      const idx = state.templates.findIndex((t) => t.id === template.id)
      if (idx >= 0) {
        const prev = state.templates[idx]
        const updated = {
          ...template,
          // backgroundImage não é preservado: ao trocar de template/formato a imagem anterior é limpa
          logoImage: prev.logoImage,
          logoSize:  prev.logoSize,
          logoX:     prev.logoX,
          logoY:     prev.logoY,
        }
        const next = [...state.templates]
        next[idx] = updated
        return { templates: next }
      }
      return { templates: [...state.templates, template] }
    }),
  updateElement: (templateId, elementId, props) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id !== templateId
          ? t
          : {
              ...t,
              elements: t.elements.map((el) =>
                el.id !== elementId ? el : { ...el, ...props }
              ),
            }
      ),
    })),
  syncElementStyle: (templateId, elementId, props) =>
    set((state) => {
      const lastHyphen = templateId.lastIndexOf('-')
      const prefix = lastHyphen >= 0 ? templateId.substring(0, lastHyphen) : templateId

      const activeEl = state.templates
        .find((t) => t.id === templateId)
        ?.elements.find((el) => el.id === elementId)
      const currentFontSize = (activeEl?.props.fontSize as number) ?? 1

      return {
        templates: state.templates.map((t) => {
          if (t.id === templateId) {
            return {
              ...t,
              elements: t.elements.map((el) =>
                el.id !== elementId ? el : { ...el, props: { ...el.props, ...props } }
              ),
            }
          }

          if (!t.id.startsWith(prefix)) return t

          return {
            ...t,
            elements: t.elements.map((el) => {
              if (el.id !== elementId) return el
              const updatedProps: Record<string, unknown> = {}
              if (props.fontFamily !== undefined) updatedProps.fontFamily = props.fontFamily
              if (props.fill !== undefined) updatedProps.fill = props.fill
              if (props.fontSize !== undefined) {
                const ratio = (props.fontSize as number) / currentFontSize
                const siblingFontSize = (el.props.fontSize as number) ?? currentFontSize
                updatedProps.fontSize = Math.round(siblingFontSize * ratio)
              }
              return { ...el, props: { ...el.props, ...updatedProps } }
            }),
          }
        }),
      }
    }),
  setTemplateBackground: (templateId, url) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id !== templateId
          ? t
          : { ...t, backgroundImage: url ?? undefined, backgroundOffsetX: 0, backgroundOffsetY: 0 }
      ),
    })),
  setTemplateImageStyle: (templateId, zoom, align) =>
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t
        return {
          ...t,
          ...(zoom  !== undefined && { backgroundZoom:  zoom  }),
          ...(align !== undefined && { backgroundAlign: align }),
        }
      }),
    })),
  setTemplateImageOffset: (templateId, offsetX, offsetY) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id !== templateId ? t : { ...t, backgroundOffsetX: offsetX, backgroundOffsetY: offsetY }
      ),
    })),
  setTemplateLogo: (templateId, url) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id !== templateId
          ? t
          : { ...t, logoImage: url ?? undefined, logoX: undefined, logoY: undefined }
      ),
    })),
  setTemplateLogoStyle: (templateId, size) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id !== templateId ? t : { ...t, logoSize: size }
      ),
    })),
  setTemplateLogoPosition: (templateId, x, y) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id !== templateId ? t : { ...t, logoX: x, logoY: y }
      ),
    })),
  setTemplateImagePrompt: (templateId, prompt) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id !== templateId ? t : { ...t, imagePrompt: prompt }
      ),
    })),
}))
