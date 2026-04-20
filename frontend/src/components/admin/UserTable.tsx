import { useEffect, useState } from 'react'
import { UserTableToolbar } from './user-table/UserTableToolbar'
import { UserTableFilters } from './user-table/UserTableFilters'
import { UserTableBody } from './user-table/UserTableBody'
import { UserTablePagination } from './user-table/UserTablePagination'
import type { UserTableProps } from './user-table/types'

export default function UserTable({
  users = [],
  loading = false,
  error = null,
  roles = [],
  pagination = { total: 0, skip: 0, limit: 10, pages: 1 },
  currentPage = 1,
  onRefresh,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onPageChange,
  onFilterChange,
  onSearch,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => onSearch(searchTerm), 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, onSearch])

  const applyFilters = (role: string, status: string) => {
    onFilterChange({
      role: role || undefined,
      is_active: status === '' ? undefined : status === 'true',
    })
  }

  const handleRoleChange = (v: string) => {
    setSelectedRole(v)
    applyFilters(v, selectedStatus)
  }
  const handleStatusChange = (v: string) => {
    setSelectedStatus(v)
    applyFilters(selectedRole, v)
  }

  const totalItems = pagination.total || 0
  const totalPages = pagination.pages || 1
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pagination.limit + 1
  const endItem = Math.min(currentPage * pagination.limit, totalItems)
  const hasFilters = Boolean(searchTerm || selectedRole || selectedStatus)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <UserTableToolbar onRefresh={onRefresh} onCreate={onCreate} />
      <UserTableFilters
        searchTerm={searchTerm}
        selectedRole={selectedRole}
        selectedStatus={selectedStatus}
        roles={roles}
        onSearchChange={setSearchTerm}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
      />
      <UserTableBody
        users={users}
        loading={loading}
        error={error}
        hasFilters={hasFilters}
        onRefresh={onRefresh}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />
      <UserTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        onPageChange={onPageChange}
      />
    </div>
  )
}
