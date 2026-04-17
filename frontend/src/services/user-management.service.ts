import { apiFetch } from '@/lib/api'

export const userManagementService = {
    getAll(params: { skip?: number; limit?: number; search?: string; role?: string; is_active?: boolean } = {}) {
        return apiFetch('/users', { params: params as Record<string, unknown> })
    },

    getById(userId: number) {
        return apiFetch(`/users/${userId}`)
    },

    create(data: Record<string, unknown>) {
        return apiFetch('/users', { method: 'POST', body: data })
    },

    update(userId: number, data: Record<string, unknown>) {
        return apiFetch(`/users/${userId}`, { method: 'PUT', body: data })
    },

    delete(userId: number) {
        return apiFetch(`/users/${userId}`, { method: 'DELETE' })
    },

    activate(userId: number) {
        return apiFetch(`/users/${userId}/activate`, { method: 'PATCH' })
    },

    deactivate(userId: number) {
        return apiFetch(`/users/${userId}/deactivate`, { method: 'PATCH' })
    },

    getRoles() {
        return apiFetch('/roles')
    },
}
