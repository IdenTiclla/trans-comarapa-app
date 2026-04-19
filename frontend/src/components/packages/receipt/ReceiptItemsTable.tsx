/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  items: any[]
  totalAmount: number
}

export function ReceiptItemsTable({ items, totalAmount }: Props) {
  const emptyRows = Math.max(0, 3 - items.length)
  return (
    <div className="border-2 border-blue-800 rounded-sm mb-4 overflow-hidden">
      <div className="grid grid-cols-12 bg-blue-800 relative z-10">
        <div className="col-span-2 text-white p-1 text-center font-bold text-xs">CANT.</div>
        <div className="col-span-7 text-white p-1 text-center font-bold text-xs">DETALLE</div>
        <div className="col-span-3 text-white p-1 text-center font-bold text-xs">MONTO</div>
      </div>

      <div className="bg-gray-50 text-sm">
        {items.map((item: any, index: number) => {
          const price = item.unit_price ?? (item.total_price ? item.total_price / (item.quantity || 1) : 0)
          return (
            <div key={index} className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-2 p-2 text-center">{item.quantity}</div>
              <div className="col-span-7 p-2 truncate">{item.description}</div>
              <div className="col-span-3 p-2 text-center">Bs. {(item.quantity * price).toFixed(2)}</div>
            </div>
          )
        })}

        {Array.from({ length: emptyRows }).map((_, n) => (
          <div key={`empty-${n}`} className="grid grid-cols-12 border-b border-gray-200">
            <div className="col-span-2 p-2">&nbsp;</div>
            <div className="col-span-7 p-2">&nbsp;</div>
            <div className="col-span-3 p-2">&nbsp;</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 bg-blue-50 border-t-2 border-blue-800">
        <div className="col-span-9 p-2 text-right font-bold text-sm text-blue-900">TOTAL:</div>
        <div className="col-span-3 p-2 text-center font-bold text-sm text-blue-900">Bs. {totalAmount.toFixed(2)}</div>
      </div>
    </div>
  )
}
