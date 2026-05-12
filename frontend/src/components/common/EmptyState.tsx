import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 bg-card rounded-lg border border-border">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-muted rounded-full text-muted-foreground" aria-hidden="true">
          {icon ?? <Inbox className="h-8 w-8" strokeWidth={1.5} />}
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-4 text-center">{description}</p>}
        {action && <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">{action}</div>}
      </div>
    </div>
  )
}
