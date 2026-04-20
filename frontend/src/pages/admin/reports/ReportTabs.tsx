import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Tab } from './constants'

const TABS: Array<[Tab, string]> = [
  ['tickets', 'Boletos'],
  ['packages', 'Encomiendas'],
  ['cash', 'Caja'],
]

export function ReportTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit" role="tablist">
      {TABS.map(([key, label]) => (
        <Button
          key={key}
          variant="ghost"
          role="tab"
          aria-selected={tab === key}
          onClick={() => onChange(key)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors h-auto',
            tab === key ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
