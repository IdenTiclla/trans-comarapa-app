export const COMPANY = {
  name: 'Trans Comarapa',
  legalName:
    'SINDICATO MIXTO DE TRANSPORTISTAS DE LARGA Y CORTA DISTANCIA "MANUEL MARIA CABALLERO"',
  slogan: 'Conectando el corazón de Bolivia con seguridad y confianza',
  domain: 'transcomarapa.com',
  heroImages: [
    '/images/buses_challa.jpeg',
    '/images/flota_blanca_rene.png',
    '/images/doble_piso_verde.png',
    '/images/flota roja.jpeg',
  ],
  stats: { locations: 23, years: 10, offices: 4 },
} as const

export const ROUTE_BANNER =
  'MAIRANA · YERBA BUENA · AGUA CLARA · LOS NEGROS · MATARAL · QUINE · PALIZADA · SAN ISIDRO · COMARAPA' as const

export const SCHEDULES = {
  santa_cruz_to_comarapa:
    'HORARIOS STZ - COMARAPA: L-J 10:30, 14:00, 18:30, 20:30 | V-S-D +22:00',
  comarapa_to_santa_cruz:
    'HORARIOS COMARAPA - STZ: L-S 08:00, 14:00, 20:30, 23:30 | DOM 08:30, 12:00, 14:00, 20:30, 23:30',
} as const

export const LEGAL_RESOLUTION = 'Resolución Suprema 17996' as const

export const OFFICES = {
  santa_cruz: {
    name: 'Santa Cruz',
    phone: '78175576',
    phoneFormatted: '781-75576',
    address: 'Av. Doble Vía La Guardia 4to. Anillo',
    addressShort: 'Doble Vía La Guardia 4to anillo',
  },
  comarapa: {
    name: 'Comarapa',
    phone: '78175578',
    phoneFormatted: '781-75578',
    address: 'Av. Comarapa (Mercado Campesino)',
    addressShort: 'Av. Comarapa (Mercado Campesino)',
  },
  san_isidro: {
    name: 'San Isidro',
    phone: '78515650',
    phoneFormatted: '785-15650',
    address: 'Av. San Isidro',
    addressShort: 'Av. San Isidro',
  },
  los_negros: {
    name: 'Los Negros',
    phone: '69029690',
    phoneFormatted: '690-29690',
    address: 'Av. Los Negros',
    addressShort: 'Av. Los Negros',
  },
} as const
