import { apiFetch } from '@/lib/api'

const RESOURCE_URL = '/routes'

export const routeService = {
    getAll(params: Record<string, unknown> = {}) {
        return apiFetch(RESOURCE_URL, { params })
    },

    getById(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}`)
    },

    create(data: Record<string, unknown>) {
        return apiFetch(RESOURCE_URL, { method: 'POST', body: data })
    },

    update(id: number, data: Record<string, unknown>) {
        return apiFetch(`${RESOURCE_URL}/${id}`, { method: 'PATCH', body: data })
    },

    delete(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}`, { method: 'DELETE' })
    },

    getWithSchedules() {
        return apiFetch(`${RESOURCE_URL}/with-schedules`)
    },

    getSchedules(routeId: number) {
        return apiFetch(`${RESOURCE_URL}/${routeId}/schedules`)
    },

    createSchedule(routeId: number, data: Record<string, unknown>) {
        return apiFetch(`${RESOURCE_URL}/${routeId}/schedules`, { method: 'POST', body: data })
    },

    updateSchedule(routeId: number, scheduleId: number, data: Record<string, unknown>) {
        return apiFetch(`${RESOURCE_URL}/${routeId}/schedules/${scheduleId}`, { method: 'PATCH', body: data })
    },

    deleteSchedule(routeId: number, scheduleId: number) {
        return apiFetch(`${RESOURCE_URL}/${routeId}/schedules/${scheduleId}`, { method: 'DELETE' })
    },

    search(origin: string, destination: string) {
        return apiFetch(`${RESOURCE_URL}/search`, { params: { origin, destination } })
    },
}
