import { cn } from '@/lib/utils'

interface ProfileSkeletonProps {
  className?: string
}

export default function ProfileSkeleton({ className }: ProfileSkeletonProps) {
  return (
    <div className={cn('animate-pulse w-full max-w-2xl mx-auto', className)}>
      {/* Avatar + Name */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  )
}
