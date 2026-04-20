import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, Loader2, AlertTriangle } from 'lucide-react'
import SeatLayoutEditor, { type SeatPos } from '../SeatLayoutEditor'
import type { Deck } from './types'

interface Props {
  floors: number
  activeDeck: Deck
  setActiveDeck: (d: Deck) => void
  seats: SeatPos[]
  setSeats: (s: SeatPos[]) => void
  rowsPerDeck: Record<Deck, number>
  setRowsPerDeck: (r: Record<Deck, number>) => void
  loading: boolean
  isEditing: boolean
  onBack: () => void
  onSave: () => void
}

const DeckTab = ({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) => (
  <Button
    type="button"
    variant="ghost"
    onClick={onClick}
    aria-label={`Seleccionar ${label}`}
    aria-selected={active}
    role="tab"
    className={cn(
      'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap rounded-none h-auto hover:bg-transparent',
      active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    )}
  >
    {label}
    <span className={cn('ml-2 py-0.5 px-2 rounded-full text-xs', active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600')}>
      {count}
    </span>
  </Button>
)

export function BusFormStep2({
  floors, activeDeck, setActiveDeck, seats, setSeats, rowsPerDeck, setRowsPerDeck,
  loading, isEditing, onBack, onSave,
}: Props) {
  const firstCount = seats.filter((s) => s.deck === 'FIRST').length
  const secondCount = seats.filter((s) => s.deck === 'SECOND').length
  const total = seats.length

  return (
    <div className="px-6 py-4">
      {floors === 2 && (
        <div className="mb-4 text-center">
          <div className="border-b border-gray-200 inline-block">
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role */}
            <nav className="-mb-px flex space-x-8" role="tablist">
              <DeckTab label="Piso 1" active={activeDeck === 'FIRST'} count={firstCount} onClick={() => setActiveDeck('FIRST')} />
              <DeckTab label="Piso 2" active={activeDeck === 'SECOND'} count={secondCount} onClick={() => setActiveDeck('SECOND')} />
            </nav>
          </div>
        </div>
      )}

      <SeatLayoutEditor
        value={seats}
        onChange={setSeats}
        floors={floors}
        deck={activeDeck}
        initialRows={rowsPerDeck[activeDeck]}
        onRowsChange={(r) => setRowsPerDeck({ ...rowsPerDeck, [activeDeck]: r })}
      />

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Total de asientos: {total}</p>
            {floors === 2 && (
              <p className="text-xs text-gray-500">Piso 1: {firstCount} | Piso 2: {secondCount}</p>
            )}
          </div>
          {total === 0 && (
            <div className="text-sm text-amber-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Debe agregar al menos un asiento
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex justify-between border-t border-gray-200 mt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button type="button" onClick={onSave} disabled={loading || total === 0}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Guardar Cambios' : 'Crear Bus'}
        </Button>
      </div>
    </div>
  )
}
