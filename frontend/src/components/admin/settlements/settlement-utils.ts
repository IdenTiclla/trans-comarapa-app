import { LOCALE } from '@/lib/locale-config'

export function fmt(value: number): string {
    return `Bs. ${(value ?? 0).toLocaleString(LOCALE, { minimumFractionDigits: 2 })}`
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString(LOCALE, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function formatDateTime(dateStr: string): string {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString(LOCALE, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
