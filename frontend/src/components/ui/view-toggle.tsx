import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
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
          <Button
            type="button"
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              'h-7 rounded-md px-2.5 text-sm',
              isActive
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            aria-label={option.ariaLabel}
            title={option.ariaLabel}
          >
            {option.icon && (
              <span className="flex items-center justify-center">
                {option.icon}
              </span>
            )}
            {option.label && <span>{option.label}</span>}
          </Button>
        )
      })}
    </div>
  )
}
