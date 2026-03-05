import { apiFetch } from '@/lib/api'

export interface Secretary {
    id: number
    firstname: string
    lastname: string
    phone?: string
    document_id?: string
    user_id?: number
    is_active: boolean
}

export const secretaryService = {
    getAll: async (): Promise<Secretary[]> => {
        const response = await apiFetch('/secretaries') as any
        // The endpoint might return { items: Secretary[], total: number } or Secretary[]
        return Array.isArray(response) ? response : response.items || []
    },
}
