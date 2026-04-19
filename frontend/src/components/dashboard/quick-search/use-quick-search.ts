/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router'
import { clientService } from '@/services/client.service'
import { ticketService } from '@/services/ticket.service'
import { tripService } from '@/services/trip.service'
import { packageService, PACKAGE_STATUS_LABELS } from '@/services/package.service'
import type { CategoryId, SearchResult, ViewMode } from './types'

export function useQuickSearch() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('category')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open && !showDetailModal) {
      const timer = setTimeout(() => {
        setViewMode('category')
        setQuery('')
        setSelectedCategory(null)
        setResults([])
        setError(null)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open, showDetailModal])

  const performSearch = useCallback(async (categoryId: CategoryId, searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      let data: SearchResult[] = []
      const term = searchTerm.trim().toLowerCase()

      switch (categoryId) {
        case 'client': {
          const response = await clientService.search(term)
          data = (response.clients || response || []).map((c: any) => ({
            id: c.id,
            title: `${c.firstname || ''} ${c.lastname || ''}`.trim() || 'Sin nombre',
            subtitle: `CI: ${c.document_id || 'N/A'} - ${c.phone || 'Sin telefono'}`,
            category: 'client',
            data: c,
          }))
          break
        }
        case 'ticket': {
          const response = await ticketService.search(term, 20)
          const tickets = response.tickets || response || []
          data = tickets.map((t: any) => ({
            id: t.id,
            title: `Boleto #${t.id}`,
            subtitle: `${t.client?.firstname || ''} ${t.client?.lastname || ''} - Asiento ${t.seat?.seat_number || 'N/A'}`,
            category: 'ticket',
            data: t,
          }))
          break
        }
        case 'trip': {
          const response = await tripService.getAll({ search: term, limit: 20 })
          const trips = response.trips || response || []
          data = trips.map((t: any) => ({
            id: t.id,
            title: `${t.origin} -> ${t.destination}`,
            subtitle: `${t.date} - ${t.departure_time || ''} - Bus: ${t.bus?.plate || 'N/A'}`,
            category: 'trip',
            data: t,
          }))
          break
        }
        case 'package': {
          const response = await packageService.search(term)
          const packages = response.packages || response || []
          data = packages.map((p: any) => ({
            id: p.id,
            title: `Paquete ${p.tracking_number || `#${p.id}`}`,
            subtitle: `${p.recipient_name || 'Sin destinatario'} - ${PACKAGE_STATUS_LABELS[p.status] || p.status}`,
            category: 'package',
            data: p,
          }))
          break
        }
      }
      setResults(data)
      if (data.length === 0) setError('No se encontraron resultados')
    } catch (err: any) {
      setError(err.message || 'Error al buscar')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (viewMode === 'search' && selectedCategory) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        performSearch(selectedCategory, query)
      }, 300)
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
      }
    }
  }, [query, selectedCategory, viewMode, performSearch])

  const handleCategorySelect = useCallback((categoryId: CategoryId) => {
    setSelectedCategory(categoryId)
    setViewMode('search')
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  const handleItemSelect = useCallback(async (item: SearchResult) => {
    setSelectedItem(item)

    if (item.category === 'client') {
      setOpen(false)
      setShowDetailModal(true)
      return
    }
    if (item.category === 'trip') {
      setOpen(false)
      navigate(`/trips/${item.id}`)
      return
    }
    if (item.category === 'ticket') {
      setOpen(false)
      navigate(`/tickets/${item.id}`)
      return
    }
    if (item.category === 'package') {
      try {
        const fullPackageData = await packageService.getById(item.id)
        setSelectedItem({ ...item, data: fullPackageData })
      } catch {
        setError('Error al cargar el paquete')
        return
      }
    }

    setOpen(false)
    setShowDetailModal(true)
  }, [navigate])

  const handleBack = useCallback(() => {
    setViewMode('category')
    setSelectedCategory(null)
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  const handleDetailClose = useCallback(() => {
    setShowDetailModal(false)
    setSelectedItem(null)
  }, [])

  const clearQuery = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  return {
    open,
    setOpen,
    viewMode,
    query,
    setQuery,
    selectedCategory,
    results,
    isLoading,
    error,
    selectedItem,
    showDetailModal,
    handleCategorySelect,
    handleItemSelect,
    handleBack,
    handleDetailClose,
    clearQuery,
    navigate,
  }
}
