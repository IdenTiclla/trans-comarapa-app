export function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{value}</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
        </div>
      </div>
    </div>
  )
}
