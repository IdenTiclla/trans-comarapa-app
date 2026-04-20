import { Button } from '@/components/ui/button'
import { Route as RouteIcon, X } from 'lucide-react'

interface Props {
  isEditing: boolean
  onCancel: () => void
}

export function RouteFormHeader({ isEditing, onCancel }: Props) {
  return (
    <div className="px-6 py-5 bg-gradient-to-br from-gray-900 via-gray-800 to-navy-900 border-b border-white/10 text-white shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <RouteIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isEditing ? 'Editar Ruta' : 'Nueva Ruta'}
            </h3>
            <p className="text-gray-400 text-xs font-medium">Configura el itinerario y precios</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          aria-label="Cerrar formulario"
          className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
