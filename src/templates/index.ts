import { makeHeroTitleVariants }      from './hero-title/variants'
import { makeBigStatementVariants }   from './big-statement/variants'
import { makeEditorialCardVariants }  from './editorial-card/variants'
import { makeBigNumberVariants }      from './big-number/variants'
import { makeFoodPromoVariants }      from './food-promo/variants'
import { makeFoodEditorialVariants }  from './food-editorial/variants'
import { makeTechNewsVariants }       from './tech-news/variants'
import { makeTechStatementVariants }  from './tech-statement/variants'
import { makeTechProductVariants }    from './tech-product/variants'
import { makeHealthContentVariants }    from './health-content/variants'
import { makeHealthStatsVariants }       from './health-stats/variants'
import { makeBusinessStatementVariants } from './business-statement/variants'
import { makeBusinessCardVariants }      from './business-card/variants'
import { makeSportBrandVariants }    from './sport-brand/variants'
import { makeSportArenaVariants }        from './sport-arena/variants'
import { makeTechMinimalVariants }    from './tech-minimal/variants'
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
    id: 'sport-arena',
    name: 'Sport Arena',
    category: 'instagram-post',
    getVariants: makeSportArenaVariants,
  },
  {
    id: 'sport-brand',
    name: 'Sport Brand',
    category: 'instagram-post',
    getVariants: makeSportBrandVariants,
  },
  {
    id: 'business-statement',
    name: 'Business Statement',
    category: 'instagram-post',
    getVariants: makeBusinessStatementVariants,
  },
  {
    id: 'health-content',
    name: 'Health Content',
    category: 'instagram-post',
    getVariants: makeHealthContentVariants,
  },
  {
    id: 'health-stats',
    name: 'Health Stats',
    category: 'instagram-post',
    getVariants: makeHealthStatsVariants,
  },
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'instagram-post',
    getVariants: makeBusinessCardVariants,
  },
  {
    id: 'tech-statement',
    name: 'Frase de Impacto',
    category: 'instagram-post',
    getVariants: makeTechStatementVariants,
  },
  {
    id: 'tech-news',
    name: 'Destaque de Notícia',
    category: 'instagram-post',
    getVariants: makeTechNewsVariants,
  },
  {
    id: 'tech-product',
    name: 'Apresentação',
    category: 'instagram-post',
    getVariants: makeTechProductVariants,
  },
  {
    id: 'tech-minimal',
    name: 'Minimalista',
    category: 'instagram-post',
    getVariants: makeTechMinimalVariants,
  },
  {
    id: 'food-editorial',
    name: 'Food Editorial',
    category: 'instagram-post',
    getVariants: makeFoodEditorialVariants,
  },
  {
    id: 'food-promo',
    name: 'Food Promo',
    category: 'instagram-post',
    getVariants: makeFoodPromoVariants,
  },
  {
    id: 'hero-title',
    name: 'Título Principal',
    category: 'instagram-post',
    getVariants: makeHeroTitleVariants,
  },
  {
    id: 'big-statement',
    name: 'Grande Declaração',
    category: 'instagram-post',
    getVariants: makeBigStatementVariants,
  },
  {
    id: 'editorial-card',
    name: 'Card Editorial',
    category: 'instagram-post',
    getVariants: makeEditorialCardVariants,
  },
  {
    id: 'big-number',
    name: 'Número em Destaque',
    category: 'instagram-post',
    getVariants: makeBigNumberVariants,
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
