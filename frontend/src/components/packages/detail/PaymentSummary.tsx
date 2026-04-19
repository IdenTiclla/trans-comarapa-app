/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box } from 'lucide-react'

interface Props {
  pkg: any
}

export function PaymentSummary({ pkg }: Props) {
  const amount = (pkg.total_amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const itemsCount = pkg.total_items_count || (pkg.items ? pkg.items.length : 0)
  const weight = pkg.total_weight ? `${pkg.total_weight} kg` : 'N/A'

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e293b] mb-4">Valor Pagado</p>
        <h3 className="text-[40px] font-bold text-[#1e293b] leading-none mb-1 tracking-tight">Bs. {amount}</h3>
        <p className="text-[11px] text-gray-500 mb-6">Monto total del servicio</p>

        <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#1e293b]">Tarifa Base</span>
            <span className="text-xs font-bold text-[#1e293b]">Bs. {amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#1e293b]">Total Items</span>
            <span className="text-xs font-bold text-[#1e293b]">{itemsCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#1e293b]">Peso Total</span>
            <span className="text-xs font-bold text-[#1e293b]">{weight}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e293b] mb-6">Manifiesto de ítems</p>
        <div className="space-y-5">
          {(pkg.items || []).length > 0 ? (
            pkg.items.map((item: any) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-[#F1F5F9] border border-gray-200 flex items-center justify-center flex-shrink-0 text-[#1e293b]">
                  <Box className="w-5 h-5 fill-current" />
                </div>
                <div className="leading-tight">
                  <p className="text-[13px] font-bold text-[#1e293b] mb-0.5">{item.quantity}x {item.description}</p>
                  <p className="text-[11px] text-gray-500">
                    {item.weight || pkg.total_weight ? `${item.weight || pkg.total_weight} kg` : 'N/A kg'} | Empaque General
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm italic">No hay registro de ítems para esta encomienda.</div>
          )}
        </div>
      </div>
    </>
  )
}
