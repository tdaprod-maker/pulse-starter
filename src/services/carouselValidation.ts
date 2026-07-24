import type { CarouselSlide, PremiumSlide } from './gemini'

const VALID_SLIDE_TYPES = new Set(['cover', 'content', 'cta'])

/**
 * Aceita array já parseado, uma string JSON (Supabase, sessionStorage, URL
 * params costumam guardar arrays serializados), ou qualquer outra coisa.
 * Nunca lança — string malformada ou valor que não é array vira [].
 */
function toArray(data: unknown): unknown[] {
  let parsed: unknown = data
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }
  return Array.isArray(parsed) ? parsed : []
}

/**
 * Ponto único de entrada para dados de carrossel (API, sessionStorage,
 * localStorage, restore via URL, registros do Supabase). Garante um
 * CarouselSlide[] válido sempre — nunca lança, nunca retorna algo que não
 * seja array. Itens que não são objetos são descartados; campos ausentes ou
 * com tipo errado recebem um valor padrão seguro em vez de quebrar o
 * consumidor. Propriedades extras (ex: imageUrl) são preservadas.
 */
export function validateSlides<T extends CarouselSlide = CarouselSlide>(data: unknown): T[] {
  return toArray(data)
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      ...item,
      title: typeof item.title === 'string' ? item.title : '',
      imagePrompt: typeof item.imagePrompt === 'string' ? item.imagePrompt : '',
      type: VALID_SLIDE_TYPES.has(item.type as string) ? (item.type as CarouselSlide['type']) : 'content',
      body: typeof item.body === 'string' ? item.body : undefined,
      texts: item.texts && typeof item.texts === 'object' && !Array.isArray(item.texts)
        ? (item.texts as Record<string, string>)
        : undefined,
    })) as T[]
}

/**
 * Mesma garantia do validateSlides, para o formato de slide premium
 * (uma imagem única por slide, sem título/prompt) usado nos fluxos de
 * geração premium (GPT Image 2).
 */
export function validatePremiumSlides<T extends PremiumSlide = PremiumSlide>(data: unknown): T[] {
  return toArray(data)
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      ...item,
      image: typeof item.image === 'string' ? item.image : '',
      label: typeof item.label === 'string' ? item.label : '',
    })) as T[]
}

/** Guard genérico para arrays de valores simples (ex: URLs de imagem). */
export function parseJsonArray<T>(raw: unknown): T[] {
  return toArray(raw) as T[]
}
