import saude from './saude.js'
import imoveis from './imoveis.js'
import alimentacao from './alimentacao.js'
import beleza from './beleza.js'
import fitness from './fitness.js'
import educacao from './educacao.js'
import moda from './moda.js'

/**
 * Mapa de nichos disponíveis, por chave interna.
 * Adicione um novo nicho criando /niches/<nome>.js (exportando um
 * NichePersonality) e registrando-o aqui + no matcher abaixo.
 */
export const niches = {
  saude,
  imoveis,
  alimentacao,
  beleza,
  fitness,
  educacao,
  moda,
}

/**
 * Detecta o nicho a partir do texto livre de brand.segment e retorna o
 * NichePersonality correspondente, ou null se nenhum nicho for reconhecido.
 * @param {string | undefined | null} segment
 * @returns {import('./saude.js').NichePersonality | null}
 */
export function getNichePersonality(segment) {
  const t = (segment || '').toLowerCase()

  if (/health|sa[uú]de|cl[ií]nic|medic|farm[aá]c|hospital|dentist|odont|paciente/.test(t)) {
    return niches.saude
  }
  if (/im[óo]v|constru|realty|real estate|arquitet|imobili[aá]ri/.test(t)) {
    return niches.imoveis
  }
  if (/food|restaurant|gastronom|comida|culin[aá]ria|card[aá]pio|delivery|chef|bebida/.test(t)) {
    return niches.alimentacao
  }
  if (/beleza|est[ée]tica|sal[aã]o|cabelei?r|barbearia|manicur|maquiag|cosm[eé]tic|spa/.test(t)) {
    return niches.beleza
  }
  if (/fitness|academia|treino|personal trainer|crossfit|muscula[çc][aã]o|pilates|funcional/.test(t)) {
    return niches.fitness
  }
  if (/educa[çc][aã]o|curso|escola|faculdade|universidade|ensino|aula|professor|estudante/.test(t)) {
    return niches.educacao
  }
  if (/moda|fashion|roupa|vestu[aá]rio|boutique|estilista|cole[çc][aã]o|look/.test(t)) {
    return niches.moda
  }

  return null
}
