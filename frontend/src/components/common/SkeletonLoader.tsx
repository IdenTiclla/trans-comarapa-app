import { cn } from '@/lib/utils'

type SkeletonType = 'card' | 'list' | 'table-row' | 'detail' | 'text'

interface SkeletonLoaderProps {
  type?: SkeletonType
  withActions?: boolean
  className?: string
}

export default function SkeletonLoader({ type = 'card', withActions = true, className }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className={cn('animate-pulse w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full', className)}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        {withActions && (
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        )}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={cn('animate-pulse w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200', className)}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded hidden md:block" />
            <div className="h-4 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'table-row') {
    return (
      <tr className={cn('animate-pulse w-full bg-white border-b border-gray-200', className)}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1 w-32">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-24" />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-6 w-16 rounded-full bg-gray-200" />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex justify-end space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </td>
      </tr>
    )
  }

  if (type === 'detail') {
    return (
      <div className={cn('animate-pulse w-full bg-white shadow-md rounded-xl border border-gray-100 p-6', className)}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20 flex-shrink-0" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  // text
  return (
    <div className={cn('animate-pulse w-full space-y-3', className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  )
}
