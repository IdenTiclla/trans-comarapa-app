import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { fetchPackageById, updatePackage } from '@/store/package.slice'
import { getPackageStatusLabel, getPackageStatusBg, getPackageStatusText, getTimelineIconBg, getPaymentStatusLabel, getPaymentStatusBg, getPaymentStatusTextClass } from '@/lib/package-status'
import PackageDeliveryModal from '@/components/packages/PackageDeliveryModal'
import PackageReceptionModal from '@/components/packages/PackageReceptionModal'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<any>()

  const { currentPackage, loading, error } = useSelector((state: RootState) => state.package)
  const getStatusLabel = getPackageStatusLabel
  const getStatusBg = getPackageStatusBg
  const getStatusText = getPackageStatusText

  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showReceptionModal, setShowReceptionModal] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchPackageById(Number(id)))
    }
  }, [dispatch, id])

  const onDeliverPackageConfirm = async () => {
    setShowDeliveryModal(false)
    if (id) dispatch(fetchPackageById(Number(id)))
  }

  const onReceivePackageConfirm = async () => {
    if (id) {
      await dispatch(updatePackage({ id: Number(id), data: { status: 'arrived_at_destination' } })).unwrap()
      setShowReceptionModal(false)
      dispatch(fetchPackageById(Number(id)))
    }
  }

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-BO', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatTripStatus = (status: string | undefined) => {
    if (!status) return 'N/A'
    const map: Record<string, string> = {
      scheduled: 'Programado',
      boarding: 'Abordando',
      departed: 'En camino',
      arrived: 'Llegó',
      cancelled: 'Cancelado',
      delayed: 'Retrasado',
    }
    return map[status] || status
  }

  if (loading && !currentPackage) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentPackage || error) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Encomienda no encontrada</h3>
        <p className="mt-2 text-gray-500">No se pudo encontrar la encomienda solicitada o ha ocurrido un error.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="mr-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900 truncate">
                Encomienda {currentPackage.tracking_number}
              </h1>
              <span className={cn(
                getStatusBg(currentPackage.status),
                getStatusText(currentPackage.status),
                'px-2.5 py-1 text-xs font-semibold rounded-full hidden sm:inline-block'
              )}>
                {getStatusLabel(currentPackage.status)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {currentPackage.status === 'registered_at_office' && (
                <button
                  onClick={() => navigate(`/packages/${currentPackage.id}/edit`)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              )}
              {currentPackage.status === 'in_transit' && currentPackage.trip?.status === 'arrived' && (
                <button
                  onClick={() => setShowReceptionModal(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors mr-2"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Marcar Recibido
                </button>
              )}
              {currentPackage.status === 'arrived_at_destination' && (
                <button
                  onClick={() => setShowDeliveryModal(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Entregar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detalles de Encomienda
                </h2>
                <span className={cn(
                  getPaymentStatusBg(currentPackage.payment_status),
                  getPaymentStatusTextClass(currentPackage.payment_status),
                  'px-2 py-1 text-xs font-semibold rounded-md border text-center'
                )}>
                  {getPaymentStatusLabel(currentPackage.payment_status)}
                </span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Remitente</p>
                  <p className="text-sm font-medium text-gray-900">{currentPackage.sender?.firstname} {currentPackage.sender?.lastname}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currentPackage.sender?.phone} {currentPackage.sender?.ci && <span>· CI: {currentPackage.sender?.ci}</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Destinatario</p>
                  <p className="text-sm font-medium text-gray-900">{currentPackage.recipient?.firstname} {currentPackage.recipient?.lastname}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{currentPackage.recipient?.phone} {currentPackage.recipient?.ci && <span>· CI: {currentPackage.recipient?.ci}</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Items Totales</p>
                  <p className="text-sm text-gray-900">{currentPackage.total_items_count} ({currentPackage.total_weight ? currentPackage.total_weight + ' kg' : 'Peso no esp.'})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Costo Total</p>
                  <p className="text-sm font-bold text-gray-900">Bs. {(currentPackage.total_amount || 0).toFixed(2)}</p>
                </div>
              </div>
              {/* Items list */}
              <div className="px-5 pb-5">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Contenido</p>
                <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden text-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(currentPackage.items || []).map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">{item.description}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-center text-gray-500">{item.quantity}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-gray-500">Bs. {(item.unit_price || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-right font-medium text-gray-900">Bs. {(item.total_price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                      {(!currentPackage.items || currentPackage.items.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-gray-500 italic">No hay items en este paquete</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Trip Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Información de Viaje
                </h2>
              </div>
              <div className="p-5">
                {currentPackage.trip ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">{currentPackage.trip?.route?.origin_location?.name || 'Origen'}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="font-bold text-gray-900">{currentPackage.trip?.route?.destination_location?.name || 'Destino'}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Fecha de salida: {formatDateTime(currentPackage.trip?.departure_date || currentPackage.trip?.trip_datetime)} <br />
                        Estado: <span className="font-medium text-gray-700">{formatTripStatus(currentPackage.trip?.status)}</span>
                      </p>
                    </div>
                    <Link
                      to={`/trips/${currentPackage.trip.id}`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 flex-shrink-0"
                    >
                      Ver Viaje →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Sin viaje asignado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Column (Timeline) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Historial de Estados
                </h2>
              </div>
              <div className="p-5">
                {currentPackage.state_history && currentPackage.state_history.length > 0 ? (
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {[...currentPackage.state_history].reverse().map((event: any, eventIdx, arr) => (
                        <li key={event.id || eventIdx}>
                          <div className="relative pb-8">
                            {eventIdx !== arr.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={cn(
                                  getTimelineIconBg(event.new_state),
                                  'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white shadow-sm'
                                )}>
                                  {event.new_state === 'registered_at_office' ? '📦' :
                                    event.new_state === 'assigned_to_trip' ? '🏷️' :
                                      event.new_state === 'in_transit' ? '🚚' :
                                        event.new_state === 'arrived_at_destination' ? '📍' :
                                          event.new_state === 'delivered' ? '✅' : '⏱️'}
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{getStatusLabel(event.new_state)}</p>
                                  {event.notes && <p className="text-xs text-gray-500 mt-1">{event.notes}</p>}
                                </div>
                                <div className="whitespace-nowrap text-right text-xs text-gray-500">
                                  {formatDateTime(event.changed_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay historial disponible
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PackageDeliveryModal
        show={showDeliveryModal}
        packageData={currentPackage}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={onDeliverPackageConfirm}
      />

      <PackageReceptionModal
        show={showReceptionModal}
        packageData={currentPackage}
        onClose={() => setShowReceptionModal(false)}
        onConfirm={onReceivePackageConfirm}
      />
    </div>
  )
}
