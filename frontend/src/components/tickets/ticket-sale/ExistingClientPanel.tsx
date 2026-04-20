/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { ClickableCard } from '@/components/ui/clickable-card'
import { Loader2, X } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'

interface Props {
  searchTerm: string
  onSearchChange: (v: string) => void
  searching: boolean
  hasSearched: boolean
  foundClients: any[]
  selectedClient: any | null
  hasSelected: boolean
  onSelect: (c: any) => void
  onClear: () => void
}

export function ExistingClientPanel({
  searchTerm, onSearchChange, searching, hasSearched, foundClients,
  selectedClient, hasSelected, onSelect, onClear,
}: Props) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Buscar Cliente"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por nombre, apellido o CI..."
      />

      {searching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : hasSearched && foundClients.length > 0 && !hasSelected ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Resultados encontrados:</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {foundClients.map((client) => (
              <ClickableCard
                key={client.id}
                onClick={() => onSelect(client)}
                ariaLabel={`Seleccionar cliente ${client.firstname} ${client.lastname}`}
                className="p-3 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all gap-0 py-0"
              >
                <div className="font-medium text-gray-900">{client.firstname} {client.lastname}</div>
                <div className="text-sm text-gray-500">CI: {client.document_id}</div>
              </ClickableCard>
            ))}
          </div>
        </div>
      ) : hasSearched && foundClients.length === 0 && !hasSelected ? (
        <div className="text-center py-8">
          <p className="mt-2 text-sm text-gray-500">No se encontraron clientes</p>
        </div>
      ) : null}

      {hasSelected && selectedClient && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-green-800">Cliente seleccionado</h5>
              <p className="text-green-700">{selectedClient.firstname} {selectedClient.lastname}</p>
              <p className="text-sm text-green-600">CI: {selectedClient.document_id}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              aria-label="Quitar cliente seleccionado"
              className="text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
