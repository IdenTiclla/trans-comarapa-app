/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ReceiptDocument } from './receipt/ReceiptDocument'
import {
  computeTotalAmount,
  resolveNames,
  resolveLocations,
  printReceipt,
} from './receipt/helpers'

interface PackageReceiptModalProps {
  show: boolean
  packageData: any
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

  if (!show || !packageData) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 modal-overlay-bokeh backdrop-blur-sm transition-all duration-300 opacity-100">
      <Button
        type="button"
        variant="ghost"
        aria-label="Cerrar modal"
        className="absolute inset-0 h-full w-full rounded-none cursor-default bg-transparent hover:bg-transparent"
        onClick={onClose}
      />

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-3xl sm:w-full border border-gray-100/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-4 py-1" />

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

        <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={printReceipt}
            aria-label="Imprimir recibo de encomienda"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Imprimir Recibo
          </Button>
          <Button type="button" onClick={onClose} aria-label="Cerrar recibo">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
