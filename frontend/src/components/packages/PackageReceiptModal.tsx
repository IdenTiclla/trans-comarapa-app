import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AppModal } from '@/components/common'
import { Printer } from 'lucide-react'
import { ReceiptDocument } from './receipt/ReceiptDocument'
import {
  computeTotalAmount,
  resolveNames,
  resolveLocations,
  printReceipt,
} from './receipt/helpers'

interface PackageReceiptModalProps {
  show: boolean
  packageData: Record<string, unknown> | null
  onClose: () => void
}

export default function PackageReceiptModal({ show, packageData, onClose }: PackageReceiptModalProps) {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear().toString()

  const [fallbackNumber] = useState(
    () => 'TEMP-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
  )
  const packageNumber = packageData?.tracking_number || fallbackNumber

  const totalAmount = useMemo(() => computeTotalAmount(packageData), [packageData])
  const { senderName, recipientName } = useMemo(() => resolveNames(packageData), [packageData])
  const { originName, destinationName } = useMemo(() => resolveLocations(packageData), [packageData])

  if (!packageData) return null

  const footer = (
    <div className="flex flex-col sm:flex-row justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={printReceipt}
        aria-label="Imprimir recibo de encomienda"
        className="gap-1.5"
      >
        <Printer className="h-4 w-4" />
        Imprimir Recibo
      </Button>
      <Button type="button" onClick={onClose} aria-label="Cerrar recibo">
        Cerrar
      </Button>
    </div>
  )

  return (
    <AppModal
      open={show}
      onClose={onClose}
      size="lg"
      ariaLabel="Recibo de encomienda"
      footer={footer}
      bodyClassName="p-0"
      contentClassName="rounded-2xl"
    >
      <ReceiptDocument
        packageData={packageData}
        packageNumber={packageNumber}
        senderName={senderName}
        recipientName={recipientName}
        originName={originName}
        destinationName={destinationName}
        totalAmount={totalAmount}
        day={day}
        month={month}
        year={year}
      />
    </AppModal>
  )
}
