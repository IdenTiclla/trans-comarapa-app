import { apiFetch } from '@/lib/api'

const RESOURCE_URL = '/assistants'

export const assistantService = {
    getAll(params: Record<string, unknown> = {}) {
        return apiFetch(RESOURCE_URL, { params })
    },
}
