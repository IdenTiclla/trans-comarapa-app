import { ClickableCard } from '@/components/ui/clickable-card'
import { Plus, Search, Clock, BarChart3 } from 'lucide-react'

interface Props {
  onAction: (action: string) => void
}

interface Item {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
}

const ITEMS: Item[] = [
  { id: 'new-package', icon: <Plus className="h-5 w-5 text-primary" />, title: 'Nueva Encomienda', subtitle: 'Registrar paquete' },
  { id: 'track-package', icon: <Search className="h-5 w-5 text-primary" />, title: 'Rastrear Paquete', subtitle: 'Buscar por código' },
  { id: 'pending-deliveries', icon: <Clock className="h-5 w-5 text-primary" />, title: 'Entregas Pendientes', subtitle: 'Ver pendientes' },
  { id: 'reports', icon: <BarChart3 className="h-5 w-5 text-primary" />, title: 'Reportes', subtitle: 'Estadísticas' },
]

export function QuickActions({ onAction }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {ITEMS.map((it) => (
        <ClickableCard
          key={it.id}
          ariaLabel={`${it.title}: ${it.subtitle}`}
          onClick={() => onAction(it.id)}
          className="hover:border-primary/30 gap-0 py-0"
        >
          <div className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              {it.icon}
            </div>
            <div>
              <p className="font-semibold text-sm">{it.title}</p>
              <p className="text-xs text-muted-foreground">{it.subtitle}</p>
            </div>
          </div>
        </ClickableCard>
      ))}
    </div>
  )
}
