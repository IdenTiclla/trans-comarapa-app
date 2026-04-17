export default function TicketDisplay({
    ticket,
    trip,
    previewMode = false
}: {
    ticket: any
    trip: any
    previewMode?: boolean
}) {
    const formatPrice = (price?: number | string) => price ? parseFloat(price.toString()).toFixed(2) : '0.00'

    const getDestination = () => {
        if (ticket?.destination) return ticket.destination
        if (trip?.route?.destination) return trip.route.destination
        return ticket?.trip?.route?.destination || 'Destino'
    }

    const getFullName = () => {
        const client = ticket?.client
        if (client) return `${client.firstname || ''} ${client.lastname || ''}`.trim()
        return 'Nombre del pasajero'
    }

    const getDateObj = () => {
        const d = trip?.trip_datetime || ticket?.trip?.trip_datetime
        return d ? new Date(d) : new Date()
    }

    const getDayFromDate = () => getDateObj().getDate().toString().padStart(2, '0')
    const getMonthFromDate = () => (getDateObj().getMonth() + 1).toString().padStart(2, '0')
    const getYearFromDate = () => getDateObj().getFullYear().toString().slice(-2)

    const getOfficeTimeObj = () => {
        const d = getDateObj()
        return new Date(d.getTime() - 30 * 60 * 1000)
    }

    const getCurrentTime = () => {
        return getOfficeTimeObj().toLocaleTimeString('es-BO', {
            hour: '2-digit', minute: '2-digit', hour12: false
        })
    }

    const getDepartureTime = () => {
        return getDateObj().toLocaleTimeString('es-BO', {
            hour: '2-digit', minute: '2-digit', hour12: false
        })
    }

    const getOfficeTimeAmPm = () => getOfficeTimeObj().getHours() < 12 ? 'AM' : 'PM'
    const getDepartureTimeAmPm = () => getDateObj().getHours() < 12 ? 'AM' : 'PM'

    const getSeatNumbers = () => {
        if (ticket?.seats && Array.isArray(ticket.seats)) {
            return ticket.seats.map((s: any) => s.seat_number).join(', ')
        } else if (ticket?.seat?.seat_number) {
            return ticket.seat.seat_number
        }
        return '36'
    }

    const getSeatNumberClass = () => {
        const nums = getSeatNumbers()
        if (nums.toString().includes(',') || nums.toString().length > 4) {
            return previewMode ? 'text-sm leading-tight' : 'text-lg leading-tight'
        } else if (nums.toString().length > 2) {
            return previewMode ? 'text-base' : 'text-xl'
        }
        return previewMode ? 'text-lg' : 'text-2xl'
    }

    const p = previewMode

    return (
        <div className={`bg-white rounded-lg overflow-hidden mx-auto font-sans print:max-w-none print:w-[210mm] print:shadow-none print:border-2 print:border-black print:m-0 ${p ? 'border-2 border-blue-300 w-full shadow-md' : 'border-2 border-blue-800 shadow-lg'}`}>
            <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white print:bg-blue-600 print:!bg-none ${p ? 'px-4 py-1' : 'px-5 py-1.5'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center ${p ? 'p-1' : 'p-1'}`}>
                            <svg className={`text-white ${p ? 'w-7 h-4' : 'w-9 h-6'}`} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="3">
                                <rect x="10" y="15" width="80" height="30" rx="4" />
                                <circle cx="28" cy="52" r="6" />
                                <circle cx="72" cy="52" r="6" />
                                <rect x="20" y="23" width="12" height="7" rx="1" fill="currentColor" stroke="none" />
                                <rect x="36" y="23" width="12" height="7" rx="1" fill="currentColor" stroke="none" />
                                <rect x="52" y="23" width="12" height="7" rx="1" fill="currentColor" stroke="none" />
                                <rect x="68" y="23" width="12" height="7" rx="1" fill="currentColor" stroke="none" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-baseline">
                                <h1 className={`font-extrabold tracking-wide ${p ? 'text-2xl mr-1' : 'text-2xl mr-1.5'}`}>Trans Comarapa</h1>
                            </div>
                            <div className={`leading-tight text-white/80 ${p ? 'text-xs' : 'text-xs'}`}>
                                <p className="font-medium">SINDICATO MIXTO DE TRANSPORTISTAS DE LARGA Y CORTA DISTANCIA "MANUEL MARIA CABALLERO"</p>
                            </div>
                        </div>
                    </div>
                    <div className={`text-right ${p ? '' : ''}`}>
                        <p className={`font-bold text-white/70 ${p ? 'text-xs' : 'text-xs'}`}>Resolución Suprema 17996</p>
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className={`grid grid-cols-2 gap-x-24 text-white/80 ${p ? 'text-[11px]' : 'text-xs gap-x-32'}`}>
                        <div className="space-y-1.5">
                            <div className="flex flex-col leading-none">
                                <div className="flex justify-start whitespace-nowrap">
                                    <span className="font-semibold text-white">Of. Santa Cruz:</span>
                                    <span className="ml-1.5 font-bold">781-75576</span>
                                </div>
                                <span className={`text-white/60 italic whitespace-nowrap ${p ? 'text-[11px]' : 'text-[12px]'}`}>Doble Vía La Guardia 4to anillo</span>
                            </div>
                            <div className="flex flex-col leading-none">
                                <div className="flex justify-start whitespace-nowrap">
                                    <span className="font-semibold text-white">Of. Comarapa:</span>
                                    <span className="ml-1.5 font-bold">781-75578</span>
                                </div>
                                <span className={`text-white/60 italic whitespace-nowrap ${p ? 'text-[11px]' : 'text-[12px]'}`}>Av. Comarapa (Mercado Campesino)</span>
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                            <div className="flex flex-col leading-none">
                                <div className="flex justify-start whitespace-nowrap">
                                    <span className="font-semibold text-white">Of. San Isidro:</span>
                                    <span className="ml-1.5 font-bold">785-15650</span>
                                </div>
                                <span className={`text-white/60 italic whitespace-nowrap ${p ? 'text-[11px]' : 'text-[12px]'}`}>Av. San Isidro</span>
                            </div>
                            <div className="flex flex-col leading-none">
                                <div className="flex justify-start whitespace-nowrap">
                                    <span className="font-semibold text-white">Of. Los Negros:</span>
                                    <span className="ml-1.5 font-bold">690-29690</span>
                                </div>
                                <span className={`text-white/60 italic whitespace-nowrap ${p ? 'text-[11px]' : 'text-[12px]'}`}>Av. Los Negros</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white relative">
                <div className={`absolute ${p ? 'right-2 top-1' : 'right-3 top-2'}`}>
                    <div className={`bg-blue-600 text-white rounded print:bg-blue-600 ${p ? 'px-2 py-0.5' : 'px-4 py-1'}`}>
                        <h3 className={`font-bold ${p ? 'text-sm' : 'text-sm'}`}>BOLETO</h3>
                    </div>
                </div>

                <div className={p ? 'px-4 py-2 pt-8' : 'px-4 py-3 pt-10'}>
                    <div className={`border-blue-600 mb-2 ${p ? 'border-2' : 'border-2'}`}>
                        <div className="flex">
                            <div className={`bg-blue-600 text-white font-bold print:bg-blue-600 ${p ? 'px-3 py-1.5 text-xs flex items-center' : 'px-3 py-2 text-sm'}`}>
                                NOMBRE:
                            </div>
                            <div className={`flex-grow text-gray-800 font-bold ${p ? 'px-3 py-1.5 text-xs flex items-center' : 'px-3 py-2 text-sm'}`}>
                                {getFullName()}
                            </div>
                            <div className={`text-right ${p ? 'px-3 py-1.5 flex items-center' : 'px-3 py-2'}`}>
                                <span className={`text-red-600 font-bold ${p ? 'text-xs' : 'text-base'}`}>
                                    N° {ticket?.id || '---'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`grid grid-cols-12 ${p ? 'gap-1 mb-1' : 'gap-1.5 mb-1.5'}`}>
                        <div className={`col-span-3 border-blue-600 flex flex-col ${p ? 'border-2' : 'border-2'}`}>
                            <div className={`bg-blue-600 text-white text-center font-bold print:bg-blue-600 ${p ? 'py-1 text-[11px]' : 'py-1 text-xs'}`}>N° de asiento</div>
                            <div className={`bg-white text-center font-bold text-red-600 flex-1 flex items-center justify-center ${p ? 'py-1.5 text-sm' : 'py-2 text-base'} ${getSeatNumberClass()}`}>{getSeatNumbers()}</div>
                        </div>
                        <div className={`col-span-7 border-blue-600 flex flex-col ${p ? 'border-2' : 'border-2'}`}>
                            <div className={`bg-blue-600 text-white text-center font-bold print:bg-blue-600 ${p ? 'py-1 text-[11px]' : 'py-1 text-xs'}`}>Destino:</div>
                            <div className={`bg-white text-center font-bold flex-1 flex items-center justify-center ${p ? 'py-1.5 text-sm line-clamp-1' : 'py-2 text-sm'}`}>{getDestination()}</div>
                        </div>
                        <div className={`col-span-2 border-blue-600 flex flex-col ${p ? 'border-2' : 'border-2'}`}>
                            <div className={`bg-blue-600 text-white text-center font-bold print:bg-blue-600 ${p ? 'py-1 text-[11px]' : 'py-1 text-xs'}`}>Bs.</div>
                            <div className={`bg-white text-center font-bold flex-1 flex items-center justify-center ${p ? 'py-1.5 text-sm' : 'py-2 text-base'}`}>{formatPrice(ticket?.price)}</div>
                        </div>
                    </div>

                    <div className={`grid grid-cols-12 ${p ? 'gap-1' : 'gap-1.5'}`}>
                        <div className={`col-span-4 border-blue-600 flex flex-col ${p ? 'border-2' : 'border-2'}`}>
                            <div className={`bg-blue-600 text-white text-center font-bold print:bg-blue-600 ${p ? 'py-1 text-[11px]' : 'py-1 text-xs'}`}>Fecha</div>
                            <div className={p ? 'bg-white px-1 py-1 flex-1 flex flex-col justify-center' : 'bg-white px-1 py-1'}>
                                <div className="grid grid-cols-3 gap-0.5">
                                    <div className={`border-2 border-blue-300 text-center font-bold flex items-center justify-center ${p ? 'py-1 text-xs' : 'py-1 text-xs'}`}>{getDayFromDate()}</div>
                                    <div className={`border-2 border-blue-300 text-center font-bold flex items-center justify-center ${p ? 'py-1 text-xs' : 'py-1 text-xs'}`}>{getMonthFromDate()}</div>
                                    <div className={`border-2 border-blue-300 text-center font-bold flex items-center justify-center ${p ? 'py-1 text-xs' : 'py-1 text-xs'}`}>{getYearFromDate()}</div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-span-4 border-blue-600 flex flex-col ${p ? 'border-2' : 'border-2'}`}>
                            <div className={`bg-blue-600 text-white text-center font-bold leading-tight print:bg-blue-600 ${p ? 'py-1 text-[11px]' : 'py-1 text-xs'}`}>Hora en Oficina:</div>
                            <div className={p ? 'bg-white flex items-center justify-center space-x-1 py-1 flex-1' : 'bg-white flex items-center justify-center space-x-2 py-1'}>
                                <span className={`bg-blue-100 rounded font-bold text-blue-600 ${p ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]'}`}>{getOfficeTimeAmPm()}</span>
                                <span className={`font-bold text-red-600 ${p ? 'text-sm' : 'text-sm'}`}>{getCurrentTime()}</span>
                            </div>
                        </div>
                        <div className={`col-span-4 border-blue-600 flex flex-col ${p ? 'border-2' : 'border-2'}`}>
                            <div className={`bg-blue-600 text-white text-center font-bold leading-tight print:bg-blue-600 ${p ? 'py-1 text-[11px]' : 'py-1 text-xs'}`}>Hora de Salida:</div>
                            <div className={p ? 'bg-white flex items-center justify-center space-x-1 py-1 flex-1' : 'bg-white flex items-center justify-center space-x-2 py-1'}>
                                <span className={`bg-blue-100 rounded font-bold text-blue-600 ${p ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]'}`}>{getDepartureTimeAmPm()}</span>
                                <span className={`font-bold text-red-600 ${p ? 'text-sm' : 'text-sm'}`}>{getDepartureTime()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white print:bg-blue-600 print:!bg-none ${p ? 'px-4 py-1.5 border-t-2 border-blue-800' : 'px-4 py-2 border-t-2 border-blue-800'}`}>
                <div className="flex items-center justify-between">
                    <div className={`${p ? 'w-1/3' : 'w-1/3'}`}>
                        <p className={`font-bold leading-tight uppercase tracking-wider text-yellow-300 ${p ? 'text-xs' : 'text-xs'}`}>
                            NO SE ACEPTAN DEVOLUCIONES
                        </p>
                        <p className={`italic text-white/80 ${p ? 'text-[11px]' : 'text-[11px]'}`}>
                            Gracias por su preferencia!
                        </p>
                    </div>
                    <div className={`${p ? 'w-2/3' : 'w-2/3'}`}>
                        <div className={`bg-blue-800/40 rounded ${p ? 'px-2 py-1' : 'px-2 py-1.5'}`}>
                            <p className={`text-center font-bold ${p ? 'text-[11px] mb-0.5' : 'text-[11px] mb-0.5'}`}>
                                HORARIOS STZ - COMARAPA: L-J 10:30, 14:00, 18:30, 20:30 | V-S-D +22:00
                            </p>
                            <p className={`text-center font-bold ${p ? 'text-[11px]' : 'text-[11px]'}`}>
                                HORARIOS COMARAPA - STZ: L-S 08:00, 14:00, 20:30, 23:30 | DOM 08:30, 12:00, 14:00, 20:30, 23:30
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
