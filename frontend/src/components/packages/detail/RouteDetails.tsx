import { ArrowRight, Box, Archive } from 'lucide-react'

interface Props {
  originName: string
  destinationName: string
}

export function RouteDetails({ originName, destinationName }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase mb-6">Detalles de Ruta</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <ArrowRight className="w-8 h-8 text-gray-300" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[#16499B] uppercase tracking-widest">Oficina de Origen</span>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Box className="w-5 h-5 text-[#16499B]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{originName}</h3>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-right md:text-left md:items-start md:pl-12">
          <span className="text-[10px] font-bold text-[#932720] uppercase tracking-widest">Oficina de Destino</span>
          <div className="flex items-start gap-3 flex-row-reverse md:flex-row">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <Archive className="w-5 h-5 text-[#932720]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{destinationName}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
