import type React from 'react'
import { cn } from '@/lib/utils'
import { useBusForm } from './bus-form/use-bus-form'
import { BusFormHeader } from './bus-form/BusFormHeader'
import { BusFormStep1 } from './bus-form/BusFormStep1'
import { BusFormStep2 } from './bus-form/BusFormStep2'
import type { BusFormProps } from './bus-form/types'

export default function BusForm({
  bus, loading = false, isEditing = false, existingSeats = [], onSubmit, onCancel,
}: BusFormProps) {
  const s = useBusForm(bus, isEditing, existingSeats)

  const goToStep2 = () => {
    if (s.validateStep1()) s.setCurrentStep(2)
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!s.validateStep1()) return
    if (isEditing) onSubmit(s.buildPayload(false))
    else s.setCurrentStep(2)
  }

  const handleSaveBus = () => {
    if (s.seats.length === 0) return
    onSubmit(s.buildPayload(true))
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-h-[90vh] overflow-hidden flex flex-col',
      s.currentStep === 2 ? 'max-w-5xl' : 'max-w-md',
    )}>
      <BusFormHeader
        isEditing={isEditing}
        currentStep={s.currentStep}
        canGoToStep2={s.canGoToStep2}
        loading={loading}
        onCancel={onCancel}
        onGoStep1={() => s.setCurrentStep(1)}
        onGoStep2={goToStep2}
      />

      {s.currentStep === 1 && (
        <BusFormStep1
          form={s.form}
          setForm={s.setForm}
          owners={s.owners}
          loadingOwners={s.loadingOwners}
          errors={s.errors}
          isEditing={isEditing}
          loading={loading}
          onSubmit={handleStep1Submit}
          onCancel={onCancel}
          onGoStep2={goToStep2}
        />
      )}

      {s.currentStep === 2 && (
        <BusFormStep2
          floors={s.form.floors}
          activeDeck={s.activeDeck}
          setActiveDeck={s.setActiveDeck}
          seats={s.seats}
          setSeats={s.setSeats}
          rowsPerDeck={s.rowsPerDeck}
          setRowsPerDeck={s.setRowsPerDeck}
          loading={loading}
          isEditing={isEditing}
          onBack={() => s.setCurrentStep(1)}
          onSave={handleSaveBus}
        />
      )}
    </div>
  )
}
