import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { Client } from '@/types'

interface ClientSearchLike {
  clientType: string
  setClientType: (v: string) => void
  clientSearchQuery: string
  searchClients: (q: string) => void
  searchingClients: boolean
  foundClients: Client[]
  hasSearched: boolean
  hasSelectedExistingClient: boolean
  selectedExistingClient: Client | null
  selectExistingClient: (c: Client) => void
  clearExistingClientSelection: () => void
}

interface NewClientForm {
  firstname: string
  lastname: string
  document_id: string
  phone: string
}

interface Props {
  title: string
  color: 'blue' | 'green'
  search: ClientSearchLike
  newForm: NewClientForm
  setNewForm: (f: NewClientForm | ((p: NewClientForm) => NewClientForm)) => void
  icon: React.ReactNode
  locked?: boolean
}

export function ClientSection({ title, color: _color, search, newForm, setNewForm, icon, locked = false }: Props) {
  const activeCls = 'border-primary bg-primary/10 text-primary'
  const inactiveCls = 'border text-muted-foreground hover:bg-muted'
  const selectedCardCls = 'bg-primary/5 border-primary/20'
  const selectedTextCls = 'text-foreground'
  const selectedSubCls = 'text-muted-foreground'
  const closeBtnCls = 'text-muted-foreground hover:text-foreground'

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border flex flex-col">
      <div className="flex items-center mb-3">
        <h4 className="text-sm font-bold text-foreground flex items-center uppercase tracking-wide">
          {icon}
          {title}
        </h4>
      </div>

      {!locked && (
        <RadioGroup value={search.clientType} onValueChange={search.setClientType} className="grid grid-cols-2 gap-2 mb-4">
          <Label className={cn(
            'flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm font-medium',
            search.clientType === 'existing' ? activeCls : inactiveCls,
          )}>
            <RadioGroupItem value="existing" className="sr-only" />
            Cliente Existente
          </Label>
          <Label className={cn(
            'flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm font-medium',
            search.clientType === 'new' ? activeCls : inactiveCls,
          )}>
            <RadioGroupItem value="new" className="sr-only" />
            Cliente Nuevo
          </Label>
        </RadioGroup>
      )}

      {search.clientType === 'existing' ? (
        <div className="flex-1 flex flex-col w-full">
          {!locked && (
            <div className="mb-2">
              <FormInput
                label="Buscar cliente"
                value={search.clientSearchQuery}
                onChange={(e) => search.searchClients(e.target.value)}
                placeholder="Buscar por nombre, apellido o CI..."
              />
            </div>
          )}

          {search.searchingClients && (
            <div className="bg-card shadow-lg border rounded-lg p-3 mb-2">
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          )}

          {!search.searchingClients && search.hasSearched && search.foundClients.length > 0 && !search.hasSelectedExistingClient && (
            <div className="bg-card shadow-lg border rounded-lg mb-2">
              <div className="max-h-36 overflow-y-auto">
                {search.foundClients.map(client => (
                  <Button
                    key={client.id}
                    type="button"
                    variant="ghost"
                    onClick={() => search.selectExistingClient(client)}
                    className="p-2 border-b border w-full text-left justify-start rounded-none hover:bg-muted h-auto"
                  >
                    <div>
                      <div className="font-medium text-foreground">{client.firstname} {client.lastname}</div>
                      <div className="text-xs text-muted-foreground">CI: {client.document_id}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!search.searchingClients && search.hasSearched && search.foundClients.length === 0 && !search.hasSelectedExistingClient && (
            <div className="bg-card shadow-lg border rounded-lg p-2 mb-2">
              <p className="text-xs text-muted-foreground text-center">No se encontraron clientes con esa búsqueda.</p>
            </div>
          )}

          {search.hasSelectedExistingClient && search.selectedExistingClient && (
            <div className={cn('border rounded-lg p-3 shadow-sm relative', selectedCardCls)}>
              {!locked && (
                <Button
                  onClick={search.clearExistingClientSelection}
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar cliente seleccionado"
                  className={cn('absolute top-1 right-1 h-7 w-7', closeBtnCls)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <h5 className={cn('font-semibold text-sm leading-tight mb-1', selectedTextCls)}>{search.selectedExistingClient.firstname} {search.selectedExistingClient.lastname}</h5>
              <p className={cn('text-xs', selectedSubCls)}>CI: {search.selectedExistingClient.document_id} {search.selectedExistingClient.phone && <span>• Cel: {search.selectedExistingClient.phone}</span>}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 items-start">
          <FormInput label="Nombres *" value={newForm.firstname} onChange={e => setNewForm(p => ({ ...p, firstname: e.target.value }))} required autoComplete="given-name" />
          <FormInput label="Apellidos *" value={newForm.lastname} onChange={e => setNewForm(p => ({ ...p, lastname: e.target.value }))} required autoComplete="family-name" />
          <FormInput label="CI/Doc *" value={newForm.document_id} onChange={e => setNewForm(p => ({ ...p, document_id: e.target.value }))} required />
          <FormInput label="Teléfono" value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} autoComplete="tel" />
        </div>
      )}
    </div>
  )
}
