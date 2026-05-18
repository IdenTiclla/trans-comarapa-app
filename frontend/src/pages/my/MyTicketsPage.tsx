import { Link } from 'react-router'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyTickets } from '@/hooks/use-my-tickets'
import EmptyState from '@/components/common/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket as TicketIcon, AlertCircle, ArrowRight, CalendarDays, Banknote, Armchair } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { LOCALE } from '@/lib/locale-config'

const STATE_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  paid: 'Pagado',
  sold: 'Vendido',
  cancelled: 'Cancelado',
  expired: 'Expirado',
}

const STATE_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-emerald-100 text-emerald-800',
  sold: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-muted text-muted-foreground',
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString(LOCALE, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatMoney(amount?: number) {
  if (typeof amount !== 'number') return '—'
  return `Bs ${amount.toFixed(2)}`
}

export function Component() {
  useDocumentTitle('Mis Boletos')
  const { tab, setTab, list, counts, loading, error } = useMyTickets()

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Boletos</h1>
        <p className="text-sm text-muted-foreground">Boletos que has comprado</p>
      </div>

      <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
        <div role="tablist" aria-label="Filtrar boletos" className="inline-flex rounded-lg border bg-card p-1 gap-1">
          {['all', 'pending', 'confirmed', 'paid', 'sold', 'cancelled', 'expired'].map((stateKey) => (
            <Button
              key={stateKey}
              type="button"
              variant={tab === stateKey ? 'default' : 'ghost'}
              size="sm"
              role="tab"
              aria-selected={tab === stateKey}
              onClick={() => setTab(stateKey as any)}
              className="min-h-[44px] whitespace-nowrap"
            >
              {stateKey === 'all' ? 'Todos' : STATE_LABEL[stateKey]} ({counts[stateKey] ?? 0})
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Card role="alert" className="border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div role="status" aria-live="polite" className="text-center py-12 text-muted-foreground">
          Cargando...
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === 'all' ? 'Sin boletos' : `Sin boletos en estado ${STATE_LABEL[tab]}`}
          description={tab === 'all' ? 'Aún no tienes boletos comprados.' : `No tienes boletos con estado ${STATE_LABEL[tab].toLowerCase()}.`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((t) => {
            const state = String(t.state ?? '')
            const trip = t.trip as { date?: string; route?: { origin?: { name?: string }; destination?: { name?: string } } } | undefined
            const origin = trip?.route?.origin?.name ?? '—'
            const destination = trip?.route?.destination?.name ?? t.destination ?? '—'
            const seatNumber = t.seat?.seat_number ?? '—'
            return (
              <Link
                key={t.id}
                to={ROUTES.ticketDetail(t.id)}
                className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* Header */}
                <div className="border-b border-border bg-muted/20 px-4 py-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Boleto #{t.id}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATE_BADGE[state] ?? 'bg-muted text-muted-foreground'}`}>
                    {STATE_LABEL[state] ?? state}
                  </span>
                </div>

                {/* Route */}
                <div className="px-4 py-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">Origen</p>
                      <h3 className="truncate text-base font-extrabold leading-tight text-foreground" title={origin}>{origin}</h3>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">Destino</p>
                      <h3 className="truncate text-base font-extrabold leading-tight text-foreground" title={destination}>{destination}</h3>
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="grid grid-cols-3 gap-3 border-t border-border px-4 py-3 bg-muted/5">
                  <div className="flex flex-col min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight flex items-center gap-1 mb-0.5">
                      <CalendarDays className="h-3 w-3" /> Fecha
                    </p>
                    <p className="text-sm font-bold text-foreground truncate" title={formatDate(trip?.date)}>{formatDate(trip?.date)}</p>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight flex items-center gap-1 mb-0.5">
                      <Armchair className="h-3 w-3" /> Asiento
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">#{seatNumber}</p>
                  </div>
                  <div className="flex flex-col min-w-0 text-right items-end">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight flex items-center gap-1 mb-0.5">
                      <Banknote className="h-3 w-3" /> Precio
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">{formatMoney(t.price)}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Component
