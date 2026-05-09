export default function BusSeatLegend() {
    const items = [
        { label: 'Disponible', className: 'border-status-available/60 bg-status-available/10' },
        { label: 'Seleccionado', className: 'border-primary bg-primary/10' },
        { label: 'Reservado', className: 'border-status-medium/60 bg-status-medium/10' },
        { label: 'Ocupado', className: 'border-status-full/60 bg-status-full/10' },
        { label: 'Bloqueado', className: 'border-border bg-muted' },
    ]

    return (
        <div className="border-b border-border px-4 py-3 print:hidden sm:px-6 md:px-8">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" role="list" aria-label="Estados de asientos">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5" role="listitem">
                        <span className={`h-4 w-4 rounded-sm border-2 ${item.className}`} aria-hidden="true" />
                        <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
