import { useEffect, useState, useMemo } from 'react'
import { getEffectiveName } from '@/lib/person-utils'


interface PackageReceiptModalProps {
    show: boolean
    packageData: any
    onClose: () => void
}

export default function PackageReceiptModal({ show, packageData, onClose }: PackageReceiptModalProps) {
    const [packageNumber, setPackageNumber] = useState('000000')

    const now = new Date()
    const currentDay = now.getDate().toString().padStart(2, '0')
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0')
    const currentYear = now.getFullYear().toString()

    useEffect(() => {
        if (show && packageData && !packageData.tracking_number) {
            setPackageNumber('TEMP-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'))
        }
    }, [show, packageData])

    const totalAmount = useMemo(() => {
        if (!packageData?.items) return 0
        return packageData.items.reduce((total: number, item: any) => {
            return total + (item.quantity * item.unit_price)
        }, 0)
    }, [packageData])

    const getSenderNameStr = (sender: any) => getEffectiveName(sender)
    const getRecipientNameStr = (recipient: any) => getEffectiveName(recipient)

    const originName = packageData?.origin || packageData?.origin_office_name || packageData?.origin_office?.name || 'SCZ';
    const destinationName = packageData?.destination || packageData?.destination_office_name || packageData?.destination_office?.name || 'N/A';

    const printReceipt = () => {
        const printContent = document.getElementById('receipt-content')
        if (!printContent) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Recibo de Encomienda - Trans Comarapa</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .receipt-container { max-width: 800px; margin: 0 auto; }
                    
                    /* Utilidades de layout */
                    .grid { display: grid; }
                    .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
                    .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
                    .col-span-2 { grid-column: span 2; }
                    .col-span-3 { grid-column: span 3; }
                    .col-span-7 { grid-column: span 7; }
                    .col-span-9 { grid-column: span 9; }
                    .flex { display: flex; }
                    .items-center { align-items: center; }
                    .justify-between { justify-content: space-between; }
                    .justify-center { justify-content: center; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    
                    /* Espaciado */
                    .gap-1 { gap: 0.25rem; }
                    .gap-2 { gap: 0.5rem; }
                    .gap-4 { gap: 1rem; }
                    .space-x-2 > * + * { margin-left: 0.5rem; }
                    .space-y-1 > * + * { margin-top: 0.25rem; }
                    .space-y-3 > * + * { margin-top: 0.75rem; }
                    .p-1 { padding: 0.25rem; }
                    .p-2 { padding: 0.5rem; }
                    .p-4 { padding: 1rem; }
                    .p-6 { padding: 1.5rem; }
                    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
                    .mb-1 { margin-bottom: 0.25rem; }
                    .mb-2 { margin-bottom: 0.5rem; }
                    .mb-3 { margin-bottom: 0.75rem; }
                    .mb-4 { margin-bottom: 1rem; }
                    .mb-6 { margin-bottom: 1.5rem; }
                    .mr-4 { margin-right: 1rem; }
                    .mr-6 { margin-right: 1.5rem; }
                    .mt-2 { margin-top: 0.5rem; }
                    .-mt-1 { margin-top: -0.25rem; }
                    .-mt-2 { margin-top: -0.5rem; }
                    
                    /* Colores y fondos */
                    .bg-white { background-color: white; }
                    .bg-gray-50 { background-color: #f9fafb; }
                    .bg-blue-50 { background-color: #eff6ff; }
                    .bg-blue-800 { background-color: #1e40af; }
                    .bg-gradient-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
                    .bg-gradient-blue-header { background: linear-gradient(to right, #1e40af, #1d4ed8); }
                    .bg-gradient-blue-light { background: linear-gradient(to right, #dbeafe, #eff6ff); }
                    .bg-gradient-yellow { background: linear-gradient(to right, #fefce8, #fef3c7); }
                    .bg-red-600 { background-color: #dc2626; }
                    .text-white { color: white; }
                    .text-gray-600 { color: #4b5563; }
                    .text-blue-700 { color: #1d4ed8; }
                    .text-blue-800 { color: #1e40af; }
                    .text-blue-900 { color: #1e3a8a; }
                    .text-yellow-800 { color: #92400e; }
                    
                    /* Bordes */
                    .border { border-width: 1px; }
                    .border-4 { border-width: 4px; }
                    .border-2 { border-width: 2px; }
                    .border-blue-800 { border-color: #1e40af; }
                    .border-gray-600 { border-color: #4b5563; }
                    .border-gray-300 { border-color: #d1d5db; }
                    .border-gray-200 { border-color: #e5e7eb; }
                    .border-yellow-500 { border-color: #eab308; }
                    .border-l-4 { border-left-width: 4px; }
                    .border-t { border-top-width: 1px; }
                    .border-t-2 { border-top-width: 2px; }
                    .border-t-4 { border-top-width: 4px; }
                    .border-b { border-bottom-width: 1px; }
                    .border-b-2 { border-bottom-width: 2px; }
                    .border-dotted { border-style: dotted; }
                    .border-gray-400 { border-color: #9ca3af; }
                    .border-gray-500 { border-color: #6b7280; }
                    .rounded { border-radius: 0.25rem; }
                    .rounded-sm { border-radius: 0.125rem; }
                    .rounded-lg { border-radius: 0.5rem; }
                    .rounded-xl { border-radius: 0.75rem; }
                    .rounded-t { border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; }
                    .rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
                    
                    /* Tipografía */
                    .font-black { font-weight: 900; }
                    .font-bold { font-weight: 700; }
                    .font-semibold { font-weight: 600; }
                    .font-medium { font-weight: 500; }
                    .text-\\[10px\\] { font-size: 10px; }
                    .text-\\[11px\\] { font-size: 11px; }
                    .text-xs { font-size: 0.75rem; }
                    .text-sm { font-size: 0.875rem; }
                    .text-base { font-size: 1rem; }
                    .text-lg { font-size: 1.125rem; }
                    .text-xl { font-size: 1.25rem; }
                    .text-2xl { font-size: 1.5rem; }
                    .text-3xl { font-size: 1.875rem; }
                    .text-4xl { font-size: 2.25rem; }
                    .text-5xl { font-size: 3rem; }
                    .tracking-wide { letter-spacing: 0.025em; }
                    .tracking-wider { letter-spacing: 0.05em; }
                    .leading-relaxed { line-height: 1.625; }
                    
                    /* Tamaños */
                    .w-12 { width: 3rem; }
                    .w-20 { width: 5rem; }
                    .w-24 { width: 6rem; }
                    .w-28 { width: 7rem; }
                    .w-64 { width: 16rem; }
                    .w-1\\/3 { width: 33.333333%; }
                    .w-2\\/3 { width: 66.666667%; }
                    .h-8 { height: 2rem; }
                    .h-12 { height: 3rem; }
                    .h-20 { height: 5rem; }
                    .w-full { width: 100%; }
                    .flex-1 { flex: 1; }
                    
                    /* Sombras y efectos */
                    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
                    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
                    .relative { position: relative; }
                    .absolute { position: absolute; }
                    .inset-x-0 { left: 0; right: 0; }
                    .bottom-0 { bottom: 0; }
                    .z-10 { z-index: 10; }
                    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                    
                    /* Print specific styles */
                    @media print {
                        body { margin: 0; color: black; }
                        .receipt-container { max-width: none; }
                        .shadow-lg, .shadow-sm { box-shadow: none; }
                        .bg-gradient-blue { background: #1e40af !important; }
                        .bg-gradient-blue-header { background: #1e40af !important; }
                        .bg-gradient-blue-light { background: #eff6ff !important; }
                        .bg-gradient-yellow { background: #fefce8 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    ${printContent.innerHTML}
                </div>
            </body>
            </html>
        `)
        printWindow.document.close()
        // Adding slight timeout to ensure styles apply
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 300)
    }

    if (!show || !packageData) return null

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 modal-overlay-bokeh backdrop-blur-sm transition-all duration-300 opacity-100">
            <div className="absolute inset-0" aria-hidden="true" onClick={onClose}></div>

            <div
                className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-3xl sm:w-full border border-gray-100/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white px-4 py-1">
                    {/* El mensaje de éxito ahora se muestra vía toast al registrar */}
                </div>

                <div id="receipt-content" className="bg-white">
                    <div className="p-4 max-w-3xl mx-auto bg-white border-2 border-blue-800 rounded-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <div className="relative mr-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                                        <svg className="w-8 h-8 text-white" viewBox="0 0 100 100" fill="currentColor">
                                            <rect x="10" y="35" width="80" height="30" rx="4" fill="currentColor" />
                                            <rect x="15" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)" />
                                            <rect x="35" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)" />
                                            <rect x="55" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)" />
                                            <circle cx="25" cy="70" r="6" fill="currentColor" />
                                            <circle cx="75" cy="70" r="6" fill="currentColor" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-blue-800 tracking-wide">TRANS</h1>
                                    <h2 className="text-3xl font-black text-blue-900 -mt-1 tracking-wider">Comarapa</h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="grid grid-cols-4 gap-1 mb-1">
                                    <div className="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">LUGAR</div>
                                    <div className="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">DÍA</div>
                                    <div className="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">MES</div>
                                    <div className="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">AÑO</div>
                                </div>
                                <div className="grid grid-cols-4 gap-1 mb-2">
                                    <div className="border border-gray-600 px-2 py-1 text-xs font-semibold text-center bg-gray-50">{originName.slice(0, 3).toUpperCase()}</div>
                                    <div className="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{currentDay}</div>
                                    <div className="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{currentMonth}</div>
                                    <div className="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{currentYear}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 mt-2">
                            <h3 className="text-lg font-black text-blue-800 tracking-wide">EMISIÓN DE ENCOMIENDA</h3>
                            <div className="bg-red-600 text-white px-3 py-1 rounded shadow-sm border border-red-700">
                                <span className="text-sm font-bold tracking-wider">N° {packageData.tracking_number || packageNumber}</span>
                            </div>
                        </div>

                        <div className="text-xs text-blue-700 mb-6 font-medium leading-relaxed">
                            <p>{`\uD83D\uDCCD`} <strong>Of. Santa Cruz:</strong> Av. Doble Vía La Guardia 4to. Anillo • <strong>Cel.:</strong> 68921188</p>
                            <p>{`\uD83D\uDCCD`} <strong>Of. Comarapa:</strong> Av. Comarapa • <strong>Cel.:</strong> 68921154</p>
                            <p>{`\uD83D\uDCCD`} <strong>Of. San Isidro:</strong> <strong>Cel.:</strong> 71641780</p>
                            <p>{`\uD83D\uDCCD`} <strong>Of. Los Negros:</strong> <strong>Cel.:</strong> 71641781</p>
                        </div>

                        <div className="space-y-1 mb-4 text-sm">
                            <div className="flex items-center">
                                <span className="text-blue-800 font-bold w-24">Remitente:</span>
                                <div className="flex-1 relative">
                                    <span className="bg-white pr-2 relative z-10">{getSenderNameStr(packageData.sender)} (CI: {packageData.sender?.document_id || ''})</span>
                                    <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                                </div>
                            </div>

                            <div className="flex items-center mt-2">
                                <span className="text-blue-800 font-bold w-24">Destinatario:</span>
                                <div className="flex-1 relative">
                                    <span className="bg-white pr-2 relative z-10">{getRecipientNameStr(packageData.recipient)} (CI: {packageData.recipient?.document_id || ''})</span>
                                    <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                                <div className="flex items-center">
                                    <span className="text-blue-800 font-bold w-24 flex-shrink-0">Origen:</span>
                                    <div className="flex-1 relative">
                                        <span className="bg-white pr-2 relative z-10">{originName}</span>
                                        <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-blue-800 font-bold w-24 flex-shrink-0">Destino:</span>
                                    <div className="flex-1 relative">
                                        <span className="bg-white pr-2 relative z-10">{destinationName}</span>
                                        <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-blue-800 font-bold w-24 flex-shrink-0">Estado Pago:</span>
                                    <div className="flex-1 relative">
                                        <span className="bg-white pr-2 relative z-10 truncate" title={packageData.payment_status === 'paid_on_send' ? 'Pagado (Efectivo)' : 'Por cobrar'}>
                                            {packageData.payment_status === 'paid_on_send' ? 'Pagado' : 'Por cobrar'}
                                        </span>
                                        <div className="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-blue-800 rounded-sm mb-4 overflow-hidden">
                            <div className="grid grid-cols-12 bg-blue-800 relative z-10">
                                <div className="col-span-2 text-white p-1 text-center font-bold text-xs">CANT.</div>
                                <div className="col-span-7 text-white p-1 text-center font-bold text-xs">DETALLE</div>
                                <div className="col-span-3 text-white p-1 text-center font-bold text-xs">MONTO</div>
                            </div>

                            <div className="bg-gray-50 text-sm">
                                {packageData.items?.map((item: any, index: number) => (
                                    <div key={index} className="grid grid-cols-12 border-b border-gray-300">
                                        <div className="col-span-2 p-2 text-center">{item.quantity}</div>
                                        <div className="col-span-7 p-2 truncate">{item.description}</div>
                                        <div className="col-span-3 p-2 text-center">Bs. {(item.quantity * item.unit_price).toFixed(2)}</div>
                                    </div>
                                ))}

                                {Array.from({ length: Math.max(0, 3 - (packageData.items?.length || 0)) }).map((_, n) => (
                                    <div key={`empty-${n}`} className="grid grid-cols-12 border-b border-gray-200">
                                        <div className="col-span-2 p-2">&nbsp;</div>
                                        <div className="col-span-7 p-2">&nbsp;</div>
                                        <div className="col-span-3 p-2">&nbsp;</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-12 bg-blue-50 border-t-2 border-blue-800">
                                <div className="col-span-9 p-2 text-right font-bold text-sm text-blue-900">TOTAL:</div>
                                <div className="col-span-3 p-2 text-center font-bold text-sm text-blue-900">Bs. {totalAmount.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs mb-2">
                            <div className="w-2/3">
                                <p className="text-gray-600 mb-1">Pasado los 30 días la empresa no se responsabiliza.</p>
                            </div>
                            <div className="text-center w-1/3">
                                <div className="border-t border-dotted border-gray-500 w-full mb-1"></div>
                                <p className="text-blue-800 font-bold" style={{ fontSize: '10px' }}>RECIBÍ CONFORME</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={printReceipt}
                        className="w-full sm:w-auto px-4 py-2 border border-blue-600 rounded text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 focus:outline-none"
                    >
                        Imprimir Recibo
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 border border-transparent rounded text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
