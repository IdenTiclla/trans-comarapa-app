/* eslint-disable no-restricted-syntax */
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  title: string
  columns: string[]
  rows: string[][]
}

export function DetailTable({ title, columns, rows }: Props) {
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
                  {columns.map((col) => (
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
            <Button
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-none"
            >
              {expanded ? 'Mostrar menos' : `Ver todos (${rows.length})`}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
