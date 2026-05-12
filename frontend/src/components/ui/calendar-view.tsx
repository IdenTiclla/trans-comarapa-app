import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOCALE } from '@/lib/locale-config'

const DAYS_OF_WEEK = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface CalendarViewProps {
  value: string // yyyy-mm-dd
  onChange: (date: string) => void
  disabled?: boolean
}

export function CalendarView({ value, onChange, disabled }: CalendarViewProps) {
  const selectedDate = React.useMemo(() => {
    if (!value) return new Date()
    const [y, m, d] = value.split('-')
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return isNaN(date.getTime()) ? new Date() : date
  }, [value])

  const [currentMonth, setCurrentMonth] = React.useState(selectedDate.getMonth())
  const [currentYear, setCurrentYear] = React.useState(selectedDate.getFullYear())
  const [announcement, setAnnouncement] = React.useState('')

  React.useEffect(() => {
    setCurrentMonth(selectedDate.getMonth())
    setCurrentYear(selectedDate.getFullYear())
  }, [selectedDate])

  const isSameDay = (a: Date, b: Date) => {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  }

  const calendarDays = React.useMemo(() => {
    const days: { day: number; date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = []
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    const today = new Date()

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const date = new Date(currentYear, currentMonth - 1, d)
      days.push({ day: d, date, isCurrentMonth: false, isToday: isSameDay(date, today), isSelected: isSameDay(date, selectedDate) })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(currentYear, currentMonth, d)
      days.push({ day: d, date, isCurrentMonth: true, isToday: isSameDay(date, today), isSelected: isSameDay(date, selectedDate) })
    }

    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(currentYear, currentMonth + 1, d)
      days.push({ day: d, date, isCurrentMonth: false, isToday: isSameDay(date, today), isSelected: isSameDay(date, selectedDate) })
    }

    return days
  }, [currentYear, currentMonth, selectedDate])

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
      setAnnouncement(`${MONTH_NAMES[11]} ${currentYear - 1}`)
    } else {
      const newMonth = currentMonth - 1
      setCurrentMonth(newMonth)
      setAnnouncement(`${MONTH_NAMES[newMonth]} ${currentYear}`)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
      setAnnouncement(`${MONTH_NAMES[0]} ${currentYear + 1}`)
    } else {
      const newMonth = currentMonth + 1
      setCurrentMonth(newMonth)
      setAnnouncement(`${MONTH_NAMES[newMonth]} ${currentYear}`)
    }
  }

  const handleDateClick = (date: Date) => {
    if (disabled) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setAnnouncement(`Seleccionado: ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`)
  }

  return (
    <div
      className="w-64 bg-card text-card-foreground"
      role="grid"
      aria-label={`Calendario — ${MONTH_NAMES[currentMonth]} ${currentYear}`}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          aria-label="Mes anterior"
          className="p-1 rounded-full hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          onClick={prevMonth}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="text-sm font-bold truncate" aria-live="polite">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </div>
        <button
          type="button"
          aria-label="Mes siguiente"
          className="p-1 rounded-full hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          onClick={nextMonth}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2" role="row">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} role="columnheader" className="text-[10px] font-bold text-muted-foreground text-center uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="row">
        {calendarDays.map((day, i) => (
          <button
            key={i}
            type="button"
            role="gridcell"
            aria-label={`${day.date.getDate()} de ${MONTH_NAMES[day.date.getMonth()]} de ${day.date.getFullYear()}${day.isToday ? ' (hoy)' : ''}${day.isSelected ? ' (seleccionado)' : ''}`}
            aria-selected={day.isSelected}
            disabled={disabled}
            onClick={() => handleDateClick(day.date)}
            className={cn(
              "text-xs rounded-lg w-8 h-8 flex items-center justify-center transition-all",
              day.isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-50",
              day.isToday && !day.isSelected && "bg-primary/10 text-primary font-bold border border-primary/20",
              day.isSelected ? "bg-primary text-primary-foreground font-bold shadow-sm" : "hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {day.day}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t flex justify-between gap-2">
        <button
          type="button"
          className="text-[10px] font-bold text-primary px-2 py-1 rounded hover:bg-primary/10 transition-colors uppercase focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          onClick={() => {
            const now = new Date()
            handleDateClick(now)
          }}
          disabled={disabled}
        >
          Ir a Hoy
        </button>
        <div className="text-[10px] text-muted-foreground flex items-center">
          Seleccionado: {displayShortDate(selectedDate)}
        </div>
      </div>
    </div>
  )
}

function displayShortDate(date: Date) {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(date)
}
