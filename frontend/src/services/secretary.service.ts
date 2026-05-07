import { apiFetch } from '@/lib/api'
import type { Secretary } from '@/types'

export const secretaryService = {
    getAll: async (): Promise<Secretary[]> => {
        const response = await apiFetch('/secretaries') as Secretary[] | { items?: Secretary[] }
        return Array.isArray(response) ? response : response.items || []
    },

    getById: async (id: number): Promise<Secretary> => {
        return await apiFetch(`/secretaries/${id}`) as Secretary
    },

    getByUserId: async (userId: number | string): Promise<Secretary> => {
        return await apiFetch(`/secretaries/by-user/${userId}`) as Secretary
    },

    create: async (data: Record<string, unknown>): Promise<unknown> => {
        return await apiFetch('/secretaries', { method: 'POST', body: data })
    },

    update: async (id: number, data: Record<string, unknown>): Promise<Secretary> => {
        return await apiFetch(`/secretaries/${id}`, {
            method: 'PATCH',
            body: data,
        }) as Secretary
    },

    delete: async (id: number): Promise<unknown> => {
        return await apiFetch(`/secretaries/${id}`, { method: 'DELETE' })
    },

    getUser: async (secretaryId: number): Promise<{ email: string; is_active: boolean }> => {
        return await apiFetch(`/secretaries/${secretaryId}/user`) as { email: string; is_active: boolean }
    },
}
