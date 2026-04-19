import { Card, CardContent } from '@/components/ui/card'
import { Package, Search, Clock, BarChart3 } from 'lucide-react'

interface Props {
  loading: boolean
  total: number
  pending: number
  inTransit: number
  deliveredToday: number
}

const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      </div>
    </CardContent>
  </Card>
)

export function StatCards({ loading, total, pending, inTransit, deliveredToday }: Props) {
  const v = (n: number) => (loading ? '...' : n)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat icon={<Package className="h-5 w-5 text-primary" />} value={v(total)} label="Total" />
      <Stat icon={<Clock className="h-5 w-5 text-primary" />} value={v(pending)} label="Pendientes" />
      <Stat icon={<Search className="h-5 w-5 text-primary" />} value={v(inTransit)} label="En tránsito" />
      <Stat icon={<BarChart3 className="h-5 w-5 text-primary" />} value={v(deliveredToday)} label="Entregados hoy" />
    </div>
  )
}
