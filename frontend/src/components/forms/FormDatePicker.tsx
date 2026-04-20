import { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface FormDatePickerProps {
  value?: Date | string | null
  onChange?: (date: Date | null) => void
  label?: string
  placeholder?: string
  format?: string
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  minDate?: Date | string | null
  maxDate?: Date | string | null
  id?: string
}

const DAYS_OF_WEEK = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function formatDate(date: Date, fmt: string) {
  const dd = date.getDate().toString().padStart(2, '0')
  const MM = (date.getMonth() + 1).toString().padStart(2, '0')
  const yyyy = date.getFullYear().toString()
  return fmt.replace('dd', dd).replace('MM', MM).replace('yyyy', yyyy).replace('yy', yyyy.slice(-2))
}

export default function FormDatePicker({
  value = null,
  onChange,
  label,
  placeholder = 'Seleccionar fecha',
  format = 'dd/MM/yyyy',
  error,
  helpText,
  required,
  disabled,
  clearable = true,
  minDate: minDateProp = null,
  maxDate: maxDateProp = null,
  id: propId,
}: FormDatePickerProps) {
  const autoId = useId()
  const id = propId ?? autoId

  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedDate = useMemo(() => {
    if (!value) return null
    if (value instanceof Date) return value
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }, [value])

  const displayValue = selectedDate ? formatDate(selectedDate, format) : ''

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (minDateProp) {
        const min = minDateProp instanceof Date ? minDateProp : new Date(minDateProp)
        const minStart = new Date(min.getFullYear(), min.getMonth(), min.getDate())
        if (date < minStart) return true
      }
      if (maxDateProp) {
        const max = maxDateProp instanceof Date ? maxDateProp : new Date(maxDateProp)
        const maxEnd = new Date(max.getFullYear(), max.getMonth(), max.getDate(), 23, 59, 59, 999)
        if (date > maxEnd) return true
      }
      return false
    },
    [minDateProp, maxDateProp]
  )

  const calendarDays = useMemo(() => {
    const days: { day: number; date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }[] = []
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    const today = new Date()

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const date = new Date(currentYear, currentMonth - 1, d)
      days.push({ day: d, date, isCurrentMonth: false, isToday: isSameDay(date, today), isSelected: !!selectedDate && isSameDay(date, selectedDate), isDisabled: isDateDisabled(date) })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(currentYear, currentMonth, d)
      days.push({ day: d, date, isCurrentMonth: true, isToday: isSameDay(date, today), isSelected: !!selectedDate && isSameDay(date, selectedDate), isDisabled: isDateDisabled(date) })
    }

    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(currentYear, currentMonth + 1, d)
      days.push({ day: d, date, isCurrentMonth: false, isToday: isSameDay(date, today), isSelected: !!selectedDate && isSameDay(date, selectedDate), isDisabled: isDateDisabled(date) })
    }

    return days
  }, [currentYear, currentMonth, selectedDate, isDateDisabled])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync calendar to selected date
  useEffect(() => {
    if (selectedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentMonth(selectedDate.getMonth())
      setCurrentYear(selectedDate.getFullYear())
    }
  }, [selectedDate])

  const toggleCalendar = () => {
    if (disabled) return
    setIsOpen((o) => {
      if (!o && selectedDate) {
        setCurrentMonth(selectedDate.getMonth())
        setCurrentYear(selectedDate.getFullYear())
      }
      return !o
    })
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  return (
    <div className={cn("space-y-1.5", !label && "space-y-0")} ref={containerRef}>
      {label && (
        <label htmlFor={id} className={cn(
          "block text-sm font-semibold transition-colors duration-200",
          error ? "text-red-500" : "text-gray-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={toggleCalendar}
          className={cn(
            "relative w-full rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center min-h-[48px]",
            error
              ? "border-red-100 bg-red-50/30 text-red-900"
              : "border-gray-100 bg-gray-50/50 text-gray-900 group-hover:border-gray-200 group-hover:bg-gray-100/50",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100 border-gray-100",
            isOpen && (error ? "ring-4 ring-red-50/50 border-red-200" : "ring-4 ring-blue-50/50 border-blue-200 bg-white shadow-sm")
          )}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className={cn("h-5 w-5 transition-colors duration-200", error ? "text-red-400" : "text-gray-400 group-focus-within:text-blue-500")} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <input
            id={id}
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            value={displayValue}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            className="w-full border-none py-2.5 pl-12 pr-12 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:ring-0 cursor-pointer"
          />

          {value && clearable && !disabled && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-all focus:outline-none"
                onClick={(e) => { e.stopPropagation(); onChange?.(null) }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-72 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-4 animate-in fade-in zoom-in duration-200 origin-top">
            <div className="flex justify-between items-center mb-4">
              <button type="button" className="p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none" onClick={(e) => { e.stopPropagation(); prevMonth() }}>
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="text-sm font-bold text-gray-900 tracking-tight">{MONTH_NAMES[currentMonth]} {currentYear}</div>
              <button type="button" className="p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none" onClick={(e) => { e.stopPropagation(); nextMonth() }}>
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={day.isDisabled}
                  onClick={(e) => { e.stopPropagation(); if (!day.isDisabled) { onChange?.(day.date); setIsOpen(false) } }}
                  className={cn(
                    "text-sm rounded-xl w-9 h-9 flex items-center justify-center transition-all duration-200",
                    day.isCurrentMonth ? "text-gray-700 font-medium" : "text-gray-300",
                    day.isToday && !day.isSelected && "text-blue-600 bg-blue-50 font-bold",
                    day.isSelected 
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-200 hover:bg-blue-700" 
                      : !day.isDisabled && "hover:bg-gray-100 hover:text-gray-900",
                    day.isDisabled && "opacity-30 cursor-not-allowed"
                  )}
                >
                  {day.day}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  const today = new Date()
                  if (!isDateDisabled(today)) { onChange?.(today); setIsOpen(false) }
                }}
              >
                Hoy
              </button>
              <button 
                type="button" 
                className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none" 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-500 animate-in slide-in-from-top-1 duration-200">{error}</p>
      ) : helpText ? (
        <p className="mt-1.5 text-xs text-gray-500">{helpText}</p>
      ) : null}
    </div>
  )
}
