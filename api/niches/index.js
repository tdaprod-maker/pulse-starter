import saude from './saude.js'

/**
 * Mapa de nichos disponíveis, por chave interna.
 * Adicione um novo nicho criando /api/niches/<nome>.js (exportando um
 * NichePersonality) e registrando-o aqui + no matcher abaixo.
 */
export const niches = {
  saude,
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

  return null
}
