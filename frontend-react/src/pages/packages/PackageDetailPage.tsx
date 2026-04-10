import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { fetchPackageById, updatePackage } from '@/store/package.slice'
import { Check, Truck, Bus, Box, AlertCircle, Archive } from 'lucide-react'
import PackageDeliveryModal from '@/components/packages/PackageDeliveryModal'
import PackageReceptionModal from '@/components/packages/PackageReceptionModal'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<any>()

  const { currentPackage, loading, error } = useSelector((state: RootState) => state.package)

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

  const formatDateTime = (dateStr: string | null | undefined, includeTime = true) => {
    if (!dateStr) return '---'
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', ...((includeTime) && {hour: '2-digit', minute: '2-digit', hour12: false}) }
    return date.toLocaleString('en-US', options)
  }

  const getStatusNumber = (status: string | undefined) => {
    switch (status) {
      case 'registered_at_office': return 1;
      case 'assigned_to_trip': return 2;
      case 'in_transit': return 3;
      case 'arrived_at_destination': return 4;
      case 'delivered': return 5;
      default: return 0;
    }
  }

  if (loading && !currentPackage) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!currentPackage || error) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Encomienda no encontrada</h3>
      </div>
    )
  }

  const statusNum = getStatusNumber(currentPackage.status);
  
  // Try to find datetime for each status
  const getHistoryDate = (stateName: string) => {
    if (!currentPackage.state_history) return null;
    const historyItem = currentPackage.state_history.find((h: any) => h.new_state === stateName);
    return historyItem ? historyItem.changed_at : null;
  }

  const receivedDate = getHistoryDate('registered_at_office') || currentPackage.created_at;
  const transitDate = getHistoryDate('in_transit');
  const arrivedDate = getHistoryDate('arrived_at_destination');
  const deliveredDate = getHistoryDate('delivered');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h4 className="text-xs font-bold tracking-widest text-[#932720] uppercase mb-2">Resumen de Encomienda</h4>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              {currentPackage.tracking_number}
            </h1>
            <p className="text-gray-600 text-lg">
              {currentPackage.status === 'in_transit' ? 'En Tránsito' :
               currentPackage.status === 'arrived_at_destination' ? 'En Agencia' :
               currentPackage.status === 'delivered' ? 'Entregado' : 'Pendiente'}: {currentPackage.sender?.branch?.name || currentPackage.sender?.office?.name || 'Origen'} <span className="mx-1">→</span> {currentPackage.recipient?.branch?.name || currentPackage.recipient?.office?.name || 'Destino'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {currentPackage.status !== 'delivered' && (
                <button
                  onClick={() => navigate(`/packages/${currentPackage.id}/edit`)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg text-[#16499B] bg-[#F8FAFC] border-2 border-[#16499B] hover:bg-blue-50 transition-colors"
                >
                  Editar Encomienda
                </button>
              )}
               {currentPackage.status === 'in_transit' && currentPackage.trip?.status === 'arrived' && (
                <button
                  onClick={() => setShowReceptionModal(true)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#16499B] hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Marcar Recibido
                </button>
              )}
              {currentPackage.status === 'arrived_at_destination' && (
                <button
                  onClick={() => setShowDeliveryModal(true)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#16499B] hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Entregar Paquete
                </button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Real-time Journey Progress */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#16499B] border-y border-r border-y-gray-100 border-r-gray-100 p-8">
              <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase mb-10">Progreso del Viaje</h2>
              
              <div className="relative flex justify-between items-start max-w-2xl mx-auto px-4">
                {/* Connecting lines */}
                <div className="absolute top-4 left-10 right-10 h-[2px] bg-gray-200 -z-10" />
                <div 
                  className="absolute top-4 left-10 h-[2px] bg-[#16499B] -z-10 transition-all duration-500" 
                  style={{ width: `calc(${(statusNum > 1 ? (statusNum - 1) * 25 : 0)}% - 20px)` }}
                />

                {/* Step 1 */}
                <div className={cn("flex flex-col items-center transition-all", statusNum < 1 && "opacity-50 grayscale")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors",
                    statusNum >= 1 ? "bg-[#16499B] text-white shadow-sm" : "bg-[#F1F5F9] border-2 border-[#E2E8F0]"
                  )}>
                    {statusNum >= 1 ? <Check className="w-4 h-4" strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>
                  <span className={cn("text-[11px] font-bold uppercase", statusNum >= 1 ? "text-[#16499B]" : "text-gray-400")}>Registrado</span>
                  {statusNum >= 1 && <span className="text-[10px] text-gray-500 mt-1">{formatDateTime(getHistoryDate('registered_at_office') || currentPackage.created_at)}</span>}
                </div>

                {/* Step 2 */}
                <div className={cn("flex flex-col items-center transition-all", statusNum < 2 && "opacity-50 grayscale")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors",
                    statusNum >= 2 ? "bg-[#16499B] text-white shadow-sm" : "bg-[#F1F5F9] border-2 border-[#E2E8F0]"
                  )}>
                    {statusNum >= 2 ? <Check className="w-4 h-4" strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>
                  <span className={cn("text-[11px] font-bold uppercase", statusNum >= 2 ? "text-[#16499B]" : "text-gray-400")}>Asignado</span>
                  {statusNum >= 2 && <span className="text-[10px] text-gray-500 mt-1">{formatDateTime(getHistoryDate('assigned_to_trip'))}</span>}
                </div>

                {/* Step 3 */}
                <div className={cn("flex flex-col items-center transition-all", statusNum < 3 && "opacity-50 grayscale")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors",
                    statusNum >= 3 ? "bg-[#16499B] text-white shadow-sm" : "bg-[#F1F5F9] border-2 border-[#E2E8F0]"
                  )}>
                    {statusNum >= 3 ? <Truck className="w-4 h-4" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>
                  <span className={cn("text-[11px] font-bold uppercase", statusNum >= 3 ? "text-[#16499B]" : "text-gray-400")}>En Tránsito</span>
                  {statusNum >= 3 && <span className="text-[10px] text-gray-500 mt-1">{formatDateTime(getHistoryDate('in_transit'))}</span>}
                </div>

                {/* Step 4 */}
                <div className={cn("flex flex-col items-center transition-all", statusNum < 4 && "opacity-50 grayscale")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors",
                    statusNum >= 4 ? "bg-[#16499B] text-white shadow-sm" : "bg-[#F1F5F9] border-2 border-[#E2E8F0]"
                  )}>
                    {statusNum >= 4 ? <Check className="w-4 h-4" strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>
                  <span className={cn("text-[11px] font-bold uppercase", statusNum >= 4 ? "text-[#16499B]" : "text-gray-400")}>En Agencia</span>
                  {statusNum >= 4 && <span className="text-[10px] text-gray-500 mt-1">{formatDateTime(getHistoryDate('arrived_at_destination'))}</span>}
                </div>

                {/* Step 5 */}
                <div className={cn("flex flex-col items-center transition-all", statusNum < 5 && "opacity-50 grayscale")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors",
                    statusNum >= 5 ? "bg-[#16499B] text-white shadow-sm" : "bg-[#F1F5F9] border-2 border-[#E2E8F0]"
                  )}>
                    {statusNum >= 5 ? <Archive className="w-4 h-4" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>
                  <span className={cn("text-[11px] font-bold uppercase", statusNum >= 5 ? "text-[#16499B]" : "text-gray-400")}>Entregado</span>
                  {statusNum >= 5 && <span className="text-[10px] text-gray-500 mt-1">{formatDateTime(getHistoryDate('delivered'))}</span>}
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative rounded-xl overflow-hidden shadow-sm h-[320px] bg-gray-900 bg-cover bg-center" style={{ backgroundImage: 'url(/dark_city_map.png)' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-extrabold border border-white/20 text-[#16499B] shadow-sm flex items-center gap-2 uppercase tracking-wide">
                <span className="hidden relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16499B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16499B]"></span>
                </span>
                Rastreo Activo
              </div>

              <div className="absolute bottom-6 left-6 text-white z-10 w-full">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Estado actual</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-medium">{currentPackage.status === 'delivered' ? 'Paquete Entregado' : currentPackage.status === 'arrived_at_destination' ? 'En Agencia de Destino' : currentPackage.status === 'in_transit' ? 'En Viaje hacia Destino' : 'Esperando Despacho en Agencia'}</p>
                </div>
              </div>
            </div>

            {/* Detailed Status Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 flex justify-between items-center bg-white border-b border-gray-50">
                <h2 className="text-sm font-bold tracking-widest text-[#1e293b] uppercase">Bitácora de Estados</h2>
                <button className="text-xs font-bold text-[#16499B] hover:text-blue-800 transition-colors">Descargar historial completo</button>
              </div>
              <div className="p-0">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-white text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold border-b border-gray-50">Fecha y Hora</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-50">Ubicación</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-50">Evento</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-50 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentPackage.state_history && currentPackage.state_history.length > 0 ? (
                      [...currentPackage.state_history].reverse().map((event: any, idx: number) => (
                        <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-[13px] text-gray-600 whitespace-nowrap">
                            {formatDateTime(event.changed_at, true).replace(',', '')}
                          </td>
                          <td className="px-6 py-4 text-[13px] text-gray-700">
                             {event.new_state === 'registered_at_office' || event.new_state === 'assigned_to_trip' ? currentPackage.sender?.branch?.name || currentPackage.sender?.office?.name || 'Oficina Origen' : 
                              event.new_state === 'in_transit' ? 'En ruta a Destino' :
                              event.new_state === 'arrived_at_destination' || event.new_state === 'delivered' ? currentPackage.recipient?.branch?.name || currentPackage.recipient?.office?.name || 'Oficina Destino' : 'Desconocido'}
                          </td>
                          <td className="px-6 py-4 text-[13px] text-[#1e293b] font-medium">
                            {event.new_state === 'registered_at_office' ? 'Encomienda registrada en origen' :
                             event.new_state === 'assigned_to_trip' ? `Asignada al viaje #${currentPackage.trip_id || currentPackage.trip?.id || 'N/A'}` :
                             event.new_state === 'in_transit' ? 'Salida de terminal' :
                             event.new_state === 'arrived_at_destination' ? 'Llegada a oficina destino' :
                             event.new_state === 'delivered' ? 'Entregada al cliente' : event.new_state}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider", idx === currentPackage.state_history.length - 1 ? "bg-blue-50 text-blue-800" : "bg-[#F1F5F9] text-[#64748B]")}>
                              {idx === currentPackage.state_history.length - 1 ? 'Inicial' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                       <tr>
                         <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">No hay historial de registro</td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Assigned Trip */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-[3px] border-[#932720] border-y border-r border-y-gray-100 border-r-gray-100">
              <div className="p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e293b] mb-1">Viaje Asignado</p>
                      <h3 className="text-2xl font-black text-[#1e293b]">{currentPackage.trip ? `Viaje #${currentPackage.trip.id}` : 'No Asignado'}</h3>
                    </div>
                    <Bus className="w-6 h-6 text-[#932720]" />
                 </div>

                 {currentPackage.trip ? (
                   <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="text-[13px] text-gray-500">Chofer</span>
                        <span className="text-[13px] font-bold text-[#1e293b]">{currentPackage.trip.driver?.firstname || 'Sin Asignar'} {currentPackage.trip.driver?.lastname || ''}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="text-[13px] text-gray-500">Asistente</span>
                        <span className="text-[13px] font-bold text-[#1e293b]">{currentPackage.trip.assistant?.firstname || 'Sin Asignar'} {currentPackage.trip.assistant?.lastname || ''}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="text-[13px] text-gray-500">Placa / Bus</span>
                        <span className="text-[13px] font-bold text-[#1e293b]">{currentPackage.trip.bus?.license_plate || 'Sin Asignar'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="text-[13px] text-gray-500">Capacidad Total</span>
                        <span className="text-[13px] font-bold text-[#16499B]">{currentPackage.trip.bus?.capacity || 'N/A'} asientos</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-gray-500">Fecha Llegada Est.</span>
                        <span className="text-[13px] font-bold text-[#932720]">{formatDateTime(currentPackage.trip.arrival_date || currentPackage.trip.trip_datetime, false)}</span>
                      </div>
                   </div>
                 ) : (
                   <div className="py-8 text-center text-gray-400 italic mb-2">No hay viaje asignado temporalmente.</div>
                 )}

                 {currentPackage.trip && (
                    <Link
                      to={`/trips/${currentPackage.trip.id}`}
                      className="block w-full text-center py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1e293b] text-[11px] font-bold tracking-widest rounded-lg transition-colors uppercase"
                    >
                      Ver todos los detalles del Viaje
                    </Link>
                 )}
              </div>
            </div>

            {/* Commercial Value */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e293b] mb-4">Valor Pagado</p>
               <h3 className="text-[40px] font-bold text-[#1e293b] leading-none mb-1 tracking-tight">
                 Bs. {(currentPackage.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
               <p className="text-[11px] text-gray-500 mb-6">Monto total del servicio</p>

               <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1e293b]">Tarifa Base</span>
                    <span className="text-xs font-bold text-[#1e293b]">Bs. {((currentPackage.total_amount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1e293b]">Total Items</span>
                    <span className="text-xs font-bold text-[#1e293b]">{currentPackage.total_items_count || (currentPackage.items ? currentPackage.items.length : 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1e293b]">Peso Total</span>
                    <span className="text-xs font-bold text-[#1e293b]">{currentPackage.total_weight ? currentPackage.total_weight + ' kg' : 'N/A'}</span>
                  </div>
               </div>
            </div>

            {/* Cargo Manifest */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e293b] mb-6">Manifiesto de ítems</p>
              
              <div className="space-y-5">
                {(currentPackage.items || []).length > 0 ? (
                  currentPackage.items.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded bg-[#F1F5F9] border border-gray-200 flex items-center justify-center flex-shrink-0 text-[#1e293b]">
                        <Box className="w-5 h-5 fill-current" />
                      </div>
                      <div className="leading-tight">
                         <p className="text-[13px] font-bold text-[#1e293b] mb-0.5">{item.quantity}x {item.description}</p>
                         <p className="text-[11px] text-gray-500">{item.weight || currentPackage.total_weight ? `${item.weight || currentPackage.total_weight} kg` : 'N/A kg'} | Empaque General</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm italic">
                     No hay registro de ítems para esta encomienda.
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
