export type ViewMode = 'category' | 'search'
export type CategoryId = 'client' | 'ticket' | 'trip' | 'package'

export interface Category {
  id: CategoryId
  label: string
  plural: string
  description: string
  icon: React.ReactNode
  placeholder: string
  color: string
  bgColor: string
}

export interface SearchResult {
  id: number
  title: string
  subtitle: string
  category: CategoryId
  data: unknown
}
