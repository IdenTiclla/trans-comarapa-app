import React, { useState, useEffect, useMemo } from 'react'
import SeatLayoutEditor, { SeatPos } from './SeatLayoutEditor'
import { cn } from '@/lib/utils'

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
        floors: 1
    })

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
        if (bus) {
            setForm({
                license_plate: bus.license_plate || '',
                capacity: bus.capacity || 0,
                model: bus.model || '',
                brand: bus.brand || '',
                color: bus.color || '',
                floors: bus.floors || 1
            })
        } else {
            setForm({
                license_plate: '',
                capacity: 0,
                model: '',
                brand: '',
                color: '',
                floors: 1
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
            seats: seats,
            seatsModified: isEditing // assuming if we hit here in editing, they saved from step 2
        }
        onSubmit(busData)
    }

    const firstDeckSeatCount = seats.filter(s => s.deck === 'FIRST').length
    const secondDeckSeatCount = seats.filter(s => s.deck === 'SECOND').length
    const totalSeatCount = seats.length

    return (
        <div className={cn("bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto", currentStep === 2 ? 'max-w-4xl' : 'max-w-md')}>
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
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors", currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600')}>
                                1
                            </div>
                            <span className={cn("ml-2 text-sm font-medium", currentStep >= 1 ? 'text-indigo-600' : 'text-gray-500')}>
                                Datos
                            </span>
                        </button>
                        <div className={cn("w-16 h-0.5 mx-3", currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200')}></div>
                        <button
                            type="button"
                            onClick={goToStep2}
                            className="flex items-center focus:outline-none"
                            disabled={loading || !canGoToStep2}
                        >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors", currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600')}>
                                2
                            </div>
                            <span className={cn("ml-2 text-sm font-medium", currentStep >= 2 ? 'text-indigo-600' : 'text-gray-500')}>
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Ej: Mercedes-Benz"
                        />
                    </div>

                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                        <select
                            id="color"
                            value={form.color}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value={1}>1 Piso</option>
                            <option value={2}>2 Pisos</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            La capacidad se calculará automáticamente basada en la planilla de asientos.
                        </p>
                    </div>

                    {isEditing && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Capacidad actual</p>
                                    <p className="text-2xl font-bold text-indigo-600">{form.capacity} asientos</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={goToStep2}
                                    className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Editar Planilla
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        {isEditing ? (
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                Actualizar
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                Siguiente: Diseñar Planilla
                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
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
                                        className={cn("py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap", activeDeck === 'FIRST' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
                                    >
                                        Piso 1
                                        <span className={cn("ml-2 py-0.5 px-2 rounded-full text-xs", activeDeck === 'FIRST' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600')}>
                                            {firstDeckSeatCount}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveDeck('SECOND')}
                                        className={cn("py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap", activeDeck === 'SECOND' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
                                    >
                                        Piso 2
                                        <span className={cn("ml-2 py-0.5 px-2 rounded-full text-xs", activeDeck === 'SECOND' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600')}>
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

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Debe agregar al menos un asiento
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between border-t border-gray-200 mt-4">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Anterior
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveBus}
                            disabled={loading || totalSeatCount === 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isEditing ? 'Guardar Cambios' : 'Crear Bus'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
