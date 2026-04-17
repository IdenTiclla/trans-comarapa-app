import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { AlertCircle, ArrowRight, Ban, ChevronRight, Edit, Eye, Printer, TicketIcon } from 'lucide-react'
import { useTicketDetail } from '@/hooks/use-ticket-detail'
import { ticketService } from '@/services/ticket.service'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import TicketReceiptModal from '@/components/tickets/TicketReceiptModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

const formatCurrency = (amount: number | undefined | null) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(amount ?? 0)

const formatDateTime = (value: string | undefined | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

const formatDate = (value: string | undefined | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

const formatTime = (value: string | undefined | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

const STATE_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800 ring-amber-200' },
  confirmed: { label: 'Confirmado', className: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-rose-100 text-rose-800 ring-rose-200' },
  completed: { label: 'Completado', className: 'bg-sky-100 text-sky-800 ring-sky-200' },
}

const PAYMENT_METHOD: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  qr: 'QR',
  transfer: 'Transferencia',
}

export function Component() {
  const { id } = useParams()
  const ticketId = Number(id)
  const navigate = useNavigate()
  const { ticket, trip, loading, error, reload } = useTicketDetail(ticketId)

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [autoPrintPreview, setAutoPrintPreview] = useState(false)

  const stateInfo = useMemo(() => {
    const state = ticket?.state?.toLowerCase() ?? ''
    return STATE_BADGE[state] ?? { label: state || '—', className: 'bg-gray-100 text-gray-800 ring-gray-200' }
  }, [ticket?.state])

  const canCancel = ticket?.state && !['cancelled', 'completed'].includes(ticket.state.toLowerCase())

  const origin =
    trip?.route?.origin_location?.name ||
    trip?.route?.origin ||
    '—'
  const destination =
    ticket?.destination ||
    trip?.route?.destination_location?.name ||
    trip?.route?.destination ||
    '—'

  const passengerName = [ticket?.client?.firstname, ticket?.client?.lastname].filter(Boolean).join(' ') || '—'
  const secretaryName = [ticket?.secretary?.firstname, ticket?.secretary?.lastname].filter(Boolean).join(' ') || '—'

  const handleCancel = async () => {
    if (!ticket) return
    setCancelling(true)
    try {
      await ticketService.cancel(ticket.id)
      toast.success('Boleto cancelado correctamente')
      setShowCancelDialog(false)
      await reload()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cancelar el boleto'
      toast.error(message)
    } finally {
      setCancelling(false)
    }
  }

  const handlePreview = () => {
    setAutoPrintPreview(false)
    setShowPreview(true)
  }

  const handlePrint = () => {
    setAutoPrintPreview(true)
    setShowPreview(true)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setAutoPrintPreview(false)
  }

  if (loading && !ticket) {
    return (
      <div className="w-full px-4 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-96 w-full lg:col-span-8" />
          <Skeleton className="h-96 w-full lg:col-span-4" />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {error ? 'Error al cargar el boleto' : 'Boleto no encontrado'}
        </h3>
        {error && <p className="mt-2 text-sm text-gray-500">{error}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/tickets')}>
            Volver a boletos
          </Button>
          {error && (
            <Button onClick={reload}>Reintentar</Button>
          )}
        </div>
      </div>
    )
  }

  const basePrice = trip?.route?.price
  const totalPrice = ticket.price

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 lg:px-8 pt-6 pb-12">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              <Link to="/tickets" className="hover:text-primary">Boletos</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-primary">Detalles</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Boleto #{ticket.id}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest rounded ring-1',
                  stateInfo.className,
                )}
              >
                {stateInfo.label}
              </span>
              <span className="text-sm text-gray-500">
                Emitido: {formatDateTime(ticket.created_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={() => navigate(`/tickets?edit=${ticket.id}`)}>
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4" />
              Previsualizar
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main */}
          <section className="lg:col-span-8 space-y-6">
            {/* Passenger & Seat */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">
                    Información del Pasajero
                  </h3>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Nombre</p>
                    <p className="text-xl font-semibold text-gray-900">{passengerName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">CI / Documento</p>
                      <p className="text-base font-medium text-gray-900">
                        {ticket.client?.document_id || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Teléfono</p>
                      <p className="text-base font-medium text-gray-900">
                        {ticket.client?.phone || '—'}
                      </p>
                    </div>
                  </div>
                  {ticket.client?.email && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Email</p>
                      <p className="text-base font-medium text-gray-900">{ticket.client.email}</p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-5 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-primary text-white flex items-center justify-center rounded-lg mb-3">
                    <TicketIcon className="h-7 w-7" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Asiento</p>
                  <p className="text-5xl font-bold tracking-tight text-primary leading-none mt-1">
                    {ticket.seat?.seat_number ?? ticket.seat_id ?? '—'}
                  </p>
                  {ticket.seat?.deck && (
                    <p className="text-xs text-gray-500 mt-2">Piso {ticket.seat.deck}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Logistics */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">
                Información del Viaje
              </h3>

              {trip ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="relative pl-6 border-l-2 border-dashed border-gray-300">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-white" />
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Origen</p>
                      <p className="text-lg font-bold text-gray-900">{origin}</p>
                    </div>
                    <div className="flex flex-col items-center py-2 md:py-0">
                      <ArrowRight className="h-7 w-7 text-gray-300" />
                      {trip.bus?.license_plate && (
                        <p className="text-[10px] font-bold text-primary uppercase mt-1">
                          Bus {trip.bus.license_plate}
                        </p>
                      )}
                    </div>
                    <div className="md:text-right">
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Destino</p>
                      <p className="text-lg font-bold text-gray-900">{destination}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Fecha salida</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(trip.trip_datetime)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Hora</p>
                      <p className="text-sm font-medium text-gray-900">{formatTime(trip.trip_datetime)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Viaje</p>
                      <Link
                        to={`/trips/${trip.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        #{trip.id}
                      </Link>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Estado viaje</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{trip.status || '—'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">Sin información del viaje.</p>
              )}
            </div>

            {/* Financial */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 mb-5">
                Información Financiera
              </h3>
              <div className="space-y-3">
                {basePrice !== undefined && basePrice !== totalPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tarifa base</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(basePrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Método de pago</span>
                  <span className="font-semibold text-gray-900">
                    {ticket.payment_method ? PAYMENT_METHOD[ticket.payment_method] ?? ticket.payment_method : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Emitido por</span>
                  <span className="font-semibold text-gray-900">{secretaryName}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-end">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Total</span>
                  <span className="text-3xl font-bold tracking-tight text-gray-900">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Status / Metadata */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">
                Estado del Boleto
              </h3>
              <div className="flex flex-col items-center text-center py-3">
                <span
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded ring-1',
                    stateInfo.className,
                  )}
                >
                  {stateInfo.label}
                </span>
              </div>
              <div className="space-y-3 text-sm pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creado</span>
                  <span className="font-medium text-gray-900">{formatDateTime(ticket.created_at)}</span>
                </div>
                {ticket.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Actualizado</span>
                    <span className="font-medium text-gray-900">{formatDateTime(ticket.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 print:hidden">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 px-2 pt-1 pb-3">
                Acciones
              </h3>
              <button
                onClick={handlePreview}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Previsualizar boleto</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary" />
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Printer className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Imprimir boleto</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary" />
              </button>
              {canCancel && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-rose-50 transition-colors group text-rose-600"
                >
                  <div className="flex items-center gap-3">
                    <Ban className="h-4 w-4" />
                    <span className="text-sm font-medium">Cancelar boleto</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-rose-600" />
                </button>
              )}
            </div>

            {/* Bus */}
            {trip?.bus && (
              <div className="bg-primary text-white p-6 rounded-xl overflow-hidden relative">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                  Vehículo Asignado
                </p>
                <h4 className="text-xl font-bold mb-4">{trip.bus.license_plate || '—'}</h4>
                <div className="flex gap-6">
                  {trip.bus.capacity !== undefined && (
                    <div>
                      <p className="text-[9px] uppercase font-bold opacity-70">Capacidad</p>
                      <p className="text-sm font-bold">{trip.bus.capacity} asientos</p>
                    </div>
                  )}
                  {trip.bus.model && (
                    <div>
                      <p className="text-[9px] uppercase font-bold opacity-70">Modelo</p>
                      <p className="text-sm font-bold">{trip.bus.model}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <TicketReceiptModal
        show={showPreview}
        tickets={[ticket]}
        trip={trip}
        onClose={handleClosePreview}
        autoPrint={autoPrintPreview}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar boleto #{ticket.id}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado del boleto a "cancelado" y liberará el asiento.
              ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {cancelling ? 'Cancelando...' : 'Cancelar boleto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
