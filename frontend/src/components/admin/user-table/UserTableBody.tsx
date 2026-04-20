/* eslint-disable no-restricted-syntax */
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import SkeletonLoader from '@/components/common/SkeletonLoader'
import EmptyState from '@/components/common/EmptyState'
import { UserTableRow } from './UserTableRow'
import type { UserRecord } from './types'

interface Props {
  users: UserRecord[]
  loading: boolean
  error: string | null
  hasFilters: boolean
  onRefresh: () => void
  onView: (u: UserRecord) => void
  onEdit: (u: UserRecord) => void
  onDelete: (u: UserRecord) => void
  onActivate: (u: UserRecord) => void
  onDeactivate: (u: UserRecord) => void
}

export function UserTableBody({
  users, loading, error, hasFilters, onRefresh,
  onView, onEdit, onDelete, onActivate, onDeactivate,
}: Props) {
  return (
    <div className="overflow-x-auto min-h-[300px]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Rol</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Creado</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skel-${i}`}>
                <td colSpan={6} className="px-6 py-4">
                  <SkeletonLoader className="h-10 w-full" />
                </td>
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center">
                <div className="flex justify-center text-red-500 mb-2">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <p className="text-sm text-red-500">{error}</p>
                <Button variant="link" onClick={onRefresh} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                  Intentar nuevamente
                </Button>
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8">
                <EmptyState
                  title="No se encontraron usuarios"
                  description={hasFilters ? 'Prueba a cambiar los filtros de búsqueda' : ''}
                />
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
