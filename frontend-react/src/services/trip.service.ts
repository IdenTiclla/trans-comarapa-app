import { apiFetch } from '@/lib/api'

const RESOURCE_URL = '/trips'

export interface TripQueryParams {
    search?: string
    origin?: string
    destination?: string
    status?: string
    date?: string
    date_from?: string
    date_to?: string
    min_seats?: number
    upcoming?: boolean
    sort_by?: string
    sort_direction?: string
    page?: number
    limit?: number
    itemsPerPage?: number
    skip?: number
}

function buildTripParams(params: TripQueryParams): Record<string, unknown> {
    const queryParams: Record<string, unknown> = { ...params }

    // Map pagination
    if (params.itemsPerPage && !params.limit) {
        queryParams.limit = params.itemsPerPage
    }
    delete queryParams.itemsPerPage

    if (params.page && typeof queryParams.limit === 'number') {
        queryParams.skip = (params.page - 1) * (queryParams.limit as number)
        delete queryParams.page
    } else {
        delete queryParams.page
    }

    // Map camelCase → snake_case
    if (params.date_from === undefined && (params as Record<string, unknown>).dateFrom) {
        queryParams.date_from = (params as Record<string, unknown>).dateFrom
        delete (queryParams as Record<string, unknown>).dateFrom
    }
    if (params.date_to === undefined && (params as Record<string, unknown>).dateTo) {
        queryParams.date_to = (params as Record<string, unknown>).dateTo
        delete (queryParams as Record<string, unknown>).dateTo
    }
    if (params.min_seats === undefined && (params as Record<string, unknown>).minSeats) {
        queryParams.min_seats = (params as Record<string, unknown>).minSeats
        delete (queryParams as Record<string, unknown>).minSeats
    }
    if (params.sort_by === undefined && (params as Record<string, unknown>).sortBy) {
        queryParams.sort_by = (params as Record<string, unknown>).sortBy
        delete (queryParams as Record<string, unknown>).sortBy
    }
    if (params.sort_direction === undefined && (params as Record<string, unknown>).sortDirection) {
        queryParams.sort_direction = (params as Record<string, unknown>).sortDirection
        delete (queryParams as Record<string, unknown>).sortDirection
    }

    // Handle upcoming filter
    if (params.upcoming === true) {
        queryParams.status = queryParams.status || 'scheduled,in_progress'
    } else {
        delete queryParams.upcoming
    }

    // Clean empty values
    for (const key of Object.keys(queryParams)) {
        if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
            delete queryParams[key]
        }
    }

    return queryParams
}

export const tripService = {
    getAll(params: TripQueryParams = {}) {
        return apiFetch(RESOURCE_URL, { params: buildTripParams(params) })
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

    dispatch(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}/dispatch`, { method: 'POST' })
    },

    finish(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}/finish`, { method: 'POST' })
    },

    cancel(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}/cancel`, { method: 'POST' })
    },

    getSeats(tripId: number) {
        return apiFetch(`${RESOURCE_URL}/${tripId}/seats`)
    },

    getMyTrips(params?: { status?: string }) {
        const query = params?.status ? `?status=${params.status}` : ''
        return apiFetch(`${RESOURCE_URL}/my-trips${query}`)
    },
}
