import FormInput from '@/components/forms/FormInput'
import { IntegerField, DecimalField } from '@/components/forms/NumericField'
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
  onUpdate: (index: number, field: string, value: unknown) => void
}

export function ItemsSection({ items, totalAmount, onAdd, onRemove, onUpdate }: Props) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border flex flex-col h-full">
      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center uppercase tracking-wide">
        <svg className="w-4 h-4 text-primary mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        Detalle Artículos
      </h4>

      <div className="border rounded-lg overflow-hidden flex-1 flex flex-col max-h-[220px]">
        <div className="overflow-y-auto w-full">
          <Table aria-label="Artículos de la encomienda">
            <TableHeader className="bg-muted sticky top-0 z-10">
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
                    <IntegerField
                      value={item.quantity}
                      onChange={(n) => onUpdate(index, 'quantity', n)}
                      min={1}
                      aria-label={`Cantidad ítem ${index + 1}`}
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
                    <DecimalField
                      value={item.unit_price}
                      onChange={(n) => onUpdate(index, 'unit_price', n)}
                      aria-label={`Precio unitario ítem ${index + 1}`}
                      className="w-24 text-right text-sm h-9"
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
                        className="text-destructive hover:text-destructive h-7 w-7"
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
        variant="outline"
        onClick={onAdd}
        className="mt-2 w-full text-xs font-semibold"
      >
        + Añadir Ítem
      </Button>

      <div className="mt-auto pt-4 border-t">
        <div className="bg-primary/5 p-3 rounded-lg flex justify-between items-center border border-primary/10">
          <span className="text-sm text-muted-foreground font-medium">Total a Pagar</span>
          <span className="text-lg font-bold text-primary">Bs. {(totalAmount ?? 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
