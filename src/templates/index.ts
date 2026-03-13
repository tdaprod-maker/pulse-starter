import { makeHeroTitleVariants }     from './hero-title/variants'
import { makeBigStatementVariants }  from './big-statement/variants'
import { makeEditorialCardVariants } from './editorial-card/variants'
import { makeMinimalTypeVariants }   from './minimal-type/variants'
import { makeBigNumberVariants }     from './big-number/variants'
import { makeFoodPromoVariants }     from './food-promo/variants'
import type { Template } from '../state/useStore'
import type { Theme } from '../themes'

export interface TemplateDefinition {
  id: string
  name: string
  category: string
  /** Retorna as variantes do template aplicando as cores e fontes do tema ativo. */
  getVariants: (theme: Theme) => Template[]
}

export const templateRegistry: TemplateDefinition[] = [
  {
    id: 'hero-title',
    name: 'Hero Title',
    category: 'instagram-post',
    getVariants: makeHeroTitleVariants,
  },
  {
    id: 'big-statement',
    name: 'Big Statement',
    category: 'instagram-post',
    getVariants: makeBigStatementVariants,
  },
  {
    id: 'editorial-card',
    name: 'Editorial Card',
    category: 'instagram-post',
    getVariants: makeEditorialCardVariants,
  },
  {
    id: 'minimal-type',
    name: 'Minimal Type',
    category: 'instagram-post',
    getVariants: makeMinimalTypeVariants,
  },
  {
    id: 'big-number',
    name: 'Big Number',
    category: 'instagram-post',
    getVariants: makeBigNumberVariants,
  },
  {
    id: 'food-promo',
    name: 'Food Promo',
    category: 'instagram-post',
    getVariants: makeFoodPromoVariants,
  },
]

/** Todas as variantes achatadas, resolvidas com o tema fornecido. */
export function getAllTemplates(theme: Theme): Template[] {
  return templateRegistry.flatMap((def) => def.getVariants(theme))
}

/** Variante padrão (1:1) de cada template, resolvida com o tema fornecido. */
export function getDefaultVariants(theme: Theme): Template[] {
  return templateRegistry.map((def) => def.getVariants(theme)[0])
}
