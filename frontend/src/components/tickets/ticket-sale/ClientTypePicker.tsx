import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const OPTIONS = ['existing', 'new'] as const
type ClientType = typeof OPTIONS[number]

interface Props {
  value: ClientType
  onChange: (v: ClientType) => void
}

function PickerOption({
  active, title, subtitle, onClick, optionId,
}: { active: boolean; title: string; subtitle: string; onClick: () => void; optionId: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      role="radio"
      id={optionId}
      aria-checked={active}
      className={cn(
        'flex h-auto min-h-20 items-center justify-start rounded-lg border-2 p-4 text-left transition-all whitespace-normal',
        active ? 'border-primary bg-primary/10 hover:bg-primary/10' : 'border-border hover:bg-muted/50',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex-shrink-0">
          <div className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border-2',
            active ? 'border-primary bg-primary' : 'border-muted-foreground/40',
          )}>
            {active && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </Button>
  )
}

export function ClientTypePicker({ value, onChange }: Props) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = OPTIONS.indexOf(value)
      let nextIdx: number | null = null

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        nextIdx = (idx + 1) % OPTIONS.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        nextIdx = (idx - 1 + OPTIONS.length) % OPTIONS.length
      }

      if (nextIdx !== null) {
        const next = OPTIONS[nextIdx]
        onChange(next)
        document.getElementById(`client-type-${next}`)?.focus()
      }
    },
    [value, onChange],
  )

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" role="radiogroup" aria-label="Tipo de cliente" tabIndex={0} onKeyDown={handleKeyDown}>
      <PickerOption
        optionId="client-type-existing"
        active={value === 'existing'}
        title="Cliente Existente"
        subtitle="Buscar en base"
        onClick={() => onChange('existing')}
      />
      <PickerOption
        optionId="client-type-new"
        active={value === 'new'}
        title="Cliente Nuevo"
        subtitle="Crear registro"
        onClick={() => onChange('new')}
      />
    </div>
  )
}
