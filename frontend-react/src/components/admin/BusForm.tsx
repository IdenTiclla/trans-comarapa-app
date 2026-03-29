import React, { useState, useEffect } from 'react'
import SeatLayoutEditor from './SeatLayoutEditor'
import type { SeatPos } from './SeatLayoutEditor'
import { cn } from '@/lib/utils'
import { ownerService } from '@/services/owner.service'
import { Button } from '@/components/ui/button'
import { X, LayoutGrid, ChevronRight, Loader2, AlertTriangle, ChevronLeft } from 'lucide-react'

interface Owner {
    id: number
    firstname: string
    lastname: string
    phone?: string
    email?: string
}

interface BusFormProps {
    bus?: any
    loading?: boolean
    isEditing?: boolean
    existingSeats?: any[]
    onSubmit: (busData: any) => void
    onCancel: () => void
}

const COLORS = [
    'Blanco', 'Negro', 'Gris', 'Plateado', 'Rojo', 'Azul', 'Verde',
    'Amarillo', 'Naranja', 'Celeste', 'Morado', 'Rosa', 'Marron', 'Beige', 'Dorado'
]

export default function BusForm({
    bus,
    loading = false,
    isEditing = false,
    existingSeats = [],
    onSubmit,
    onCancel
}: BusFormProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [activeDeck, setActiveDeck] = useState<'FIRST' | 'SECOND'>('FIRST')

    const [form, setForm] = useState({
        license_plate: '',
        capacity: 0,
        model: '',
        brand: '',
        color: '',
        floors: 1,
        owner_id: null as number | null
    })

    const [owners, setOwners] = useState<Owner[]>([])
    const [loadingOwners, setLoadingOwners] = useState(false)

    const [seats, setSeats] = useState<SeatPos[]>([])

    const [rowsPerDeck, setRowsPerDeck] = useState({
        FIRST: 10,
        SECOND: 10
    })

    const [errors, setErrors] = useState({
        license_plate: '',
        model: ''
    })

    useEffect(() => {
        const fetchOwners = async () => {
            setLoadingOwners(true)
            try {
                const response = await ownerService.getAll()
                setOwners(response)
            } catch (error) {
                console.error('Error fetching owners:', error)
            } finally {
                setLoadingOwners(false)
            }
        }
        fetchOwners()
    }, [])

    useEffect(() => {
        if (bus) {
            setForm({
                license_plate: bus.license_plate || '',
                capacity: bus.capacity || 0,
                model: bus.model || '',
                brand: bus.brand || '',
                color: bus.color || '',
                floors: bus.floors || 1,
                owner_id: bus.owner_id || null
            })
        } else {
            setForm({
                license_plate: '',
                capacity: 0,
                model: '',
                brand: '',
                color: '',
                floors: 1,
                owner_id: null
            })
        }

        setCurrentStep(1)
        setActiveDeck('FIRST')

        if (isEditing && existingSeats.length > 0) {
            const mappedSeats = existingSeats.map(seat => ({
                seat_number: seat.seat_number,
                deck: seat.deck,
                row: seat.row,
                column: seat.column
            }))
            setSeats(mappedSeats)

            const firstDeckSeats = mappedSeats.filter(s => s.deck === 'FIRST')
            const secondDeckSeats = mappedSeats.filter(s => s.deck === 'SECOND')

            setRowsPerDeck({
                FIRST: firstDeckSeats.length > 0 ? Math.max(...firstDeckSeats.map(s => s.row), 10) : 10,
                SECOND: secondDeckSeats.length > 0 ? Math.max(...secondDeckSeats.map(s => s.row), 10) : 10
            })
        } else {
            setSeats([])
            setRowsPerDeck({ FIRST: 10, SECOND: 10 })
        }
    }, [bus, isEditing, existingSeats])

    const canGoToStep2 = form.license_plate.trim() !== '' && form.model.trim() !== ''

    const validateStep1 = () => {
        let isValid = true
        const newErrors = { license_plate: '', model: '' }

        if (!form.license_plate || form.license_plate.trim() === '') {
            newErrors.license_plate = 'La placa es requerida'
            isValid = false
        }
        if (!form.model || form.model.trim() === '') {
            newErrors.model = 'El modelo es requerido'
            isValid = false
        }
        setErrors(newErrors)
        return isValid
    }

    const goToStep2 = () => {
        if (validateStep1()) {
            setCurrentStep(2)
        }
    }

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep1()) return

        if (isEditing) {
            const busData = {
                ...form,
                license_plate: form.license_plate.toUpperCase().trim(),
                model: form.model.trim(),
                brand: form.brand?.trim() || null,
                color: form.color || null,
                owner_id: form.owner_id
            }
            onSubmit(busData)
        } else {
            setCurrentStep(2)
        }
    }

    const handleSaveBus = () => {
        if (seats.length === 0) return

        const busData = {
            ...form,
            license_plate: form.license_plate.toUpperCase().trim(),
            capacity: seats.length,
            model: form.model.trim(),
            brand: form.brand?.trim() || null,
            color: form.color || null,
            owner_id: form.owner_id,
            seats: seats,
            seatsModified: isEditing
        }
        onSubmit(busData)
    }

    const firstDeckSeatCount = seats.filter(s => s.deck === 'FIRST').length
    const secondDeckSeatCount = seats.filter(s => s.deck === 'SECOND').length
    const totalSeatCount = seats.length

    return (
        <div className={cn("bg-card rounded-xl shadow-2xl border w-full max-h-[90vh] overflow-y-auto", currentStep === 2 ? 'max-w-4xl' : 'max-w-md')}>
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isEditing ? 'Editar Bus' : 'Nuevo Bus'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Paso {currentStep} de 2: {currentStep === 1 ? 'Datos Básicos' : 'Planilla de Asientos'}
                        </p>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="mt-4">
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="flex items-center focus:outline-none"
                            disabled={loading}
                        >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors", currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600')}>
                                1
                            </div>
                            <span className={cn("ml-2 text-sm font-medium", currentStep >= 1 ? 'text-primary' : 'text-gray-500')}>
                                Datos
                            </span>
                        </button>
                        <div className={cn("w-16 h-0.5 mx-3", currentStep >= 2 ? 'bg-primary' : 'bg-gray-200')}></div>
                        <button
                            type="button"
                            onClick={goToStep2}
                            className="flex items-center focus:outline-none"
                            disabled={loading || !canGoToStep2}
                        >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors", currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600')}>
                                2
                            </div>
                            <span className={cn("ml-2 text-sm font-medium", currentStep >= 2 ? 'text-primary' : 'text-gray-500')}>
                                Planilla
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {currentStep === 1 && (
                <form onSubmit={handleStep1Submit} className="px-6 py-4 space-y-4">
                    <div>
                        <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700">
                            Placa <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="license_plate"
                            value={form.license_plate}
                            onChange={(e) => setForm({ ...form, license_plate: e.target.value })}
                            type="text"
                            required
                            maxLength={10}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary sm:text-sm uppercase"
                            placeholder="Ej: 2312ABX"
                        />
                        {errors.license_plate && <p className="mt-1 text-sm text-red-600">{errors.license_plate}</p>}
                    </div>

                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                            Modelo <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="model"
                            value={form.model}
                            onChange={(e) => setForm({ ...form, model: e.target.value })}
                            type="text"
                            required
                            maxLength={100}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary sm:text-sm"
                            placeholder="Ej: Sprinter 515"
                        />
                        {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                    </div>

                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
                        <input
                            id="brand"
                            value={form.brand}
                            onChange={(e) => setForm({ ...form, brand: e.target.value })}
                            type="text"
                            maxLength={50}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary sm:text-sm"
                            placeholder="Ej: Mercedes-Benz"
                        />
                    </div>

                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                        <select
                            id="color"
                            value={form.color}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary sm:text-sm"
                        >
                            <option value="">Seleccionar color</option>
                            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="floors" className="block text-sm font-medium text-gray-700">
                            Número de Pisos <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="floors"
                            value={form.floors}
                            onChange={(e) => setForm({ ...form, floors: parseInt(e.target.value) })}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary sm:text-sm"
                        >
                            <option value={1}>1 Piso</option>
                            <option value={2}>2 Pisos</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            La capacidad se calculará automáticamente basada en la planilla de asientos.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">
                            Dueño del Bus
                        </label>
                        <select
                            id="owner_id"
                            value={form.owner_id || ''}
                            onChange={(e) => setForm({ ...form, owner_id: e.target.value ? parseInt(e.target.value) : null })}
                            disabled={loadingOwners}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Sin dueño asignado</option>
                            {owners.map(owner => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.firstname} {owner.lastname}{owner.phone ? ` - ${owner.phone}` : ''}
                                </option>
                            ))}
                        </select>
                        {loadingOwners && (
                            <p className="mt-1 text-xs text-gray-500">Cargando dueños...</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Capacidad actual</p>
                                    <p className="text-2xl font-bold text-primary">{form.capacity} asientos</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goToStep2}
                                >
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    Editar Planilla
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        {isEditing ? (
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Actualizar
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                Siguiente: Diseñar Planilla
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </form>
            )}

            {currentStep === 2 && (
                <div className="px-6 py-4">
                    {form.floors === 2 && (
                        <div className="mb-4 text-center">
                            <div className="border-b border-gray-200 inline-block">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        type="button"
                                        onClick={() => setActiveDeck('FIRST')}
                                        className={cn("py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap", activeDeck === 'FIRST' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
                                    >
                                        Piso 1
                                        <span className={cn("ml-2 py-0.5 px-2 rounded-full text-xs", activeDeck === 'FIRST' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600')}>
                                            {firstDeckSeatCount}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveDeck('SECOND')}
                                        className={cn("py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap", activeDeck === 'SECOND' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
                                    >
                                        Piso 2
                                        <span className={cn("ml-2 py-0.5 px-2 rounded-full text-xs", activeDeck === 'SECOND' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600')}>
                                            {secondDeckSeatCount}
                                        </span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}

                    <SeatLayoutEditor
                        value={seats}
                        onChange={setSeats}
                        floors={form.floors}
                        deck={activeDeck}
                        initialRows={rowsPerDeck[activeDeck]}
                        onRowsChange={(r) => setRowsPerDeck({ ...rowsPerDeck, [activeDeck]: r })}
                    />

                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Total de asientos: {totalSeatCount}</p>
                                {form.floors === 2 && (
                                    <p className="text-xs text-gray-500">
                                        Piso 1: {firstDeckSeatCount} | Piso 2: {secondDeckSeatCount}
                                    </p>
                                )}
                            </div>
                            {totalSeatCount === 0 && (
                                <div className="text-sm text-amber-600 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Debe agregar al menos un asiento
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between border-t border-gray-200 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                            disabled={loading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveBus}
                            disabled={loading || totalSeatCount === 0}
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? 'Guardar Cambios' : 'Crear Bus'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
