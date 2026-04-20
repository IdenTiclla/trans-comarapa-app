import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import { formatDate, getEffectiveName, getInitials, getRoleBadgeClass, getRoleLabel } from './helpers'
import type { UserRecord } from './types'

interface Props {
  user: UserRecord
  onView: (u: UserRecord) => void
  onEdit: (u: UserRecord) => void
  onDelete: (u: UserRecord) => void
  onActivate: (u: UserRecord) => void
  onDeactivate: (u: UserRecord) => void
}

export function UserTableRow({ user, onView, onEdit, onDelete, onActivate, onDeactivate }: Props) {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {getInitials(user)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{getEffectiveName(user)}</div>
            <div className="text-sm text-gray-500">@{user.username}</div>
            <div className="text-xs text-gray-500 sm:hidden mt-1">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <span className={cn('px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getRoleBadgeClass(user.role))}>
          {getRoleLabel(user.role)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={cn(
          'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        )}>
          {user.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
        {formatDate(user.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onView(user)} aria-label="Ver detalles" className="h-8 w-8 text-blue-600 hover:text-blue-900">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(user)} aria-label="Editar usuario" className="h-8 w-8 text-indigo-600 hover:text-indigo-900">
            <Pencil className="h-4 w-4" />
          </Button>
          {user.is_active ? (
            <Button variant="ghost" size="icon" onClick={() => onDeactivate(user)} aria-label="Desactivar usuario" className="h-8 w-8 text-yellow-600 hover:text-yellow-900">
              <PowerOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => onActivate(user)} aria-label="Activar usuario" className="h-8 w-8 text-green-600 hover:text-green-900">
              <Power className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onDelete(user)} aria-label="Eliminar usuario" className="h-8 w-8 text-red-600 hover:text-red-900">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
