import { ClickableCard } from '@/components/ui/clickable-card'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  iconBg: string
  hoverBorder: string
  textHover: string
  onClick: () => void
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => (
        <ClickableCard
          key={action.id}
          ariaLabel={`${action.label}: ${action.description}`}
          onClick={action.onClick}
          className={`group p-4 lg:p-6 shadow-lg hover:shadow-xl duration-300 border-gray-200 ${action.hoverBorder} transform hover:-translate-y-1`}
        >
          <div className="flex items-center space-x-3 lg:space-x-4 px-4 lg:px-0">
            <div className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 ${action.iconBg} rounded-xl transition-colors flex-shrink-0`}>
              {action.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-base lg:text-lg font-semibold text-gray-900 ${action.textHover} transition-colors truncate`}>
                {action.label}
              </h3>
              <p className="text-gray-600 text-sm truncate">{action.description}</p>
            </div>
          </div>
        </ClickableCard>
      ))}
    </div>
  )
}

export type { QuickAction }
