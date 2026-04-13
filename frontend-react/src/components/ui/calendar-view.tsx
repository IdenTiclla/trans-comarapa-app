import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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

  // Update current month/year when value changes externally (e.g. clicking 'Mañana')
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

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const date = new Date(currentYear, currentMonth - 1, d)
      days.push({ day: d, date, isCurrentMonth: false, isToday: isSameDay(date, today), isSelected: isSameDay(date, selectedDate) })
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(currentYear, currentMonth, d)
      days.push({ day: d, date, isCurrentMonth: true, isToday: isSameDay(date, today), isSelected: isSameDay(date, selectedDate) })
    }

    // Next month days
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
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleDateClick = (date: Date) => {
    if (disabled) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
  }

  return (
    <div className="w-64 bg-card text-card-foreground">
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          className="p-1 rounded-full hover:bg-muted transition-colors"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-bold truncate">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </div>
        <button
          type="button"
          className="p-1 rounded-full hover:bg-muted transition-colors"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-[10px] font-bold text-muted-foreground text-center uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDateClick(day.date)}
            className={cn(
              "text-xs rounded-lg w-8 h-8 flex items-center justify-center transition-all",
              day.isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-50",
              day.isToday && !day.isSelected && "bg-primary/10 text-primary font-bold border border-primary/20",
              day.isSelected ? "bg-primary text-primary-foreground font-bold shadow-sm" : "hover:bg-muted",
            )}
          >
            {day.day}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t flex justify-between gap-2">
        <button
          type="button"
          className="text-[10px] font-bold text-primary px-2 py-1 rounded hover:bg-primary/10 transition-colors uppercase"
          onClick={() => {
            const now = new Date()
            handleDateClick(now)
          }}
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
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date)
}
