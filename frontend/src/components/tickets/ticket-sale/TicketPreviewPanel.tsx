/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye } from 'lucide-react'
import TicketDisplay from '../TicketDisplay'

interface Props {
  previewTicket: any
  trip: any
}

export function TicketPreviewPanel({ previewTicket, trip }: Props) {
  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-8 bg-white lg:border-l border-t lg:border-t-0 border-gray-200 shrink-0 overflow-y-auto">
      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Eye className="w-5 h-5 text-blue-600 mr-2" />
        Previsualización del Boleto
      </h4>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-center">
        <div className="w-full max-w-lg">
          {previewTicket ? (
            <TicketDisplay ticket={previewTicket} trip={trip} previewMode={true} />
          ) : (
            <div className="text-center py-12">
              <p className="mt-4 text-gray-500 font-medium">La previsualización aparecerá aquí</p>
              <p className="text-sm text-gray-400">Complete la información del cliente para ver el boleto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
