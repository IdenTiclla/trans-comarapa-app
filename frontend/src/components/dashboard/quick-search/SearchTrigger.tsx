import { Search } from 'lucide-react'
import { ClickableCard } from '@/components/ui/clickable-card'

interface Props {
  onOpen: () => void
}

export function SearchTrigger({ onOpen }: Props) {
  return (
    <ClickableCard
      onClick={onOpen}
      ariaLabel="Abrir busqueda rapida (Ctrl+K)"
      className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 hover:border-purple-300 rounded-xl p-4 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg transition-colors">
          <Search className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900">Busqueda Rapida</p>
          <p className="text-xs text-gray-500">Clientes, boletos, viajes, paquetes...</p>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-500 font-mono shadow-sm">
          <span className="text-xs">Ctrl</span>
          <span className="text-xs">K</span>
        </kbd>
      </div>
    </ClickableCard>
  )
}
