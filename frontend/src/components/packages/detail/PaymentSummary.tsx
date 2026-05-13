import { Box } from 'lucide-react'
import type { Package, PackageItem } from '@/types'
import { LOCALE } from '@/lib/locale-config'

interface Props {
  pkg: Package
}

export function PaymentSummary({ pkg }: Props) {
  const amount = (pkg.total_amount || 0).toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const itemsCount = pkg.total_items_count || (pkg.items ? pkg.items.length : 0)
  const weight = pkg.total_weight ? `${pkg.total_weight} kg` : 'N/A'

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-3 sm:mb-4">Valor Pagado</p>
        <h3 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-slate-800 leading-none mb-1 tracking-tight break-all">Bs. {amount}</h3>
        <p className="text-[11px] text-gray-500 mb-6">Monto total del servicio</p>

        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">Tarifa Base</span>
            <span className="text-xs font-bold text-slate-800">Bs. {amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">Total Items</span>
            <span className="text-xs font-bold text-slate-800">{itemsCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">Peso Total</span>
            <span className="text-xs font-bold text-slate-800">{weight}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-4 sm:mb-6">Manifiesto de ítems</p>
        <div className="space-y-5">
          {(pkg.items || []).length > 0 ? (
            (pkg.items as PackageItem[] || []).map((item) => (
              <div key={item.id} className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded bg-slate-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-slate-800">
                  <Box className="w-5 h-5 fill-current" />
                </div>
                <div className="leading-tight min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800 mb-0.5 break-words">{item.quantity}x {item.description}</p>
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
