/**
 * @typedef {Object} NichePersonality
 * @property {string[]} gatilhos - Gatilhos emocionais do nicho
 * @property {string[]} ctas - CTAs que convertem nesse nicho
 * @property {string[]} formatos - Formatos de post que performam
 * @property {string[]} alertas - Coisas a evitar nesse nicho
 * @property {string} estiloVisual - Direção fotográfica para o GPT Image 2
 * @property {string} copyTone - Tom de escrita específico do nicho
 */

/** @type {NichePersonality} */
export const NichePersonality = {
  gatilhos: [],
  ctas: [],
  formatos: [],
  alertas: [],
  estiloVisual: '',
  copyTone: '',
}

export default NichePersonality
