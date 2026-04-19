import { Users, Ticket, MapPin, Package } from 'lucide-react'
import { createElement } from 'react'
import type { Category } from './types'

export const CATEGORIES: Category[] = [
  {
    id: 'client',
    label: 'Cliente',
    plural: 'Clientes',
    description: 'Buscar por nombre o CI',
    icon: createElement(Users, { className: 'h-5 w-5' }),
    placeholder: 'Nombre o CI...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'ticket',
    label: 'Boleto',
    plural: 'Boletos',
    description: 'Buscar por numero o cliente',
    icon: createElement(Ticket, { className: 'h-5 w-5' }),
    placeholder: 'Numero de boleto o cliente...',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'trip',
    label: 'Viaje',
    plural: 'Viajes',
    description: 'Buscar por origen o destino',
    icon: createElement(MapPin, { className: 'h-5 w-5' }),
    placeholder: 'Origen o destino...',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'package',
    label: 'Paquete',
    plural: 'Paquetes',
    description: 'Buscar por tracking o destinatario',
    icon: createElement(Package, { className: 'h-5 w-5' }),
    placeholder: 'Tracking o destinatario...',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
]

export const getCategory = (id: Category['id']) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
