import { apiFetch } from '@/lib/api'

const RESOURCE_URL = '/clients'

export const clientService = {
    getAll(
        filters: Record<string, unknown> = {},
        pagination: { page: number; itemsPerPage: number } = { page: 1, itemsPerPage: 10 }
    ) {
        return apiFetch(RESOURCE_URL, {
            params: {
                ...filters,
                skip: ((pagination.page - 1) * pagination.itemsPerPage).toString(),
                limit: pagination.itemsPerPage.toString(),
            },
        })
    },

    search(searchTerm: string) {
        return apiFetch(`${RESOURCE_URL}/search`, { params: { q: searchTerm } })
    },

    getById(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}`)
    },

    create(data: Record<string, unknown>) {
        return apiFetch(RESOURCE_URL, { method: 'POST', body: data })
    },

    update(id: number, data: Record<string, unknown>) {
        return apiFetch(`${RESOURCE_URL}/${id}`, { method: 'PUT', body: data })
    },

    delete(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}`, { method: 'DELETE' })
    },
}
