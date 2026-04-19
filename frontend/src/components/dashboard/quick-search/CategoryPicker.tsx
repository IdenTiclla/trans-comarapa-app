import { Button } from '@/components/ui/button'
import { CATEGORIES } from './categories'
import type { CategoryId } from './types'

interface Props {
  onSelect: (id: CategoryId) => void
}

export function CategoryPicker({ onSelect }: Props) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Que deseas buscar?
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            variant="outline"
            onClick={() => onSelect(cat.id)}
            aria-label={`Buscar ${cat.plural}: ${cat.description}`}
            className="h-auto flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 group whitespace-normal"
          >
            <div className={`p-3 rounded-xl ${cat.bgColor} group-hover:scale-110 transition-transform`}>
              <span className={cat.color}>{cat.icon}</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">{cat.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
