import { apiFetch } from '@/lib/api'

export const personService = {
    getById(personId: number) {
        return apiFetch(`/persons/${personId}`)
    },

    update(personId: number, data: Record<string, unknown>) {
        return apiFetch(`/persons/${personId}`, { method: 'PUT', body: data })
    },

    list(filters: { skip?: number; limit?: number; person_type?: string } = {}) {
        return apiFetch('/persons', { params: filters as Record<string, unknown> })
    },

    getByUserId(userId: number) {
        return apiFetch(`/persons/by-user/${userId}`)
    },
}
