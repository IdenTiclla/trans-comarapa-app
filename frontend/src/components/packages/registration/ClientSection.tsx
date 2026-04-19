import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ClientSearchLike {
  clientType: string
  setClientType: (v: any) => void
  clientSearchQuery: string
  searchClients: (q: string) => void
  searchingClients: boolean
  foundClients: any[]
  hasSearched: boolean
  hasSelectedExistingClient: boolean
  selectedExistingClient: any
  selectExistingClient: (c: any) => void
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
  headerExtra?: React.ReactNode
  icon: React.ReactNode
}

export function ClientSection({ title, color, search, newForm, setNewForm, headerExtra, icon }: Props) {
  const activeCls = color === 'blue' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-green-500 bg-green-50 text-green-700'
  const selectedCardCls = color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
  const selectedTextCls = color === 'blue' ? 'text-blue-900' : 'text-green-900'
  const selectedSubCls = color === 'blue' ? 'text-blue-700' : 'text-green-700'
  const closeBtnCls = color === 'blue' ? 'text-blue-400 hover:text-blue-700' : 'text-green-400 hover:text-green-700'
  const spinnerCls = color === 'blue' ? 'border-blue-600' : 'border-green-600'
  const itemHoverCls = color === 'blue' ? 'hover:bg-blue-50' : 'hover:bg-green-50'

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-900 flex items-center uppercase tracking-wide">
          {icon}
          {title}
        </h4>
        {headerExtra}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <label className={cn('flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm font-medium',
          search.clientType === 'existing' ? activeCls : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
          <input type="radio" checked={search.clientType === 'existing'} onChange={() => search.setClientType('existing')} className="sr-only" />
          Cliente Existente
        </label>
        <label className={cn('flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm font-medium',
          search.clientType === 'new' ? activeCls : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
          <input type="radio" checked={search.clientType === 'new'} onChange={() => search.setClientType('new')} className="sr-only" />
          Cliente Nuevo
        </label>
      </div>

      {search.clientType === 'existing' ? (
        <div className="flex-1 flex flex-col relative w-full h-full min-h-[140px]">
          <div className="mb-2">
            <FormInput
              value={search.clientSearchQuery}
              onChange={(e) => search.searchClients(e.target.value)}
              placeholder="Buscar por nombre, apellido o CI..."
            />
          </div>

          {search.searchingClients ? (
            <div className="flex items-center justify-center py-4">
              <div className={cn('animate-spin rounded-full h-6 w-6 border-b-2', spinnerCls)}></div>
            </div>
          ) : search.hasSearched && search.foundClients.length > 0 && !search.hasSelectedExistingClient ? (
            <div className="absolute z-10 w-full top-[42px] bg-white shadow-lg border border-gray-200 rounded-lg">
              <div className="max-h-32 overflow-y-auto">
                {search.foundClients.map(client => (
                  <div key={client.id} onClick={() => search.selectExistingClient(client)}
                    className={cn('p-2 border-b border-gray-100 cursor-pointer transition-all text-sm', itemHoverCls)}>
                    <div className="font-medium text-gray-900">{client.firstname} {client.lastname}</div>
                    <div className="text-xs text-gray-500">CI: {client.document_id}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : search.hasSearched && search.foundClients.length === 0 && !search.hasSelectedExistingClient ? (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500">No se encontraron clientes.</p>
            </div>
          ) : null}

          {search.hasSelectedExistingClient && search.selectedExistingClient && (
            <div className={cn('border rounded-lg p-3 mt-1 shadow-sm relative', selectedCardCls)}>
              <Button
                onClick={search.clearExistingClientSelection}
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar cliente seleccionado"
                className={cn('absolute top-1 right-1 h-7 w-7', closeBtnCls)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
              </Button>
              <h5 className={cn('font-semibold text-sm leading-tight mb-1', selectedTextCls)}>{search.selectedExistingClient.firstname} {search.selectedExistingClient.lastname}</h5>
              <p className={cn('text-xs', selectedSubCls)}>CI: {search.selectedExistingClient.document_id} {search.selectedExistingClient.phone && <span>• Cel: {search.selectedExistingClient.phone}</span>}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 h-full min-h-[140px] items-start">
          <FormInput label="Nombres *" value={newForm.firstname} onChange={e => setNewForm(p => ({ ...p, firstname: e.target.value }))} required />
          <FormInput label="Apellidos *" value={newForm.lastname} onChange={e => setNewForm(p => ({ ...p, lastname: e.target.value }))} required />
          <FormInput label="CI/Doc *" value={newForm.document_id} onChange={e => setNewForm(p => ({ ...p, document_id: e.target.value }))} required />
          <FormInput label="Teléfono" value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} />
        </div>
      )}
    </div>
  )
}
