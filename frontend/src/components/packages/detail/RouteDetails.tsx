import { ArrowRight, Box, Archive } from 'lucide-react'

interface Props {
  originName: string
  destinationName: string
}

export function RouteDetails({ originName, destinationName }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase mb-4 sm:mb-6">Detalles de Ruta</h2>
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 relative">
        <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ArrowRight className="w-8 h-8 text-gray-300" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Oficina de Origen</span>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Box className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight break-words">{originName}</h3>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:text-left">
          <span className="text-[10px] font-bold text-brand-crimson uppercase tracking-widest">Oficina de Destino</span>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <Archive className="w-5 h-5 text-brand-crimson" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">{destinationName}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
