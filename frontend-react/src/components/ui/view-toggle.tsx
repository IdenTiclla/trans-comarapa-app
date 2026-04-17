import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ViewOption<T extends string> {
  value: T
  icon?: ReactNode
  label?: string
  ariaLabel: string
}

export interface ViewToggleProps<T extends string> {
  value: T
  options: ViewOption<T>[]
  onChange: (value: T) => void
}

export function ViewToggle<T extends string>({ value, options, onChange }: ViewToggleProps<T>) {
  return (
    <div className="bg-muted/50 rounded-lg p-0.5 flex items-center">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center rounded-md transition-all px-2.5 py-1 text-sm font-medium',
              isActive
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            aria-label={option.ariaLabel}
            title={option.ariaLabel}
          >
            {option.icon && (
                <span className={cn('flex items-center justify-center', option.label && 'mr-1.5')}>
                    {option.icon}
                </span>
            )}
            {option.label && <span>{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
