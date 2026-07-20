import saude from './saude.js'
import imoveis from './imoveis.js'
import alimentacao from './alimentacao.js'

/**
 * Mapa de nichos disponíveis, por chave interna.
 * Adicione um novo nicho criando /api/niches/<nome>.js (exportando um
 * NichePersonality) e registrando-o aqui + no matcher abaixo.
 */
export const niches = {
  saude,
  imoveis,
  alimentacao,
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

  return null
}
