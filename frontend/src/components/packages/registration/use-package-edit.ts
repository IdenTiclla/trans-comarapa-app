import { useEffect } from 'react'
import { packageService } from '@/services/package.service'

interface PackageDataShape {
  tracking_number: string
  origin_office_id: number | null
  destination_office_id: number | null
  total_weight: number
  total_declared_value: number
  notes: string
  items: { quantity: number; description: string; unit_price: number }[]
  payment_status: string
  payment_method: string
  received_confirmation: boolean
}

interface ClientSearchLike {
  setClientType: (v: string) => void
  selectExistingClient: (c: Record<string, unknown>) => void
}

interface UsePackageEditParams {
  show: boolean
  isEditMode: boolean
  packageId: number | null
  senderSearch: ClientSearchLike
  recipientSearch: ClientSearchLike
  onLoaded: (data: { packageData: PackageDataShape; trackingNumber: string }) => void
  onError: (message: string) => void
}

export function usePackageEdit({
  show,
  isEditMode,
  packageId,
  senderSearch,
  recipientSearch,
  onLoaded,
  onError,
}: UsePackageEditParams) {
  useEffect(() => {
    if (!show || !isEditMode || !packageId) return
    let cancelled = false
    ;(async () => {
      try {
        const pkg = await packageService.getById(packageId) as Record<string, unknown>
        if (cancelled) return
        const items = (pkg.items as Array<Record<string, unknown>> | undefined) ?? []
        onLoaded({
          packageData: {
            tracking_number: (pkg.tracking_number as string) ?? '',
            origin_office_id: (pkg.origin_office_id as number) ?? null,
            destination_office_id: (pkg.destination_office_id as number) ?? null,
            total_weight: (pkg.total_weight as number) ?? 0,
            total_declared_value: (pkg.total_declared_value as number) ?? 0,
            notes: (pkg.notes as string) ?? '',
            items: items.length
              ? items.map(it => ({
                  quantity: Number(it.quantity ?? 1),
                  description: String(it.description ?? ''),
                  unit_price: Number(it.unit_price ?? 0),
                }))
              : [{ quantity: 1, description: '', unit_price: 0 }],
            payment_status: (pkg.payment_status as string) ?? 'paid_on_send',
            payment_method: (pkg.payment_method as string) ?? 'cash',
            received_confirmation: true,
          },
          trackingNumber: (pkg.tracking_number as string) ?? '------',
        })

        const sender = pkg.sender as Record<string, unknown> | null
        if (sender && sender.id) {
          senderSearch.setClientType('existing')
          senderSearch.selectExistingClient(sender)
        }
        const recipient = pkg.recipient as Record<string, unknown> | null
        if (recipient && recipient.id) {
          recipientSearch.setClientType('existing')
          recipientSearch.selectExistingClient(recipient)
        }
      } catch (e) {
        if (!cancelled) onError(e instanceof Error ? e.message : 'No se pudo cargar la encomienda.')
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isEditMode, packageId])
}
