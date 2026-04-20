/* eslint-disable @typescript-eslint/no-explicit-any */
import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Item {
  quantity: number
  description: string
  unit_price: number
}

interface Props {
  items: Item[]
  totalAmount: number
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: string, value: any) => void
}

export function ItemsSection({ items, totalAmount, onAdd, onRemove, onUpdate }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-full">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
        <svg className="w-4 h-4 text-indigo-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        Detalle Artículos
      </h4>

      <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col max-h-[220px]">
        <div className="overflow-y-auto w-full">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-[10px] uppercase">Cant.</TableHead>
                <TableHead className="text-[10px] uppercase">Detalle</TableHead>
                <TableHead className="text-[10px] uppercase text-right">Total (Bs)</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className="group">
                  <TableCell className="align-top">
                    <FormInput
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdate(index, 'quantity', Number(e.target.value))}
                      min="1"
                      className="w-16 text-center py-1 text-sm h-9"
                    />
                  </TableCell>
                  <TableCell className="align-top w-full">
                    <FormInput
                      type="text"
                      value={item.description}
                      onChange={(e) => onUpdate(index, 'description', e.target.value)}
                      placeholder="Ej: Ropa"
                      className="w-full text-sm h-9"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <FormInput
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => onUpdate(index, 'unit_price', Number(e.target.value))}
                      min="0" step="0.5"
                      className="w-20 text-right text-sm h-9"
                    />
                  </TableCell>
                  <TableCell className="text-right align-middle">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ítem ${index + 1}`}
                        onClick={() => onRemove(index)}
                        className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 h-7 w-7"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={onAdd}
        className="mt-2 w-full text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100"
      >
        + Añadir Ítem
      </Button>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
          <span className="text-sm text-gray-600 font-medium">Total a Pagar</span>
          <span className="text-lg font-bold text-blue-900">Bs. {totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
