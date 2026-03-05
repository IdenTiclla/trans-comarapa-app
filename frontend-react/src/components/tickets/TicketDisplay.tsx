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
        return 'Cliente'
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

    return (
        <div className={`bg-white rounded-lg overflow-hidden mx-auto font-sans print:max-w-none print:w-[210mm] print:shadow-none print:border-2 print:border-black print:m-0 ${previewMode ? 'border-2 border-blue-300 max-w-md shadow-md scale-90 transform origin-top' : 'border-4 border-blue-400 max-w-4xl shadow-2xl'}`}>
            <div className={`bg-gradient-to-r from-cyan-400 to-blue-500 text-white print:bg-blue-500 print:!bg-none ${previewMode ? 'px-2 py-1 border-b-2 border-blue-500' : 'px-4 py-3 border-b-4 border-blue-600'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className={`text-white ${previewMode ? 'w-8 h-6' : 'w-16 h-12'}`} fill="currentColor" viewBox="0 0 100 60">
                                <rect x="10" y="20" width="70" height="25" rx="5" fill="currentColor" />
                                <rect x="15" y="15" width="60" height="8" rx="3" fill="currentColor" />
                                <circle cx="25" cy="50" r="6" fill="currentColor" />
                                <circle cx="65" cy="50" r="6" fill="currentColor" />
                                <rect x="20" y="25" width="8" height="6" fill="white" />
                                <rect x="32" y="25" width="8" height="6" fill="white" />
                                <rect x="44" y="25" width="8" height="6" fill="white" />
                                <rect x="56" y="25" width="8" height="6" fill="white" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-baseline mb-0">
                                <h1 className={previewMode ? 'text-base font-bold mr-1' : 'text-2xl font-bold space-x-2'}>TRANS</h1>
                                <h2 className={previewMode ? 'text-base font-bold italic' : 'text-2xl font-bold italic'}>Comarapa</h2>
                            </div>
                            <div className={`leading-none ${previewMode ? 'text-[8px]' : 'text-xs'}`}>
                                <p className="font-medium">SINDICATO MIXTO DE TRANSPORTISTAS DE LARGA</p>
                                <p className="font-medium">Y CORTA DISTANCIA "MANUEL MARIA CABALLERO"</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className={previewMode ? 'text-xs font-bold' : 'text-sm font-bold'}>Resolución Suprema 17996</p>
                    </div>
                    <div className="flex-shrink-0">
                        <svg className={`text-white ${previewMode ? 'w-6 h-6' : 'w-16 h-16'}`} fill="currentColor" viewBox="0 0 100 100">
                            <path d="M50 10 L30 30 L20 50 L30 60 L50 55 L70 60 L80 50 L70 30 Z" />
                            <path d="M50 15 L40 25 L50 35 L60 25 Z" />
                            <circle cx="45" cy="25" r="2" />
                            <circle cx="55" cy="25" r="2" />
                        </svg>
                    </div>
                </div>
                <div className={`grid grid-cols-2 gap-x-4 ${previewMode ? 'mt-0 text-[8px] leading-tight pb-1' : 'mt-2 text-xs gap-x-8'}`}>
                    <div>
                        <p><span className="font-medium">Of. Santa Cruz:</span> Doble Vía La Guardia 4to <span className="font-medium">Cel:</span> 781-75576</p>
                        <p><span className="font-medium">Of. Comarapa:</span> Av. Comarapa • <span className="font-medium">Cel:</span> 781-75578</p>
                    </div>
                    <div>
                        <p><span className="font-medium">Of. San Isidro:</span> <span className="font-medium">Cel:</span> 785-15650</p>
                        <p><span className="font-medium">Of. Los Negros:</span> <span className="font-medium">Cel:</span> 690-29690</p>
                    </div>
                </div>
            </div>

            <div className="bg-white relative">
                <div className={`absolute right-4 ${previewMode ? 'top-1' : 'top-2'}`}>
                    <div className={`bg-blue-500 text-white rounded-lg print:bg-blue-500 ${previewMode ? 'px-3 py-1' : 'px-6 py-2'}`}>
                        <h3 className={`font-bold ${previewMode ? 'text-sm' : 'text-xl'}`}>BOLETO</h3>
                    </div>
                </div>

                <div className={previewMode ? 'px-3 py-1 pt-6' : 'px-4 py-4 pt-16'}>
                    <div className={previewMode ? 'border-2 border-blue-400 mb-1' : 'border-4 border-blue-500 mb-2'}>
                        <div className="flex">
                            <div className={`bg-blue-500 text-white font-bold print:bg-blue-500 ${previewMode ? 'px-2 py-1 text-xs flex items-center' : 'px-4 py-3 text-lg'}`}>
                                NOMBRE:
                            </div>
                            <div className={`flex-grow bg-white text-gray-700 font-bold ${previewMode ? 'border-r-2 border-blue-400 px-2 py-1 text-xs flex items-center' : 'border-r-4 border-blue-500 px-4 py-3'}`}>
                                {getFullName()}
                            </div>
                            <div className={`bg-white text-right ${previewMode ? 'px-2 py-1 flex items-center' : 'px-6 py-3'}`}>
                                <span className={`text-red-600 font-bold ${previewMode ? 'text-sm' : 'text-2xl'}`}>
                                    N° {ticket?.id || '115032'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`grid grid-cols-12 ${previewMode ? 'gap-1 mb-1' : 'gap-2 mb-2'}`}>
                        <div className={`col-span-2 ${previewMode ? 'border-2 border-blue-400 flex flex-col' : 'border-4 border-blue-500'}`}>
                            <div className={`bg-blue-500 text-white text-center font-bold print:bg-blue-500 ${previewMode ? 'py-0 text-[10px]' : 'py-2'}`}>Bs.</div>
                            <div className={`bg-white text-center font-bold flex-1 flex items-center justify-center ${previewMode ? 'py-1 text-sm' : 'py-4 text-xl'}`}>{formatPrice(ticket?.price)}</div>
                        </div>
                        <div className={`col-span-7 ${previewMode ? 'border-2 border-blue-400 flex flex-col' : 'border-4 border-blue-500'}`}>
                            <div className={`bg-blue-500 text-white text-center font-bold print:bg-blue-500 ${previewMode ? 'py-0 text-[10px]' : 'py-2'}`}>Destino:</div>
                            <div className={`bg-white text-center font-bold flex-1 flex items-center justify-center ${previewMode ? 'py-1 text-sm line-clamp-1' : 'py-4 text-lg'}`}>{getDestination()}</div>
                        </div>
                        <div className={`col-span-3 ${previewMode ? 'border-2 border-blue-400 flex flex-col' : 'border-4 border-blue-500'}`}>
                            <div className={`bg-blue-500 text-white text-center font-bold print:bg-blue-500 ${previewMode ? 'py-0 text-[10px]' : 'py-2'}`}>N°</div>
                            <div className={`bg-white text-center font-bold text-red-600 flex-1 flex items-center justify-center ${previewMode ? 'py-1 text-base' : 'py-4'} ${getSeatNumberClass()}`}>{getSeatNumbers()}</div>
                        </div>
                    </div>

                    <div className={`grid grid-cols-12 mb-2 ${previewMode ? 'gap-1' : 'gap-2'}`}>
                        <div className={`col-span-4 ${previewMode ? 'border-2 border-blue-400 flex flex-col' : 'border-4 border-blue-500'}`}>
                            <div className={`bg-blue-500 text-white text-center font-bold print:bg-blue-500 ${previewMode ? 'py-0 text-[10px]' : 'py-2'}`}>Fecha</div>
                            <div className={previewMode ? 'bg-white p-1 flex-1 flex flex-col justify-center' : 'bg-white p-2'}>
                                <div className="grid grid-cols-3 gap-1">
                                    <div className={`border-2 border-blue-300 text-center font-bold flex items-center justify-center ${previewMode ? 'py-1 text-xs' : 'py-2'}`}>{getDayFromDate()}</div>
                                    <div className={`border-2 border-blue-300 text-center font-bold flex items-center justify-center ${previewMode ? 'py-1 text-xs' : 'py-2'}`}>{getMonthFromDate()}</div>
                                    <div className={`border-2 border-blue-300 text-center font-bold flex items-center justify-center ${previewMode ? 'py-1 text-xs' : 'py-2'}`}>{getYearFromDate()}</div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-span-4 ${previewMode ? 'border-2 border-blue-400 flex flex-col' : 'border-4 border-blue-500'}`}>
                            <div className={`bg-blue-500 text-white text-center font-bold leading-tight print:bg-blue-500 ${previewMode ? 'py-0 text-[10px]' : 'py-2'}`}>Hora en Of.:</div>
                            <div className={previewMode ? 'bg-white flex flex-row items-center justify-center space-x-2 py-2 flex-1' : 'bg-white p-2'}>
                                <div className={`flex justify-center ${previewMode ? '' : 'mb-2'}`}>
                                    <span className={`bg-blue-100 rounded font-bold text-blue-600 ${previewMode ? 'px-1 py-0.5 text-[10px]' : 'px-3 py-1'}`}>{getOfficeTimeAmPm()}</span>
                                </div>
                                <div className={`text-center font-bold text-red-600 ${previewMode ? 'text-sm' : 'text-lg'}`}>{getCurrentTime()}</div>
                            </div>
                        </div>
                        <div className={`col-span-4 ${previewMode ? 'border-2 border-blue-400 flex flex-col' : 'border-4 border-blue-500'}`}>
                            <div className={`bg-blue-500 text-white text-center font-bold leading-tight print:bg-blue-500 ${previewMode ? 'py-0 text-[10px]' : 'py-2'}`}>Hora Salida:</div>
                            <div className={previewMode ? 'bg-white flex flex-row items-center justify-center space-x-2 py-2 flex-1' : 'bg-white p-2'}>
                                <div className={`flex justify-center ${previewMode ? '' : 'mb-2'}`}>
                                    <span className={`bg-blue-100 rounded font-bold text-blue-600 ${previewMode ? 'px-1 py-0.5 text-[10px]' : 'px-3 py-1'}`}>{getDepartureTimeAmPm()}</span>
                                </div>
                                <div className={`text-center font-bold text-red-600 ${previewMode ? 'text-sm' : 'text-lg'}`}>{getDepartureTime()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`bg-gradient-to-r from-cyan-400 to-blue-500 text-white flex flex-col print:bg-blue-500 print:!bg-none ${previewMode ? 'px-2 py-1 border-t-2 border-blue-500 pb-2' : 'px-4 py-3 border-t-4 border-blue-600'}`}>
                <div className={previewMode ? 'grid grid-cols-12 gap-1 items-stretch' : 'grid grid-cols-12 gap-4'}>
                    <div className="col-span-4 flex items-center justify-center">
                        <div className="text-center">
                            <p className={`font-bold mb-0 leading-tight uppercase tracking-widest text-[#FFDF00] ${previewMode ? 'text-[9px]' : 'text-lg'}`}>
                                NO SE ACEPTAN<br />DEVOLUCIONES
                            </p>
                            <p className={`italic opacity-90 tracking-wide mt-1 text-white ${previewMode ? 'text-[7px]' : 'text-sm mt-2'}`}>
                                ¡Gracias por su preferencia!
                            </p>
                        </div>
                    </div>
                    <div className="col-span-8 flex flex-col">
                        <div className={`bg-blue-600/50 rounded flex-1 flex flex-col justify-center ${previewMode ? 'px-2 py-1' : 'px-3 py-2'}`}>
                            <h4 className={`text-center font-bold ${previewMode ? 'text-[8px] mb-1' : 'text-sm mb-2'}`}>
                                HORARIOS DE SALIDA STZ - COMARAPA
                            </h4>
                            <div className={`leading-tight ${previewMode ? 'text-[6.5px] space-y-0.5' : 'text-xs space-y-1'}`}>
                                <div className="flex justify-between"><span className="font-bold opacity-80">L-J:</span> 10:30, 14:00, 18:30, 20:30</div>
                                <div className="flex justify-between"><span className="font-bold text-yellow-300">V-S-D:</span> 10:30, 14:00, 18:30, 20:30, 22:00</div>
                                <h4 className={`text-center font-bold border-t border-white/20 pt-1 mt-1 ${previewMode ? 'text-[8px] pb-0.5' : 'text-sm mt-2'}`}>
                                    HORARIOS COMARAPA - STZ
                                </h4>
                                <div className="flex justify-between"><span className="font-bold opacity-80">L-S:</span> 08:00, 14:00, 20:30, 23:30</div>
                                <div className="flex justify-between"><span className="font-bold text-yellow-300">DOM:</span> 08:30, 12:00, 14:00, 20:30, 23:30</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
