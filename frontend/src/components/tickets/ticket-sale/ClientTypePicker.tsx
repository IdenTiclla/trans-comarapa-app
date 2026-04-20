import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  value: 'existing' | 'new'
  onChange: (v: 'existing' | 'new') => void
}

function PickerOption({
  active, title, subtitle, onClick,
}: { active: boolean; title: string; subtitle: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      role="radio"
      aria-checked={active}
      className={cn(
        'flex items-center justify-start p-4 border-2 rounded-lg h-auto text-left transition-all',
        active ? 'border-blue-500 bg-blue-50 hover:bg-blue-50' : 'border-gray-200 hover:bg-gray-50',
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
            active ? 'border-blue-500 bg-blue-500' : 'border-gray-300',
          )}>
            {active && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
      </div>
    </Button>
  )
}

export function ClientTypePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4" role="radiogroup" aria-label="Tipo de cliente">
      <PickerOption
        active={value === 'existing'}
        title="Cliente Existente"
        subtitle="Buscar en base"
        onClick={() => onChange('existing')}
      />
      <PickerOption
        active={value === 'new'}
        title="Cliente Nuevo"
        subtitle="Crear registro"
        onClick={() => onChange('new')}
      />
    </div>
  )
}
