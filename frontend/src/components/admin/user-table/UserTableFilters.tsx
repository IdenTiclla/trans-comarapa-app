import { Search } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import { getRoleLabel } from './helpers'

interface Props {
  searchTerm: string
  selectedRole: string
  selectedStatus: string
  roles: string[]
  onSearchChange: (v: string) => void
  onRoleChange: (v: string) => void
  onStatusChange: (v: string) => void
}

export function UserTableFilters({
  searchTerm, selectedRole, selectedStatus, roles,
  onSearchChange, onRoleChange, onStatusChange,
}: Props) {
  return (
    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <FormInput
            label="Buscar"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            type="text"
            placeholder="Nombre, email, usuario..."
            className="pl-9"
          />
          <div className="absolute top-[34px] left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="w-40">
          <FormSelect
            label="Rol"
            value={selectedRole}
            onChange={onRoleChange}
            options={[
              { value: '', label: 'Todos' },
              ...roles.map((role) => ({ value: role, label: getRoleLabel(role) })),
            ]}
          />
        </div>
        <div className="w-40">
          <FormSelect
            label="Estado"
            value={selectedStatus}
            onChange={onStatusChange}
            options={[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Activos' },
              { value: 'false', label: 'Inactivos' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
