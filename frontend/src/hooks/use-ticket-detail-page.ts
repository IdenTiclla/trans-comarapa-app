import { useState } from 'react'
import { toast } from 'sonner'
import { ticketService } from '@/services/ticket.service'
import { errMsg } from '@/lib/error-utils'

interface TicketData {
  id: number
  state: string
  created_at?: string
  [key: string]: unknown
}

export function useTicketDetailPage(
  ticket: TicketData | null,
  reload: () => Promise<void>,
) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [autoPrintPreview, setAutoPrintPreview] = useState(false)

  const canCancel = Boolean(
    ticket?.state && !['cancelled', 'completed'].includes(ticket.state.toLowerCase()),
  )

  const handleCancel = async () => {
    if (!ticket) return
    setCancelling(true)
    try {
      await ticketService.cancel(ticket.id)
      toast.success('Boleto cancelado correctamente')
      setShowCancelDialog(false)
      await reload()
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo cancelar el boleto'))
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

  return {
    showCancelDialog,
    setShowCancelDialog,
    cancelling,
    canCancel,
    showPreview,
    autoPrintPreview,
    handleCancel,
    handlePreview,
    handlePrint,
    handleClosePreview,
  }
}
