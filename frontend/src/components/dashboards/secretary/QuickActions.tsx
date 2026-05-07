import { ClickableCard } from '@/components/ui/clickable-card'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  iconBg?: string
  hoverBorder?: string
  textHover?: string
  onClick: () => void
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {actions.map((action) => (
        <ClickableCard
          key={action.id}
          ariaLabel={`${action.label}: ${action.description}`}
          onClick={action.onClick}
          className="group p-4 border bg-card hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0 group-hover:bg-primary/15 transition-colors">
              {action.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">{action.label}</h3>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
          </div>
        </ClickableCard>
      ))}
    </div>
  )
}

export type { QuickAction }
