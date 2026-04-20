import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'

interface Props {
  onRefresh: () => void
  onCreate: () => void
}

export function UserTableToolbar({ onRefresh, onCreate }: Props) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          aria-label="Actualizar lista"
          title="Actualizar lista"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
        <Button onClick={onCreate} size="sm" aria-label="Crear nuevo usuario">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Usuario
        </Button>
      </div>
    </div>
  )
}
