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
  gatilhos: [
    'sua saúde é o maior patrimônio que você tem',
    'cuide de quem você ama antes que seja tarde',
    'prevenção custa menos que tratamento',
    'você merece se sentir bem todos os dias',
    'a confiança começa com um sorriso saudável',
  ],
  ctas: [
    'Agende sua avaliação gratuita',
    'Fale com nossa equipe agora',
    'Reserve seu horário hoje',
    'Clique e agende sua consulta',
    'Primeiras vagas do mês disponíveis',
  ],
  formatos: [
    'antes e depois com resultado real do paciente (com autorização)',
    'dica rápida de saúde em 3 passos',
    'mito vs verdade sobre saúde',
    'depoimento de paciente satisfeito',
    'apresentação da equipe e especialidades',
    'informação educativa sobre sintoma comum',
  ],
  alertas: [
    'nunca prometer cura ou resultado garantido — regulação CFM/CFO/CRN',
    'não usar fotos de pacientes sem autorização por escrito',
    'evitar linguagem de urgência excessiva que pareça manipulação',
    'não fazer comparações diretas com outros profissionais',
    'evitar termos técnicos sem explicação — público é leigo',
  ],
  estiloVisual: 'clean clinical aesthetic, soft natural light, warm and welcoming healthcare photography, pastel tones with accent color, professional but human, avoid cold sterile hospital imagery',
  copyTone: 'acolhedor, empático e profissional. Fala diretamente com o paciente, não com médicos. Usa linguagem simples. Transmite confiança sem ser arrogante. Equilibra autoridade técnica com calor humano.',
}

export default NichePersonality
