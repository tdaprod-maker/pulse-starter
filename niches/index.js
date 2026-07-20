import saude from './saude.js'
import imoveis from './imoveis.js'
import alimentacao from './alimentacao.js'
import beleza from './beleza.js'
import fitness from './fitness.js'
import educacao from './educacao.js'
import moda from './moda.js'
import advocacia from './advocacia.js'
import construcao from './construcao.js'
import pets from './pets.js'
import financeiro from './financeiro.js'
import turismo from './turismo.js'
import gastronomia from './gastronomia.js'
import tecnologia from './tecnologia.js'
import negocios from './negocios.js'
import direito from './direito.js'
import arquitetura from './arquitetura.js'
import odontologia from './odontologia.js'
import esportes from './esportes.js'

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
  advocacia,
  construcao,
  pets,
  financeiro,
  turismo,
  gastronomia,
  tecnologia,
  negocios,
  direito,
  arquitetura,
  odontologia,
  esportes,
}

/**
 * Detecta a chave do nicho (ex: "saude", "odontologia") a partir do texto
 * livre de brand.segment. Retorna "generico" se nenhum nicho for reconhecido.
 * @param {string | undefined | null} segment
 * @returns {string}
 */
export function getNicheKey(segment) {
  return matchNicheKey(segment) ?? 'generico'
}

/**
 * Detecta o nicho a partir do texto livre de brand.segment e retorna o
 * NichePersonality correspondente, ou null se nenhum nicho for reconhecido.
 * @param {string | undefined | null} segment
 * @returns {import('./saude.js').NichePersonality | null}
 */
export function getNichePersonality(segment) {
  const key = matchNicheKey(segment)
  return key ? niches[key] : null
}

function matchNicheKey(segment) {
  const t = (segment || '').toLowerCase()

  if (/odontolog|dentist|odont[óo]log|clareamento dental|implante dent[aá]rio|ortodontia|sa[uú]de bucal/.test(t)) {
    return 'odontologia'
  }
  if (/health|sa[uú]de|cl[ií]nic|medic|farm[aá]c|hospital|paciente/.test(t)) {
    return 'saude'
  }
  if (/constru[çc][aã]o|construtora|reforma|obra|engenharia civil|arquitetura de obra|empreiteira/.test(t)) {
    return 'construcao'
  }
  if (/arquitetura|arquiteto|design de interiores|projeto arquitet[oô]nico|paisagismo|decora[çc][aã]o de interiores/.test(t)) {
    return 'arquitetura'
  }
  if (/im[óo]v|constru|realty|real estate|imobili[aá]ri/.test(t)) {
    return 'imoveis'
  }
  if (/gastronomia|alta gastronomia|fine dining|menu degusta[çc][aã]o|degusta[çc][aã]o|culin[aá]ria autoral|haute cuisine/.test(t)) {
    return 'gastronomia'
  }
  if (/food|restaurant|gastronom|comida|culin[aá]ria|card[aá]pio|delivery|chef|bebida/.test(t)) {
    return 'alimentacao'
  }
  if (/beleza|est[ée]tica|sal[aã]o|cabelei?r|barbearia|manicur|maquiag|cosm[eé]tic|spa/.test(t)) {
    return 'beleza'
  }
  if (/fitness|academia|treino|personal trainer|crossfit|muscula[çc][aã]o|pilates|funcional/.test(t)) {
    return 'fitness'
  }
  if (/esporte|\btimes?\b|clube|futebol|beisebol|v[oô]lei|basquete|federa[çc][aã]o|liga|torcida/.test(t)) {
    return 'esportes'
  }
  if (/educa[çc][aã]o|curso|escola|faculdade|universidade|ensino|aula|professor|estudante/.test(t)) {
    return 'educacao'
  }
  if (/moda|fashion|roupa|vestu[aá]rio|boutique|estilista|cole[çc][aã]o|look/.test(t)) {
    return 'moda'
  }
  if (/direito empresarial|direito corporativo|compliance|contrato empresarial|legisla[çc][aã]o empresarial|assessoria jur[íi]dica empresarial/.test(t)) {
    return 'direito'
  }
  if (/advocacia|advogad|jur[íi]dic|direito|escrit[óo]rio de advocacia|oab/.test(t)) {
    return 'advocacia'
  }
  if (/pet|cachorro|gato|veterin[aá]ri|banho e tosa|petshop|animal de estima[çc][aã]o/.test(t)) {
    return 'pets'
  }
  if (/financeir|investimento|consultoria financeira|planejamento financeiro|corretora|previdência|banco/.test(t)) {
    return 'financeiro'
  }
  if (/turismo|viagem|viagens|agência de viagens|roteiro de viagem|pacote tur[íi]stico|destino tur[íi]stico/.test(t)) {
    return 'turismo'
  }
  if (/tecnologia|software|startup|digitaliza[çc][aã]o|automa[çc][aã]o|desenvolvimento de sistemas|transforma[çc][aã]o digital/.test(t)) {
    return 'tecnologia'
  }
  if (/neg[óo]cios|gest[aã]o empresarial|consultoria empresarial|lideran[çc]a|empreendedorismo|estrat[ée]gia empresarial/.test(t)) {
    return 'negocios'
  }

  return null
}
