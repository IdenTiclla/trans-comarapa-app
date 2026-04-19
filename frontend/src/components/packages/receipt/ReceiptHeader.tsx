interface Props {
  originCode: string
  day: string
  month: string
  year: string
}

export function ReceiptHeader({ originCode, day, month, year }: Props) {
  return (
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
          <div className="border border-gray-600 px-2 py-1 text-xs font-semibold text-center bg-gray-50">{originCode}</div>
          <div className="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{day}</div>
          <div className="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{month}</div>
          <div className="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{year}</div>
        </div>
      </div>
    </div>
  )
}
