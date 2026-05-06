import { apiFetch } from '@/lib/api'
import type { Secretary } from '@/types'

export const secretaryService = {
    getAll: async (): Promise<Secretary[]> => {
        const response = await apiFetch('/secretaries') as Secretary[] | { items?: Secretary[] }
        return Array.isArray(response) ? response : response.items || []
    },

    getByUserId: async (userId: number | string): Promise<Secretary> => {
        return await apiFetch(`/secretaries/by-user/${userId}`) as Secretary
    },

    update: async (id: number, data: Partial<Secretary>): Promise<Secretary> => {
        return await apiFetch(`/secretaries/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }) as Secretary
    },

    getUser: async (secretaryId: number): Promise<{ email: string; is_active: boolean }> => {
        return await apiFetch(`/secretaries/${secretaryId}/user`) as { email: string; is_active: boolean }
    },
}
