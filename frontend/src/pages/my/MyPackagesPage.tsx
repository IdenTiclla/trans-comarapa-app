import { Link } from 'react-router'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyPackages } from '@/hooks/use-my-packages'
import EmptyState from '@/components/common/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package as PackageIcon, AlertCircle, Send, Inbox, ArrowRight, CalendarDays, User } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { LOCALE } from '@/lib/locale-config'
import { getPackageStatusLabel, getPackageStatusBg, getPackageStatusText } from '@/lib/package-status'
import { cn } from '@/lib/utils'

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function Component() {
  useDocumentTitle('Mis Encomiendas')
  const { tab, setTab, sent, received, list, loading, error } = useMyPackages()

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Encomiendas</h1>
        <p className="text-sm text-muted-foreground">Encomiendas que enviaste o recibiste</p>
      </div>

      <div role="tablist" aria-label="Filtrar encomiendas" className="inline-flex rounded-lg border bg-card p-1 gap-1">
        <Button
          type="button"
          variant={tab === 'sent' ? 'default' : 'ghost'}
          size="sm"
          role="tab"
          aria-selected={tab === 'sent'}
          onClick={() => setTab('sent')}
          className="min-h-[44px]"
        >
          <Send className="h-4 w-4 mr-2" />
          Enviadas ({sent.length})
        </Button>
        <Button
          type="button"
          variant={tab === 'received' ? 'default' : 'ghost'}
          size="sm"
          role="tab"
          aria-selected={tab === 'received'}
          onClick={() => setTab('received')}
          className="min-h-[44px]"
        >
          <Inbox className="h-4 w-4 mr-2" />
          Recibidas ({received.length})
        </Button>
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
          title={tab === 'sent' ? 'Sin encomiendas enviadas' : 'Sin encomiendas recibidas'}
          description={tab === 'sent' ? 'No has enviado encomiendas aún.' : 'No tienes encomiendas a tu nombre.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => {
            const status = String(p.status ?? '')
            const counterpartLabel = tab === 'sent' ? 'Para' : 'De'
            const counterpartName = tab === 'sent' ? p.recipient_name : p.sender_name
            return (
              <Link
                key={p.id}
                to={ROUTES.packageDetail(p.id)}
                className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* Header */}
                <div className="border-b border-border bg-muted/20 px-4 py-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{p.tracking_code ?? `#${p.id}`}</span>
                  </div>
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold', getPackageStatusBg(status), getPackageStatusText(status))}>
                    {getPackageStatusLabel(status)}
                  </span>
                </div>

                {/* Route */}
                <div className="px-4 py-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">Origen</p>
                      <h3 className="truncate text-base font-extrabold leading-tight text-foreground" title={p.origin_name ?? '—'}>{p.origin_name ?? '—'}</h3>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">Destino</p>
                      <h3 className="truncate text-base font-extrabold leading-tight text-foreground" title={p.destination_name ?? '—'}>{p.destination_name ?? '—'}</h3>
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="grid grid-cols-2 gap-3 border-t border-border px-4 py-3 bg-muted/5">
                  <div className="flex flex-col min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight flex items-center gap-1 mb-0.5">
                      <User className="h-3 w-3" /> {counterpartLabel}
                    </p>
                    <p className="text-sm font-bold text-foreground truncate" title={counterpartName ?? '—'}>{counterpartName ?? '—'}</p>
                  </div>
                  <div className="flex flex-col min-w-0 text-right items-end">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight flex items-center gap-1 mb-0.5">
                      <CalendarDays className="h-3 w-3" /> Registrada
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">{formatDate(p.created_at)}</p>
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
