import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { reportService, type ReportParams } from '@/services/report.service'
import { officeService } from '@/services/office.service'

type Tab = 'tickets' | 'packages' | 'cash'

/** Safe toFixed — handles undefined/null values */
function fmt(value: number | undefined | null, decimals = 2): string {
  return (value ?? 0).toFixed(decimals)
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  qr: 'QR',
  unknown: 'Desconocido',
}

const PACKAGE_STATUS_LABELS: Record<string, string> = {
  registered_at_office: 'En oficina',
  assigned_to_trip: 'Asignado',
  in_transit: 'En tránsito',
  arrived_at_destination: 'Llegó',
  delivered: 'Entregado',
}

const TX_TYPE_LABELS: Record<string, string> = {
  ticket_sale: 'Venta boleto',
  package_payment: 'Pago encomienda',
  por_cobrar_collection: 'Cobro por cobrar',
  withdrawal: 'Retiro',
  adjustment: 'Ajuste',
}

interface Office {
  id: number
  name: string
}

export function Component() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [officeId, setOfficeId] = useState<number | undefined>(undefined)
  const [offices, setOffices] = useState<Office[]>([])
  const [tab, setTab] = useState<Tab>('tickets')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      officeService.getAll().then((o: Office[]) => setOffices(o)).catch(() => {})
    }
  }, [isAdmin])

  const params: ReportParams = { year, month, office_id: officeId }

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      let result
      if (tab === 'tickets') result = await reportService.monthlyTickets(params)
      else if (tab === 'packages') result = await reportService.monthlyPackages(params)
      else result = await reportService.monthlyCash(params)
      setData(result)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [tab, year, month, officeId])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  function handleDownload() {
    reportService.downloadCsv(tab, params)
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes Mensuales</h1>
                <p className="text-gray-500 text-sm">{MONTH_NAMES[month - 1]} {year}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {isAdmin && (
                <select
                  value={officeId ?? ''}
                  onChange={e => setOfficeId(e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas las oficinas</option>
                  {offices.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit">
          {([['tickets', 'Boletos'], ['packages', 'Encomiendas'], ['cash', 'Caja']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : !data ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No se pudieron cargar los datos del reporte.
          </div>
        ) : (
          <>
            {tab === 'tickets' && <TicketReport data={data} />}
            {tab === 'packages' && <PackageReport data={data} />}
            {tab === 'cash' && <CashReport data={data} />}
          </>
        )}
      </div>
    </div>
  )
}

/* ---- Ticket Report ---- */
function TicketReport({ data }: { data: Record<string, unknown> }) {
  const d = {
    total_count: (data.total_count as number) ?? 0,
    total_revenue: (data.total_revenue as number) ?? 0,
    by_payment_method: (data.by_payment_method as Record<string, { count: number; total: number }>) ?? {},
    by_route: (data.by_route as Record<string, { count: number; total: number }>) ?? {},
    rows: (data.rows as { id: number; date: string; client: string; route: string; state: string; payment_method: string; price: number }[]) ?? [],
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Boletos" value={String(d.total_count)} color="indigo" />
        <SummaryCard label="Ingresos" value={`Bs ${fmt(d.total_revenue)}`} color="green" />
        {Object.entries(d.by_payment_method).map(([method, info]) => (
          <SummaryCard
            key={method}
            label={PAYMENT_LABELS[method] || method}
            value={`${info.count} — Bs ${fmt(info.total)}`}
            color="blue"
          />
        ))}
      </div>

      {/* By route */}
      {Object.keys(d.by_route).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Por Ruta</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Ruta</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Cantidad</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Total (Bs)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(d.by_route).sort((a, b) => b[1].total - a[1].total).map(([route, info]) => (
                <tr key={route} className="border-t border-gray-50">
                  <td className="px-4 py-2 text-gray-900">{route}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{info.count}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(info.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail table */}
      <DetailTable
        title="Detalle de Boletos"
        columns={['ID', 'Fecha', 'Cliente', 'Ruta', 'Pago', 'Precio']}
        rows={d.rows.map(r => [
          String(r.id),
          r.date,
          r.client || '—',
          r.route || '—',
          PAYMENT_LABELS[r.payment_method] || r.payment_method,
          `Bs ${fmt(r.price)}`,
        ])}
      />
    </div>
  )
}

/* ---- Package Report ---- */
function PackageReport({ data }: { data: Record<string, unknown> }) {
  const d = {
    total_count: (data.total_count as number) ?? 0,
    total_revenue: (data.total_revenue as number) ?? 0,
    by_status: (data.by_status as Record<string, { count: number; total: number }>) ?? {},
    by_payment_status: (data.by_payment_status as Record<string, { count: number; total: number }>) ?? {},
    rows: (data.rows as { id: number; tracking_number: string; date: string; sender: string; recipient: string; status: string; payment_status: string; items_count: number; amount: number }[]) ?? [],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Encomiendas" value={String(d.total_count)} color="indigo" />
        <SummaryCard label="Ingresos" value={`Bs ${fmt(d.total_revenue)}`} color="green" />
        {Object.entries(d.by_payment_status).map(([status, info]) => (
          <SummaryCard
            key={status}
            label={status === 'paid_on_send' ? 'Pagado al enviar' : status === 'collect_on_delivery' ? 'Por cobrar' : status}
            value={`${info.count} — Bs ${fmt(info.total)}`}
            color={status === 'collect_on_delivery' ? 'yellow' : 'blue'}
          />
        ))}
      </div>

      {/* By status */}
      {Object.keys(d.by_status).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Por Estado</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Cantidad</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Total (Bs)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(d.by_status).map(([status, info]) => (
                <tr key={status} className="border-t border-gray-50">
                  <td className="px-4 py-2 text-gray-900">{PACKAGE_STATUS_LABELS[status] || status}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{info.count}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(info.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DetailTable
        title="Detalle de Encomiendas"
        columns={['N°', 'Fecha', 'Remitente', 'Destinatario', 'Estado', 'Items', 'Monto']}
        rows={d.rows.map(r => [
          r.tracking_number,
          r.date,
          r.sender || '—',
          r.recipient || '—',
          PACKAGE_STATUS_LABELS[r.status] || r.status,
          String(r.items_count),
          `Bs ${fmt(r.amount)}`,
        ])}
      />
    </div>
  )
}

/* ---- Cash Report ---- */
function CashReport({ data }: { data: Record<string, unknown> }) {
  const d = {
    total_registers: (data.total_registers as number) ?? 0,
    total_income: (data.total_income as number) ?? 0,
    total_withdrawals: (data.total_withdrawals as number) ?? 0,
    net: (data.net as number) ?? 0,
    by_transaction_type: (data.by_transaction_type as Record<string, { count: number; total: number }>) ?? {},
    rows: (data.rows as { id: number; date: string; opened_at: string; closed_at: string; status: string; initial_balance: number; final_balance: number; income: number; withdrawals: number; transaction_count: number }[]) ?? [],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Cajas Registradas" value={String(d.total_registers)} color="indigo" />
        <SummaryCard label="Ingresos" value={`Bs ${fmt(d.total_income)}`} color="green" />
        <SummaryCard label="Retiros" value={`Bs ${fmt(d.total_withdrawals)}`} color="red" />
        <SummaryCard label="Neto" value={`Bs ${fmt(d.net)}`} color="blue" />
      </div>

      {/* By transaction type */}
      {Object.keys(d.by_transaction_type).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Por Tipo de Transacción</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Tipo</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Cantidad</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Total (Bs)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(d.by_transaction_type).map(([type, info]) => (
                <tr key={type} className="border-t border-gray-50">
                  <td className="px-4 py-2 text-gray-900">{TX_TYPE_LABELS[type] || type}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{info.count}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(info.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DetailTable
        title="Detalle de Cajas"
        columns={['ID', 'Fecha', 'Apertura', 'Cierre', 'Estado', 'Bal. Inicial', 'Bal. Final', 'Ingresos', 'Retiros', 'Txns']}
        rows={d.rows.map(r => [
          String(r.id),
          r.date,
          r.opened_at,
          r.closed_at || '—',
          r.status === 'open' ? 'Abierta' : 'Cerrada',
          `Bs ${fmt(r.initial_balance)}`,
          r.final_balance ? `Bs ${fmt(r.final_balance)}` : '—',
          `Bs ${fmt(r.income)}`,
          `Bs ${fmt(r.withdrawals)}`,
          String(r.transaction_count),
        ])}
      />
    </div>
  )
}

/* ---- Shared components ---- */

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold bg-gradient-to-r ${colorMap[color] || colorMap.indigo} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  )
}

function DetailTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  const [expanded, setExpanded] = useState(false)
  const displayRows = expanded ? rows : rows.slice(0, 10)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-400">{rows.length} registros</span>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-500">Sin datos para este período.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="text-left px-4 py-2 font-medium text-gray-600 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 text-gray-700 whitespace-nowrap">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              {expanded ? 'Mostrar menos' : `Ver todos (${rows.length})`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
