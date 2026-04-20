export interface UserRecord {
  id: number | string
  username?: string
  firstname?: string
  lastname?: string
  email?: string
  role?: string
  is_active?: boolean
  created_at?: string
}

export interface UserTablePagination {
  total: number
  skip: number
  limit: number
  pages: number
}

export interface UserTableProps {
  users: UserRecord[]
  loading?: boolean
  error?: string | null
  roles?: string[]
  pagination?: UserTablePagination
  currentPage?: number
  onRefresh: () => void
  onCreate: () => void
  onView: (user: UserRecord) => void
  onEdit: (user: UserRecord) => void
  onDelete: (user: UserRecord) => void
  onActivate: (user: UserRecord) => void
  onDeactivate: (user: UserRecord) => void
  onPageChange: (page: number) => void
  onFilterChange: (filters: { role?: string; is_active?: boolean }) => void
  onSearch: (term: string) => void
}
