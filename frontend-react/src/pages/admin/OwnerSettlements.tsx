import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ownerService } from '@/services/owner.service'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, ExternalLink, Banknote } from 'lucide-react'

function fmt(value: number): string {
    return `Bs. ${(value ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
}

interface OfficeBreakdown {
    office_id: number
    office_name: string
    tickets_amount: number
    packages_paid_amount: number
    packages_collected_amount: number
    packages_pending_amount: number
    total_collected: number
    withdrawn_amount: number
    available: number
}

interface TripFinancial {
    trip_id: number
    departure_time: string
    route_name: string
    bus_plate: string
    tickets_amount: number
    packages_paid_amount: number
    packages_collected_amount: number
    packages_pending_amount: number
    total_collected: number
    total_withdrawn: number
    available_balance: number
    office_breakdown: OfficeBreakdown[]
}

export function Component() {
    const { user } = useAuth()
    const officeId = user?.office_id

    const [owners, setOwners] = useState<any[]>([])
    const [selectedOwnerId, setSelectedOwnerId] = useState<number | ''>('')
    const [financials, setFinancials] = useState<TripFinancial[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingOwners, setLoadingOwners] = useState(true)
    const [expandedTrips, setExpandedTrips] = useState<Set<number>>(new Set())

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [withdrawingTrip, setWithdrawingTrip] = useState<TripFinancial | null>(null)
    const [withdrawingOffice, setWithdrawingOffice] = useState<OfficeBreakdown | null>(null)
    const [amount, setAmount] = useState<string>('0.00')
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        ownerService.getAll()
            .then(data => setOwners(Array.isArray(data) ? data : (data as any).items || []))
            .catch(() => toast.error('Error cargando socios'))
            .finally(() => setLoadingOwners(false))
    }, [])

    useEffect(() => {
        if (!selectedOwnerId) {
            setFinancials([])
            return
        }
        loadFinancials(selectedOwnerId)
    }, [selectedOwnerId])

    const loadFinancials = async (ownerId: number) => {
        setLoading(true)
        try {
            const data = await ownerService.getFinancials(ownerId)
            const trips = Array.isArray(data) ? data : (data as any).trips || []
            setFinancials(trips.map((t: any) => ({
                trip_id: t.trip_id,
                departure_time: t.trip_datetime,
                route_name: `${t.route_origin ?? ''} → ${t.route_destination ?? ''}`,
                bus_plate: t.bus_license_plate,
                tickets_amount: t.tickets_amount ?? 0,
                packages_paid_amount: t.packages_paid_amount ?? 0,
                packages_collected_amount: t.packages_collected_amount ?? 0,
                packages_pending_amount: t.packages_pending_amount ?? 0,
                total_collected: t.total_collected ?? 0,
                total_withdrawn: t.total_withdrawn ?? 0,
                available_balance: t.available_balance ?? 0,
                office_breakdown: (t.office_breakdown ?? []).map((o: any) => ({
                    office_id: o.office_id,
                    office_name: o.office_name ?? 'Sin nombre',
                    tickets_amount: o.tickets_amount ?? 0,
                    packages_paid_amount: o.packages_paid_amount ?? 0,
                    packages_collected_amount: o.packages_collected_amount ?? 0,
                    packages_pending_amount: o.packages_pending_amount ?? 0,
                    total_collected: o.total_collected ?? 0,
                    withdrawn_amount: o.withdrawn_amount ?? 0,
                    available: o.available ?? 0,
                })),
            })))
        } catch (_err) {
            toast.error('Error al cargar datos financieros del socio')
        } finally {
            setLoading(false)
        }
    }

    const toggleTrip = (tripId: number) => {
        setExpandedTrips(prev => {
            const next = new Set(prev)
            if (next.has(tripId)) next.delete(tripId)
            else next.add(tripId)
            return next
        })
    }

    const openWithdrawModal = (trip: TripFinancial, office: OfficeBreakdown) => {
        setWithdrawingTrip(trip)
        setWithdrawingOffice(office)
        setAmount(office.available.toFixed(2))
        setIsModalOpen(true)
    }

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedOwnerId || !withdrawingTrip) return

        if (!withdrawingOffice) {
            toast.error('Debe seleccionar una oficina específica para el retiro.')
            return
        }
        const targetOfficeId = withdrawingOffice.office_id

        const maxAmount = withdrawingOffice.available
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0 || numAmount > maxAmount) {
            toast.error('Monto inválido')
            return
        }

        setProcessing(true)
        try {
            await ownerService.withdraw(selectedOwnerId, {
                trip_id: withdrawingTrip.trip_id,
                amount: numAmount,
                office_id: targetOfficeId
            })
            toast.success('Retiro registrado exitosamente')
            setIsModalOpen(false)
            setWithdrawingTrip(null)
            setWithdrawingOffice(null)
            loadFinancials(selectedOwnerId)
        } catch (err: any) {
            toast.error(err.message || 'Error al procesar el retiro')
        } finally {
            setProcessing(false)
        }
    }

    /** Componente reutilizable: fila de label + valor */
    const StatRow = ({ label, value, color = 'text-gray-900' }: { label: string; value: number; color?: string }) => (
        <div className="flex justify-between items-baseline">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className={`font-semibold text-sm tabular-nums ${color}`}>{fmt(value)}</span>
        </div>
    )

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Liquidación a Socios</h1>
                <p className="text-gray-500 mt-1 text-sm">Gestiona los retiros de dinero de los dueños de buses según sus viajes.</p>
            </div>

            {/* Selector de socio */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Seleccionar Socio</CardTitle>
                    <CardDescription>Escoge el socio para ver su historial financiero.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-sm">
                        {loadingOwners ? (
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                                Cargando socios...
                            </div>
                        ) : (
                            <select
                                value={selectedOwnerId}
                                onChange={(e) => setSelectedOwnerId(e.target.value ? Number(e.target.value) : '')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">-- Selecciona un socio --</option>
                                {owners.map(o => (
                                    <option key={o.id} value={o.id}>{o.firstname} {o.lastname} (CI: {o.ci})</option>
                                ))}
                            </select>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Resumen global */}
            {selectedOwnerId && financials.length > 0 && (() => {
                const totalCollected = financials.reduce((sum, t) => sum + t.total_collected, 0)
                const totalWithdrawn = financials.reduce((sum, t) => sum + t.total_withdrawn, 0)
                const totalAvailable = financials.reduce((sum, t) => sum + t.available_balance, 0)
                const totalPending = financials.reduce((sum, t) => sum + t.packages_pending_amount, 0)
                return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <div className="rounded-lg bg-white border p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase">Recaudado</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">{fmt(totalCollected)}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                            <p className="text-xs font-medium text-red-600 uppercase">Retirado</p>
                            <p className="text-xl font-bold text-red-700 mt-1">{fmt(totalWithdrawn)}</p>
                        </div>
                        <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4">
                            <p className="text-xs font-medium text-indigo-600 uppercase">Disponible</p>
                            <p className="text-xl font-bold text-indigo-700 mt-1">{fmt(totalAvailable)}</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                            <p className="text-xs font-medium text-amber-600 uppercase">Pendiente Cobro</p>
                            <p className="text-xl font-bold text-amber-700 mt-1">{fmt(totalPending)}</p>
                        </div>
                    </div>
                )
            })()}

            {/* Lista de viajes */}
            {selectedOwnerId && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Viajes</h2>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                        </div>
                    ) : financials.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
                            No se encontraron viajes para este socio.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {financials.map(trip => {
                                const isExpanded = expandedTrips.has(trip.trip_id)
                                const myOffice = trip.office_breakdown.find(o => o.office_id === officeId)

                                return (
                                    <Card key={trip.trip_id} className="overflow-hidden">
                                        {/* Cabecera del viaje */}
                                        <button
                                            onClick={() => toggleTrip(trip.trip_id)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b hover:bg-gray-100/60 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {isExpanded
                                                    ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                                                    : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                                                }
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                                                        #{trip.trip_id} · {new Date(trip.departure_time).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{trip.route_name} · Bus {trip.bus_plate}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-4">
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">Disponible</p>
                                                <p className={`text-lg font-bold ${trip.available_balance > 0 ? 'text-indigo-700' : 'text-gray-400'}`}>
                                                    {fmt(trip.available_balance)}
                                                </p>
                                            </div>
                                        </button>

                                        {/* Detalle del viaje (colapsable) */}
                                        {isExpanded && (
                                            <div>
                                                {/* Resumen financiero del viaje */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Resumen del viaje</p>
                                                        <Link to={`/trips/${trip.trip_id}`} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
                                                            Ver viaje <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <StatRow label="Boletos" value={trip.tickets_amount} />
                                                        <StatRow label="Encomiendas pagadas (origen)" value={trip.packages_paid_amount} />
                                                        <StatRow label="Encomiendas cobradas (destino)" value={trip.packages_collected_amount} color="text-emerald-700" />
                                                        <div className="border-t border-dashed border-gray-200 my-1" />
                                                        <div className="flex justify-between items-baseline">
                                                            <span className="text-gray-700 text-sm font-semibold">Total recaudado</span>
                                                            <span className="font-bold text-sm tabular-nums text-gray-900">{fmt(trip.total_collected)}</span>
                                                        </div>
                                                        <StatRow label="Retirado" value={trip.total_withdrawn} color="text-red-600" />
                                                        <div className="border-t border-gray-200 my-1" />
                                                        <div className="flex justify-between items-baseline">
                                                            <span className="text-indigo-700 text-sm font-bold">Disponible para retiro</span>
                                                            <span className="font-bold text-base tabular-nums text-indigo-700">{fmt(trip.available_balance)}</span>
                                                        </div>
                                                        {trip.packages_pending_amount > 0 && (
                                                            <StatRow label="Pendiente de cobro (no retirable)" value={trip.packages_pending_amount} color="text-amber-600" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Desglose por oficina */}
                                                {trip.office_breakdown.length > 0 && (
                                                    <div className="px-4 py-3 bg-slate-50/70">
                                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Desglose por oficina</p>
                                                        <div className="space-y-2">
                                                            {trip.office_breakdown.map(office => {
                                                                const isMine = office.office_id === officeId
                                                                return (
                                                                    <div
                                                                        key={office.office_id}
                                                                        className={`rounded-lg border p-3 ${isMine ? 'bg-white border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-gray-200'}`}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-sm font-semibold text-slate-800">
                                                                                {office.office_name}
                                                                                {isMine && (
                                                                                    <span className="ml-2 text-[10px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Tu oficina</span>
                                                                                )}
                                                                            </span>
                                                                        </div>

                                                                        <div className="space-y-1 text-xs">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-500">Boletos</span>
                                                                                <span className="font-medium text-slate-800 tabular-nums">{fmt(office.tickets_amount)}</span>
                                                                            </div>
                                                                            {office.packages_paid_amount > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-slate-500">Enc. pagadas (origen)</span>
                                                                                    <span className="font-medium text-slate-800 tabular-nums">{fmt(office.packages_paid_amount)}</span>
                                                                                </div>
                                                                            )}
                                                                            {office.packages_collected_amount > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-emerald-600">Enc. cobradas (destino)</span>
                                                                                    <span className="font-medium text-emerald-700 tabular-nums">{fmt(office.packages_collected_amount)}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="border-t border-dashed border-gray-200 my-0.5" />
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-700 font-semibold">Total recaudado</span>
                                                                                <span className="font-bold text-slate-900 tabular-nums">{fmt(office.total_collected)}</span>
                                                                            </div>
                                                                            {office.withdrawn_amount > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-red-500">Retirado</span>
                                                                                    <span className="font-medium text-red-600 tabular-nums">-{fmt(office.withdrawn_amount)}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="border-t border-gray-200 my-0.5" />
                                                                            <div className="flex justify-between">
                                                                                <span className={`font-bold ${office.available > 0 ? 'text-indigo-700' : 'text-gray-400'}`}>Disponible</span>
                                                                                <span className={`font-bold tabular-nums ${office.available > 0 ? 'text-indigo-700' : 'text-gray-400'}`}>{fmt(office.available)}</span>
                                                                            </div>
                                                                            {office.packages_pending_amount > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-amber-500">Pend. de cobro</span>
                                                                                    <span className="font-medium text-amber-600 tabular-nums">{fmt(office.packages_pending_amount)}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {isMine && office.available > 0 && (
                                                                            <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-end">
                                                                                <Button
                                                                                    onClick={() => openWithdrawModal(trip, office)}
                                                                                    size="sm"
                                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1.5"
                                                                                >
                                                                                    <Banknote className="h-3.5 w-3.5" />
                                                                                    Retirar {fmt(office.available)}
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Withdrawal Modal */}
            {isModalOpen && withdrawingTrip && withdrawingOffice && (
                <div className="fixed inset-0 modal-overlay-glass flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Registrar Retiro</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Oficina: {withdrawingOffice.office_name} · Viaje #{withdrawingTrip.trip_id}
                            </p>
                        </div>
                        <form onSubmit={handleWithdraw} className="p-6">
                            <div className="mb-5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                <p className="text-sm text-gray-600 font-medium mb-1">
                                    Disponible en {withdrawingOffice.office_name}
                                </p>
                                <p className="text-2xl font-bold text-indigo-700">
                                    {fmt(withdrawingOffice.available)}
                                </p>
                                <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                                    <div className="flex justify-between">
                                        <span>Boletos</span>
                                        <span className="tabular-nums">{fmt(withdrawingOffice.tickets_amount)}</span>
                                    </div>
                                    {withdrawingOffice.packages_paid_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Enc. pagadas</span>
                                            <span className="tabular-nums">{fmt(withdrawingOffice.packages_paid_amount)}</span>
                                        </div>
                                    )}
                                    {withdrawingOffice.packages_collected_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Enc. cobradas</span>
                                            <span className="tabular-nums">{fmt(withdrawingOffice.packages_collected_amount)}</span>
                                        </div>
                                    )}
                                    {withdrawingOffice.withdrawn_amount > 0 && (
                                        <div className="flex justify-between text-red-500">
                                            <span>Ya retirado</span>
                                            <span className="tabular-nums">-{fmt(withdrawingOffice.withdrawn_amount)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Monto a Retirar (Bs.)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="^\d+(\.\d{0,2})?$"
                                    required
                                    value={amount}
                                    onChange={e => {
                                        const val = e.target.value
                                        if (/^\d*\.?\d{0,2}$/.test(val) || val === '') setAmount(val)
                                    }}
                                    onBlur={() => {
                                        const num = parseFloat(amount)
                                        if (!isNaN(num) && num > 0) setAmount(num.toFixed(2))
                                    }}
                                    className="w-full text-lg rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none font-medium text-gray-900"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setWithdrawingTrip(null)
                                        setWithdrawingOffice(null)
                                    }}
                                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors shadow-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium text-sm disabled:opacity-70 transition-colors shadow-sm shadow-indigo-200"
                                >
                                    {processing ? 'Procesando...' : 'Confirmar Retiro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
