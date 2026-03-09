/**
 * Pure formatting functions for trip data.
 * Extracted from hooks/use-trip-details.ts and TripDetailPage.tsx constant definitions.
 * These are stateless formatters — they belong in lib/, not in hooks/.
 */

// ── Status mappings ───────────────────────────────────────────────────────────

export const TRIP_STATUS_LABELS: Record<string, string> = {
    scheduled: 'Programado',
    boarding: 'Abordando',
    departed: 'Despachado',
    in_progress: 'En Progreso',
    arrived: 'Llegó',
    completed: 'Completado',
    cancelled: 'Cancelado',
}

export const TRIP_STATUS_BADGE: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    boarding: 'bg-purple-100 text-purple-800',
    departed: 'bg-orange-100 text-orange-800',
    in_progress: 'bg-orange-100 text-orange-800',
    arrived: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

// ── Formatting functions ──────────────────────────────────────────────────────

export function formatTripDate(dateString: string): string {
    if (!dateString) return 'N/A'
    try {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(dateString))
    } catch {
        return dateString
    }
}

export function formatTripTime(timeString: string): string {
    if (!timeString) return 'N/A'
    try {
        const parts = timeString.split(':')
        const date = new Date()
        date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0)
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
        return timeString
    }
}

export function formatTimeAmPm(timeString: string): string {
    if (!timeString) return ''
    const parts = timeString.split(':')
    if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10)
        const minutes = parts[1]
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        return `${displayHours}:${minutes} ${period}`
    }
    return timeString
}

export function getTripStatusClass(status: string): string {
    return TRIP_STATUS_BADGE[status] || 'bg-gray-100 text-gray-800'
}

export function getTripStatusText(status: string): string {
    return TRIP_STATUS_LABELS[status] || status
}
