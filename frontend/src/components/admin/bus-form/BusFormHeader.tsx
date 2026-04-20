import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, Bus as BusIcon, Info, Map as MapIcon } from 'lucide-react'

interface Props {
  isEditing: boolean
  currentStep: number
  canGoToStep2: boolean
  loading: boolean
  onCancel: () => void
  onGoStep1: () => void
  onGoStep2: () => void
}

export function BusFormHeader({
  isEditing, currentStep, canGoToStep2, loading, onCancel, onGoStep1, onGoStep2,
}: Props) {
  return (
    <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-gray-800 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <BusIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isEditing ? 'Editar Bus' : 'Nuevo Bus'}
            </h3>
            <p className="text-gray-400 text-xs font-medium">
              Paso {currentStep} de 2: {currentStep === 1 ? 'Datos Básicos' : 'Planilla de Asientos'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          aria-label="Cerrar formulario"
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <div className="flex items-center w-full max-w-xs justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2 z-0" />

          <Button
            type="button"
            variant="ghost"
            onClick={onGoStep1}
            disabled={loading}
            aria-label="Ir al paso 1: datos básicos"
            className="relative z-10 p-0 h-auto hover:bg-transparent"
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300',
              currentStep >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-700 text-gray-500',
            )}>
              <Info className="w-5 h-5" />
            </div>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onGoStep2}
            disabled={loading || !canGoToStep2}
            aria-label="Ir al paso 2: planilla de asientos"
            className="relative z-10 p-0 h-auto hover:bg-transparent"
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300',
              currentStep >= 2 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-700 text-gray-500',
            )}>
              <MapIcon className="w-5 h-5" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
