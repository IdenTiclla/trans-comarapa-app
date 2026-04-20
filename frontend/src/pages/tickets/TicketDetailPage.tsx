import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
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
import { AssignedTripCard } from '@/components/packages/detail/AssignedTripCard'
import { TicketDetailHeader } from './ticket-detail/TicketDetailHeader'
import { PassengerCard } from './ticket-detail/PassengerCard'
import { TripLogisticsCard } from './ticket-detail/TripLogisticsCard'
import { PaymentSummaryCard } from './ticket-detail/PaymentSummaryCard'
import { QuickActionsCard } from './ticket-detail/QuickActionsCard'

export function Component() {
  const { id } = useParams()
  const ticketId = Number(id)
  const navigate = useNavigate()
  const { ticket, trip, loading, error, reload } = useTicketDetail(ticketId)

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [autoPrintPreview, setAutoPrintPreview] = useState(false)

  const canCancel = Boolean(ticket?.state && !['cancelled', 'completed'].includes(ticket.state.toLowerCase()))

  const handleCancel = async () => {
    if (!ticket) return
    setCancelling(true)
    try {
      await ticketService.cancel(ticket.id)
      toast.success('Boleto cancelado correctamente')
      setShowCancelDialog(false)
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo cancelar el boleto')
    } finally {
      setCancelling(false)
    }
  }

  const handlePreview = () => { setAutoPrintPreview(false); setShowPreview(true) }
  const handlePrint = () => { setAutoPrintPreview(true); setShowPreview(true) }
  const handleClosePreview = () => { setShowPreview(false); setAutoPrintPreview(false) }

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
          <Button variant="outline" onClick={() => navigate('/tickets')}>Volver a boletos</Button>
          {error && <Button onClick={reload}>Reintentar</Button>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 lg:px-8 pt-6 pb-12">
        <TicketDetailHeader
          ticketId={ticket.id}
          state={ticket.state}
          createdAt={ticket.created_at}
          onEdit={() => navigate(`/tickets?edit=${ticket.id}`)}
          onPreview={handlePreview}
          onPrint={handlePrint}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 space-y-6">
            <PassengerCard ticket={ticket} />
            <TripLogisticsCard ticket={ticket} trip={trip} />
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <PaymentSummaryCard ticket={ticket} trip={trip} />
            <QuickActionsCard
              canCancel={canCancel}
              onPreview={handlePreview}
              onPrint={handlePrint}
              onCancel={() => setShowCancelDialog(true)}
            />
            <AssignedTripCard pkg={{ trip }} />
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
