import { useMemo, useState } from 'react'

interface UsePaginatedListResult<T> {
    paginatedItems: T[]
    currentPage: number
    setCurrentPage: (page: number) => void
    totalPages: number
    startItem: number
    endItem: number
    pageSize: number
    pageAnnouncement: string
}

export function usePaginatedList<T>(items: T[], pageSize: number): UsePaginatedListResult<T> {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

    if (currentPage > totalPages && currentPage !== 1) {
        setCurrentPage(1)
    }

    const safePage = Math.min(currentPage, totalPages)

    const paginatedItems = useMemo(
        () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
        [items, safePage, pageSize],
    )

    const startItem = items.length === 0 ? 0 : (safePage - 1) * pageSize + 1
    const endItem = Math.min(safePage * pageSize, items.length)

    const pageAnnouncement = items.length === 0
        ? 'Sin resultados'
        : `Mostrando ${startItem} a ${endItem} de ${items.length} resultados — página ${safePage} de ${totalPages}`

    return { paginatedItems, currentPage: safePage, setCurrentPage, totalPages, startItem, endItem, pageSize, pageAnnouncement }
}
