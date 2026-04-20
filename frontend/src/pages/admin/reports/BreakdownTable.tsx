/* eslint-disable no-restricted-syntax */
import { fmt } from './constants'

interface Props {
  title: string
  labelColumn: string
  entries: Array<[string, { count: number; total: number }]>
  labelFor?: (key: string) => string
  sort?: boolean
}

export function BreakdownTable({ title, labelColumn, entries, labelFor, sort = false }: Props) {
  if (entries.length === 0) return null
  const sorted = sort ? [...entries].sort((a, b) => b[1].total - a[1].total) : entries

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-600">{labelColumn}</th>
            <th className="text-right px-4 py-2 font-medium text-gray-600">Cantidad</th>
            <th className="text-right px-4 py-2 font-medium text-gray-600">Total (Bs)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([key, info]) => (
            <tr key={key} className="border-t border-gray-50">
              <td className="px-4 py-2 text-gray-900">{labelFor ? labelFor(key) : key}</td>
              <td className="px-4 py-2 text-right text-gray-700">{info.count}</td>
              <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(info.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
