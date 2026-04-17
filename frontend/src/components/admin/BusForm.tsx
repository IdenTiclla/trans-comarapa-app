import React, { useState, useEffect } from 'react'
import SeatLayoutEditor from './SeatLayoutEditor'
import type { SeatPos } from './SeatLayoutEditor'
import { cn } from '@/lib/utils'
import { ownerService } from '@/services/owner.service'
import { Button } from '@/components/ui/button'
import { X, LayoutGrid, ChevronRight, Loader2, AlertTriangle, ChevronLeft, Bus as BusIcon, Info, Map as MapIcon } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'

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
        <div className={cn("bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-h-[90vh] overflow-hidden flex flex-col", currentStep === 2 ? 'max-w-5xl' : 'max-w-md')}>
            <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-gray-800 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <BusIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">
                                {isEditing ? 'Editar Bus' : 'Nuevo Bus'}
                            </h3>
                            <p className="text-gray-400 text-xs font-medium">
                                Paso {currentStep} de 2: {currentStep === 1 ? 'Datos Básicos' : 'Planilla de Asientos'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-center">
                    <div className="flex items-center w-full max-w-xs justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2 z-0"></div>
                        
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="relative z-10 group"
                            disabled={loading}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                                currentStep >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-700 text-gray-500'
                            )}>
                                <Info className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors",
                                currentStep >= 1 ? 'text-primary' : 'text-gray-500'
                            )}>
                                Datos
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={goToStep2}
                            className="relative z-10 group"
                            disabled={loading || !canGoToStep2}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                                currentStep >= 2 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-700 text-gray-500'
                            )}>
                                <MapIcon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors",
                                currentStep >= 2 ? 'text-primary' : 'text-gray-500'
                            )}>
                                Planilla
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {currentStep === 1 && (
                <form onSubmit={handleStep1Submit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
                    <FormInput
                        label="Placa *"
                        id="license_plate"
                        value={form.license_plate}
                        onChange={(e) => setForm({ ...form, license_plate: e.target.value.toUpperCase() })}
                        required
                        maxLength={10}
                        placeholder="Ej: 2312ABX"
                        error={errors.license_plate}
                    />

                    <FormInput
                        label="Modelo *"
                        id="model"
                        value={form.model}
                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                        required
                        maxLength={100}
                        placeholder="Ej: Sprinter 515"
                        error={errors.model}
                    />

                    <FormInput
                        label="Marca"
                        id="brand"
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        maxLength={50}
                        placeholder="Ej: Mercedes-Benz"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Color"
                            id="color"
                            value={form.color}
                            onChange={(val) => setForm({ ...form, color: val })}
                            options={COLORS.map(c => ({ label: c, value: c }))}
                            placeholder="Seleccionar..."
                        />

                        <FormSelect
                            label="Pisos *"
                            id="floors"
                            value={form.floors}
                            onChange={(val) => setForm({ ...form, floors: Number(val) })}
                            required
                            options={[
                                { label: '1 Piso', value: 1 },
                                { label: '2 Pisos', value: 2 }
                            ]}
                        />
                    </div>

                    <FormSelect
                        label="Dueño del Bus"
                        id="owner_id"
                        value={form.owner_id || ''}
                        onChange={(val) => setForm({ ...form, owner_id: val ? Number(val) : null })}
                        disabled={loadingOwners}
                        options={owners.map(owner => ({
                            label: `${owner.firstname} ${owner.lastname}${owner.phone ? ` - ${owner.phone}` : ''}`,
                            value: owner.id
                        }))}
                        placeholder="Sin dueño asignado"
                    />
                    {loadingOwners && <p className="text-[10px] text-primary animate-pulse font-bold uppercase tracking-widest">Cargando dueños...</p>}

                    {isEditing && (
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Capacidad actual</p>
                                    <p className="text-2xl font-black text-gray-900">{form.capacity} asientos</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goToStep2}
                                    className="rounded-xl border-primary/20 text-primary hover:bg-primary/10"
                                >
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    Editar Planilla
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                            className="rounded-xl px-6 h-12 font-bold"
                        >
                            Cancelar
                        </Button>
                        {isEditing ? (
                            <Button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar'}
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20"
                            >
                                Siguiente
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
