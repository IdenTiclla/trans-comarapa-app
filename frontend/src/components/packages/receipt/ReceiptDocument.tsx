/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReceiptHeader } from './ReceiptHeader'
import { ReceiptItemsTable } from './ReceiptItemsTable'

interface Props {
  packageData: any
  packageNumber: string
  senderName: string
  recipientName: string
  originName: string
  destinationName: string
  totalAmount: number
  day: string
  month: string
  year: string
}

export function ReceiptDocument({
  packageData, packageNumber, senderName, recipientName,
  originName, destinationName, totalAmount, day, month, year,
}: Props) {
  const trackingLabel = packageData.tracking_number || packageNumber
  const paymentStatusLabel = packageData.payment_status === 'paid_on_send' ? 'Pagado' : 'Por cobrar'

  return (
    <div id="receipt-content" className="bg-white">
      <div className="p-4 max-w-3xl mx-auto bg-white border-2 border-blue-800 rounded-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
        <ReceiptHeader
          originCode={originName.slice(0, 3).toUpperCase()}
          day={day}
          month={month}
          year={year}
        />

        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-lg font-black text-blue-800 tracking-wide">EMISIÓN DE ENCOMIENDA</h3>
          <div className="bg-red-600 text-white px-3 py-1 rounded shadow-sm border border-red-700">
            <span className="text-sm font-bold tracking-wider">N° {trackingLabel}</span>
          </div>
        </div>

        <div className="text-xs text-blue-700 mb-6 font-medium leading-relaxed">
          <p>📍 <strong>Of. Santa Cruz:</strong> Av. Doble Vía La Guardia 4to. Anillo • <strong>Cel.:</strong> 68921188</p>
          <p>📍 <strong>Of. Comarapa:</strong> Av. Comarapa • <strong>Cel.:</strong> 68921154</p>
          <p>📍 <strong>Of. San Isidro:</strong> <strong>Cel.:</strong> 71641780</p>
          <p>📍 <strong>Of. Los Negros:</strong> <strong>Cel.:</strong> 71641781</p>
        </div>

        <div className="space-y-1 mb-4 text-sm">
          <div className="flex items-center">
            <span className="text-blue-800 font-bold w-24">Remitente:</span>
            <div className="flex-1 relative">
              <span className="bg-white pr-2 relative z-10">{senderName} (CI: {packageData.sender?.document_id || ''})</span>
              <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400" />
            </div>
          </div>

          <div className="flex items-center mt-2">
            <span className="text-blue-800 font-bold w-24">Destinatario:</span>
            <div className="flex-1 relative">
              <span className="bg-white pr-2 relative z-10">{recipientName} (CI: {packageData.recipient?.document_id || ''})</span>
              <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
            <div className="flex items-center">
              <span className="text-blue-800 font-bold w-24 flex-shrink-0">Origen:</span>
              <div className="flex-1 relative">
                <span className="bg-white pr-2 relative z-10">{originName}</span>
                <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-blue-800 font-bold w-24 flex-shrink-0">Destino:</span>
              <div className="flex-1 relative">
                <span className="bg-white pr-2 relative z-10">{destinationName}</span>
                <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-blue-800 font-bold w-24 flex-shrink-0">Estado Pago:</span>
              <div className="flex-1 relative">
                <span className="bg-white pr-2 relative z-10 truncate">{paymentStatusLabel}</span>
                <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <ReceiptItemsTable items={packageData.items || []} totalAmount={totalAmount} />

        <div className="flex items-center justify-between text-xs mb-2">
          <div className="w-2/3">
            <p className="text-gray-600 mb-1">Pasado los 30 días la empresa no se responsabiliza.</p>
          </div>
          <div className="text-center w-1/3">
            <div className="border-t border-dotted border-gray-500 w-full mb-1" />
            <p className="text-blue-800 font-bold" style={{ fontSize: '10px' }}>RECIBÍ CONFORME</p>
          </div>
        </div>
      </div>
    </div>
  )
}
