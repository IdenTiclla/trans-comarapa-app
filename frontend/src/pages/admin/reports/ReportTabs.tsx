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
    <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit" role="tablist" aria-label="Tipo de reporte">
      {TABS.map(([key, label]) => (
        <Button
          key={key}
          variant="ghost"
          role="tab"
          id={`report-tab-${key}`}
          aria-selected={tab === key}
          aria-controls={`report-panel-${key}`}
          tabIndex={tab === key ? 0 : -1}
          onClick={() => onChange(key)}
          onKeyDown={(e) => {
            const idx = TABS.findIndex(([k]) => k === key)
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault()
              const next = TABS[(idx + 1) % TABS.length]
              onChange(next[0])
              document.getElementById(`report-tab-${next[0]}`)?.focus()
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault()
              const prev = TABS[(idx - 1 + TABS.length) % TABS.length]
              onChange(prev[0])
              document.getElementById(`report-tab-${prev[0]}`)?.focus()
            }
          }}
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
