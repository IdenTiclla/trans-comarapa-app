import { useMemo, useState } from 'react'

interface UsePaginatedListResult<T> {
    paginatedItems: T[]
    currentPage: number
    setCurrentPage: (page: number) => void
    totalPages: number
    startItem: number
    endItem: number
    pageSize: number
}

/**
 * Slice paginado + metadata para uso con `<Pagination variant="full">`.
 *
 * El hook auto-resetea a la página 1 cuando el conjunto se reduce por
 * debajo de la página actual (típicamente al aplicar filtros), evitando
 * quedar en una página vacía.
 */
export function usePaginatedList<T>(items: T[], pageSize: number): UsePaginatedListResult<T> {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

    // Auto-corrige durante el render si el dataset se redujo (ej. al filtrar)
    // y la página actual quedó fuera de rango. React vuelve a renderizar
    // sin commit visible.
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

    return { paginatedItems, currentPage: safePage, setCurrentPage, totalPages, startItem, endItem, pageSize }
}
