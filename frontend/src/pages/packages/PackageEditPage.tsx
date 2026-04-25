import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store'
import type { RootState } from '@/store'
import { fetchPackageById, updatePackage } from '@/store/package.slice'
import { fetchTrips } from '@/store/trip.slice'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

// Note: For editing sender/recipient details, we might need to recreate the ClientSelector component logic
// For simplicity in this edit form, we might just edit the basic fields, since sender/receiver 
// relationship is usually fixed once created, or refer to a full client select.
// But we will follow the vue code's structure closely.

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { currentPackage, loading, error } = useSelector((state: RootState) => state.package)
  const { trips } = useSelector((state: RootState) => state.trip)

  const [formData, setFormData] = useState<Record<string, unknown>>({
    description: '',
    package_type: '',
    weight: '',
    declared_value: '',
    notes: '',
    trip_id: '',
    price: '',
    status: 'pending'
  })

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'registered_at_office', label: 'En Oficina' },
    { value: 'in_transit', label: 'En Tránsito' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
  ]

  useEffect(() => {
    if (id) {
      dispatch(fetchPackageById(Number(id)))
    }
  }, [dispatch, id])

  useEffect(() => {
    dispatch(fetchTrips({ limit: 100, status: 'scheduled' }))
  }, [dispatch])

  useEffect(() => {
    if (currentPackage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        description: currentPackage.description || '',
        package_type: currentPackage.package_type || '',
        weight: currentPackage.weight || '',
        declared_value: currentPackage.declared_value || '',
        notes: currentPackage.notes || '',
        trip_id: currentPackage.trip_id || currentPackage.trip?.id || '',
        price: currentPackage.price || '',
        status: currentPackage.status || 'pending'
      })
    }
  }, [currentPackage])

  const tripOptions = (trips || []).map(trip => ({
    value: trip.id,
    label: `${trip.route?.origin_location?.name || trip.route?.origin} - ${trip.route?.destination_location?.name || trip.route?.destination} (${new Date(trip.departure_date || trip.trip_datetime || trip.departure_datetime).toLocaleDateString()})`
  }))

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      // Clean up empty strings to null for numbers
      if (payload.weight === '') payload.weight = null
      if (payload.declared_value === '') payload.declared_value = null
      if (payload.price === '') payload.price = null
      if (payload.trip_id === '') payload.trip_id = null

      await dispatch(updatePackage({ id: Number(id), data: payload })).unwrap()
      navigate(`/packages/${id}`)
    } catch (err) {
      console.error('Error updating package', err)
    }
  }

  if (loading && !currentPackage) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>Cargando datos de la encomienda...</p>
      </div>
    )
  }

  if (error && !currentPackage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-red-200 text-red-700 p-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Volver" className="mr-4 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800">Editar Encomienda ID: {id}</h1>
        </div>

        <form onSubmit={handleSubmitPackage} className="bg-white p-6 rounded-lg shadow space-y-6">
          <section>
            <h2 className="text-xl font-medium text-gray-700 mb-3">Detalles de la Encomienda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  id="description"
                  label="Descripción Corta"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <FormInput
                  id="package_type"
                  label="Tipo de Paquete"
                  value={formData.package_type}
                  onChange={(e) => setFormData({ ...formData, package_type: e.target.value })}
                />
              </div>
              <div>
                <FormInput
                  type="number"
                  id="weight"
                  label="Peso (kg)"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <FormInput
                  type="number"
                  id="declared_value"
                  label="Valor Declarado (Bs.)"
                  value={formData.declared_value}
                  onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })}
                  step="0.01"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <FormSelect
                  id="status"
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={statusOptions}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-700 mb-3">Viaje Asociado (Opcional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="trip_id" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Viaje</label>
                <FormSelect
                  id="trip_id"
                  value={String(formData.trip_id)}
                  onChange={(val) => setFormData({ ...formData, trip_id: val })}
                  options={[{ value: '', label: 'Ninguno' }, ...tripOptions]}
                />
              </div>
              <div>
                <FormInput
                  type="number"
                  id="price"
                  label="Precio de Envío (Bs.)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  step="0.01"
                />
              </div>
            </div>
          </section>

          <div className="pt-5">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>Guardar Cambios</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
