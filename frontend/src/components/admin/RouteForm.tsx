import type React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouteForm } from './route-form/use-route-form'
import { RouteFormHeader } from './route-form/RouteFormHeader'
import { RouteFormFields } from './route-form/RouteFormFields'
import { ScheduleEditor } from './route-form/ScheduleEditor'
import type { RouteFormProps } from './route-form/types'

export default function RouteForm({
  route, loading = false, isEditing = false, onSubmit, onCancel,
}: RouteFormProps) {
  const s = useRouteForm(route)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (s.sameLocationError) return
    onSubmit({
      ...s.form,
      schedules: s.localSchedules.map((sch) => ({
        id: sch.id || null,
        departure_time: sch.departure_time,
        is_active: sch.is_active,
        _isNew: sch._isNew || false,
      })),
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
      <RouteFormHeader isEditing={isEditing} onCancel={onCancel} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
        <RouteFormFields
          form={s.form}
          setForm={s.setForm}
          locations={s.locations}
          availableDestinations={s.availableDestinations}
          sameLocationError={s.sameLocationError}
        />

        <ScheduleEditor
          newScheduleTime={s.newScheduleTime}
          setNewScheduleTime={s.setNewScheduleTime}
          scheduleError={s.scheduleError}
          sortedLocalSchedules={s.sortedLocalSchedules}
          onAdd={s.addLocalSchedule}
          onToggle={s.toggleScheduleActive}
          onRemove={s.removeLocalSchedule}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl font-bold px-6 h-12 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || s.sameLocationError}
            className="rounded-xl font-bold px-10 h-12 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </div>
            ) : (
              <span>{isEditing ? 'Actualizar Ruta' : 'Crear Ruta'}</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
