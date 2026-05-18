import { Link } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useClientDashboard } from '@/hooks/use-client-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/common/EmptyState'
import {
  Ticket as TicketIcon,
  Package as PackageIcon,
  Calendar,
  Inbox,
  Send,
  AlertCircle,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { LOCALE } from '@/lib/locale-config'
import {
  getPackageStatusLabel,
  getPackageStatusBg,
  getPackageStatusText,
} from '@/lib/package-status'
import { cn } from '@/lib/utils'

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

function formatDateTime(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString(LOCALE, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' })
}

function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: string | number
  icon: typeof TicketIcon
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold leading-tight text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            {hint && <div className="mt-0.5 text-xs text-muted-foreground/80">{hint}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Component() {
  useDocumentTitle('Panel de Cliente')
  const { user } = useAuth()
  const {
    loading,
    error,
    stats,
    nextTrip,
    recentTickets,
    pendingToReceive,
  } = useClientDashboard()

  const nextTripData = nextTrip?.trip as
    | { date?: string; trip_datetime?: string; route?: { origin?: { name?: string }; destination?: { name?: string } } }
    | undefined
  const nextTripDate = nextTripData?.trip_datetime ?? nextTripData?.date
  const nextOrigin = nextTripData?.route?.origin?.name ?? '—'
  const nextDestination = nextTripData?.route?.destination?.name ?? nextTrip?.destination ?? '—'

  return (
    <div className="w-full">
      <div className="border-b">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TicketIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hola, {user?.firstname || 'cliente'}</h1>
              <p className="text-sm text-muted-foreground">Aquí tienes un resumen de tus viajes y encomiendas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        {error && (
          <Card role="alert" className="border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        <section aria-label="Resumen">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Boletos comprados"
              value={loading ? '—' : stats.totalTickets}
              icon={TicketIcon}
              hint={stats.upcomingCount > 0 ? `${stats.upcomingCount} próximos` : undefined}
            />
            <KpiCard
              label="Próximo viaje"
              value={loading ? '—' : nextTripDate ? formatDate(nextTripDate) : 'Sin viajes'}
              icon={Calendar}
            />
            <KpiCard
              label="Encomiendas enviadas"
              value={loading ? '—' : stats.sentCount}
              icon={Send}
            />
            <KpiCard
              label="Encomiendas por recibir"
              value={loading ? '—' : stats.pendingToReceiveCount}
              icon={Inbox}
              hint={stats.receivedCount > 0 ? `${stats.receivedCount} en total` : undefined}
            />
          </div>
        </section>

        {!loading && nextTrip && (
          <section aria-labelledby="next-trip-heading">
            <h2 id="next-trip-heading" className="mb-3 text-lg font-semibold text-foreground">Tu próximo viaje</h2>
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-foreground">
                        {nextOrigin} → {nextDestination}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(nextTripDate)} · Asiento #{nextTrip.seat?.seat_number ?? '—'}
                      </p>
                      <span
                        className={cn(
                          'mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                          STATE_BADGE[String(nextTrip.state ?? '')] ?? 'bg-muted',
                        )}
                      >
                        {STATE_LABEL[String(nextTrip.state ?? '')] ?? String(nextTrip.state)}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={ROUTES.ticketDetail(nextTrip.id)} aria-label={`Ver detalle del boleto ${nextTrip.id}`}>
                      Ver boleto
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section aria-labelledby="recent-tickets-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-tickets-heading" className="text-lg font-semibold text-foreground">Boletos recientes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.MY_TICKETS}>
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div role="status" aria-live="polite" className="py-8 text-center text-sm text-muted-foreground">
              Cargando...
            </div>
          ) : recentTickets.length === 0 ? (
            <EmptyState title="Sin boletos" description="Aún no tienes boletos comprados." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentTickets.map((t) => {
                const state = String(t.state ?? '')
                const trip = t.trip as
                  | { date?: string; trip_datetime?: string; route?: { origin?: { name?: string }; destination?: { name?: string } } }
                  | undefined
                const origin = trip?.route?.origin?.name ?? '—'
                const destination = trip?.route?.destination?.name ?? t.destination ?? '—'
                const tripDate = trip?.trip_datetime ?? trip?.date
                return (
                  <Link
                    key={t.id}
                    to={ROUTES.ticketDetail(t.id)}
                    className="block rounded-lg border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold">Boleto #{t.id}</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          STATE_BADGE[state] ?? 'bg-muted',
                        )}
                      >
                        {STATE_LABEL[state] ?? state}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{origin} → {destination}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(tripDate)}</p>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="pending-packages-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="pending-packages-heading" className="text-lg font-semibold text-foreground">Encomiendas por recibir</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.MY_PACKAGES}>
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div role="status" aria-live="polite" className="py-8 text-center text-sm text-muted-foreground">
              Cargando...
            </div>
          ) : pendingToReceive.length === 0 ? (
            <EmptyState
              title="Sin encomiendas pendientes"
              description="No tienes encomiendas por recibir en este momento."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingToReceive.slice(0, 6).map((p) => {
                const status = String(p.status ?? '')
                return (
                  <Link
                    key={p.id}
                    to={ROUTES.packageDetail(p.id)}
                    className="block rounded-lg border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PackageIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">{p.tracking_code ?? `#${p.id}`}</span>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          getPackageStatusBg(status),
                          getPackageStatusText(status),
                        )}
                      >
                        {getPackageStatusLabel(status)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">De {p.sender_name ?? '—'}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.origin_name ?? '—'} → {p.destination_name ?? '—'}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Component
