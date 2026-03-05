import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full text-gray-400">
          {icon ?? (
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm sm:text-base text-gray-500 mb-6 text-center">{description}</p>}
        {action && <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">{action}</div>}
      </div>
    </div>
  )
}
