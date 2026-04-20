import { cn } from '@/lib/utils'

const COLOR_MAP: Record<string, string> = {
  indigo: 'from-indigo-500 to-indigo-600',
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
}

export function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={cn('text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent', COLOR_MAP[color] || COLOR_MAP.indigo)}>
        {value}
      </p>
    </div>
  )
}
