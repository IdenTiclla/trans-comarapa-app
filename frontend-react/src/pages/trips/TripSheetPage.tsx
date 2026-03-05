import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { apiFetch } from '@/lib/api'

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const offset = date.getTimezoneOffset()
  const adjusted = new Date(date.getTime() + offset * 60 * 1000)
  return adjusted.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(timeString: string) {
  if (!timeString) return ''
  const parts = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
}

interface Passenger {
  id: number
  state: string
  seat?: { seat_number: number }
  client?: { firstname: string; lastname: string; document_id?: string }
  destination?: string
}

export function Component() {
  const { id } = useParams()
  // The id may be in format "123-sheet" from the route
  const tripId = Number(typeof id === 'string' ? id.replace('-sheet', '') : id)
  const dispatch = useAppDispatch()
  const trip = useAppSelector(selectCurrentTrip) as any
  const loading = useAppSelector(selectTripLoading)
  const error = useAppSelector(selectTripError)

  const [passengersBySeat, setPassengersBySeat] = useState<Record<number, Passenger>>({})
  const [loadingPassengers, setLoadingPassengers] = useState(true)
  const [passError, setPassError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoadingPassengers(true)
      setPassError(null)
      try {
        await dispatch(fetchTripById(tripId))
        const tickets = await apiFetch(`/tickets/trip/${tripId}`)
        const confirmed = (Array.isArray(tickets) ? tickets : [])
          .filter((t: Passenger) => ['confirmed', 'sold', 'paid'].includes(t.state))
          .sort((a: Passenger, b: Passenger) => (a.seat?.seat_number || 0) - (b.seat?.seat_number || 0))
        setPassengersBySeat(confirmed.reduce((acc: Record<number, Passenger>, p: Passenger) => {
          if (p.seat?.seat_number) acc[p.seat.seat_number] = p
          return acc
        }, {}))
      } catch (err: any) {
        setPassError(err?.message || 'Error al cargar la planilla.')
      } finally {
        setLoadingPassengers(false)
      }
    }
    load()
  }, [dispatch, tripId])

  const getPassengerName = (n: number) => {
    const p = passengersBySeat[n]
    return p ? `${p.client?.firstname || ''} ${p.client?.lastname || ''}` : ''
  }
  const getPassengerDoc = (n: number) => passengersBySeat[n]?.client?.document_id || ''
  const getPassengerDest = (n: number) => {
    const p = passengersBySeat[n]
    if (!p) return ''
    if (p.destination?.trim()) return p.destination
    return trip?.route?.destination?.name || trip?.route?.destination || ''
  }

  const isLoading = loading || loadingPassengers
  const hasError = error || passError

  return (
    <div className="bg-white p-4 font-mono">
      {/* Print controls */}
      <div className="no-print mb-6 flex justify-end items-center">
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimir
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-12"><p className="text-gray-500">Cargando planilla de pasajeros...</p></div>}

      {hasError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 no-print">
          <p className="text-sm font-medium text-red-800">{error || passError}</p>
        </div>
      )}

      {trip && !isLoading && !hasError && (
        <div className="passenger-sheet printable-area" style={{ position: 'relative' }}>
          {/* Trip ID */}
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <div className="border border-red-500 p-1 inline-block">
              <p className="text-red-500 text-xs leading-tight">Nº <span className="font-bold text-base">{String(trip.id).padStart(6, '0')}</span></p>
            </div>
          </div>

          {/* Header */}
          <header className="mb-2 flex items-start space-x-4">
            <div className="flex-shrink-0" style={{ width: '25%' }}>
              <h1 className="text-xl font-bold" style={{ fontFamily: '"Times New Roman", Times, serif', letterSpacing: '1px' }}>TRANS</h1>
              <h1 className="text-3xl font-bold -mt-2" style={{ fontFamily: '"Times New Roman", Times, serif', letterSpacing: '1px' }}>COMARAPA</h1>
              <p className="text-xs" style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>SINDICATO MIXTO DE TRANSPORTISTAS</p>
              <p className="text-xs" style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>"MANUEL MARIA CABALLERO"</p>
              <div className="mt-1 text-left text-xs">
                <p style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>OF. STA. CRUZ: 78175576</p>
                <p style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>OF. COMARAPA: 781-75578</p>
              </div>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs font-bold whitespace-nowrap">MAIRANA - YERBA BUENA - AGUA CLARA - LOS NEGROS - MATARAL - QUINE - PALIZADA - SAN ISIDRO - COMARAPA</p>
              <div className="grid grid-cols-2 gap-x-4 mt-1 text-left text-xs">
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Ruta:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.route?.origin?.name || trip.route?.origin} - {trip.route?.destination?.name || trip.route?.destination}</span></div>
                <div />
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Conductor:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.driver?.firstname} {trip.driver?.lastname}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Fecha:</span><span className="border-b border-dotted border-black flex-grow ml-1 text-center">{formatDate(trip.trip_datetime)}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Lic.:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.driver?.license_number || ''}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Hora:</span><span className="border-b border-dotted border-black flex-grow ml-1 text-center">{formatTime(trip.departure_time)}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Ayudante:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.assistant?.firstname} {trip.assistant?.lastname}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Placa:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.bus?.license_plate || 'N/A'}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Cat.:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.driver?.license_type || ''}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Marca:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.bus?.brand || 'N/A'}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Modelo:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.bus?.model || 'N/A'}</span></div>
                <div className="flex items-end"><span className="font-bold min-w-[3rem]">Color:</span><span className="border-b border-dotted border-black flex-grow ml-1">{trip.bus?.color || ''}</span></div>
              </div>
            </div>
          </header>

          {/* Passenger Table */}
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            {/* Left column (1-25) */}
            <div>
              <table className="w-full border-collapse" style={{ borderColor: '#2F855A' }}>
                <thead className="bg-green-100">
                  <tr>
                    <th className="border border-green-600 p-0 text-sm w-10">No.</th>
                    <th className="border border-green-600 p-0 text-sm">Nombre y Apellido</th>
                    <th className="border border-green-600 p-0 text-sm w-20">C.I.</th>
                    <th className="border border-green-600 p-0 text-sm w-24">Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                    <tr key={n}>
                      <td className="border border-green-600 text-center text-xs h-5">{n}</td>
                      <td className="border border-green-600 p-1 text-xs">{getPassengerName(n)}</td>
                      <td className="border border-green-600 p-1 text-xs">{getPassengerDoc(n)}</td>
                      <td className="border border-green-600 p-1 text-xs">{getPassengerDest(n)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Right column (26-50) */}
            <div>
              <table className="w-full border-collapse" style={{ borderColor: '#2F855A' }}>
                <thead className="bg-green-100">
                  <tr>
                    <th className="border border-green-600 p-0 text-sm w-10">No.</th>
                    <th className="border border-green-600 p-0 text-sm">Nombre y Apellido</th>
                    <th className="border border-green-600 p-0 text-sm w-20">C.I.</th>
                    <th className="border border-green-600 p-0 text-sm w-24">Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 25 }, (_, i) => i + 26).map((n) => (
                    <tr key={n}>
                      <td className="border border-green-600 text-center text-xs h-5">{n}</td>
                      <td className="border border-green-600 p-1 text-xs">{getPassengerName(n)}</td>
                      <td className="border border-green-600 p-1 text-xs">{getPassengerDoc(n)}</td>
                      <td className="border border-green-600 p-1 text-xs">{getPassengerDest(n)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!trip && !isLoading && !hasError && (
        <div className="text-center py-12 no-print">
          <p className="text-gray-500">No hay información del viaje o pasajeros para mostrar.</p>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none; }
          body, html { margin: 0; padding: 0; }
          .printable-area { margin: 0; padding: 0; width: 100%; transform: scale(0.95); transform-origin: top left; }
          @page { size: letter landscape; margin: 0.25in; }
        }
        table, th, td { border: 1px solid #2F855A; }
        th, td { padding: 0 2px; text-align: left; font-size: 9px; vertical-align: middle; }
        th { font-weight: bold; }
      `}</style>
    </div>
  )
}
