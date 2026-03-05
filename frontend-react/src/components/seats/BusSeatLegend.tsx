export default function BusSeatLegend() {
    return (
        <div className="px-4 sm:px-6 md:px-8 py-3 print:hidden">
            <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-5">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300 shadow-sm" />
                    <span className="text-xs font-semibold text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-blue-400 shadow-sm" />
                    <span className="text-xs font-semibold text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-orange-300 shadow-sm" />
                    <span className="text-xs font-semibold text-gray-600">Reservado</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 shadow-sm" />
                    <span className="text-xs font-semibold text-gray-600">Ocupado</span>
                </div>
            </div>
        </div>
    )
}
