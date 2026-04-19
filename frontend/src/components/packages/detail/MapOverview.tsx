/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  pkg: any
}

const STATUS_TEXT: Record<string, string> = {
  delivered: 'Paquete Entregado',
  arrived_at_destination: 'En Agencia de Destino',
  in_transit: 'En Viaje hacia Destino',
}

export function MapOverview({ pkg }: Props) {
  const text = STATUS_TEXT[pkg.status] || 'Esperando Despacho en Agencia'
  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-sm h-[400px] bg-gray-900 bg-cover bg-center"
      style={{ backgroundImage: 'url(/dark_city_map.png)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-extrabold border border-white/20 text-[#16499B] shadow-sm flex items-center gap-2 uppercase tracking-wide">
        Rastreo Activo
      </div>
      <div className="absolute bottom-6 left-6 text-white z-10 w-full">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Estado actual</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-medium">{text}</p>
        </div>
      </div>
    </div>
  )
}
