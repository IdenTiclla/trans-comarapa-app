/**
 * Package store - Composition API style.
 * 
 * Migrated from Options API, with 4 duplicate method pairs removed:
 * - fetchUnassignedPackages (was defined twice)
 * - assignToTrip (was defined twice)
 * - unassignFromTrip (was defined twice)
 * - updateStatus (was defined twice)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import packageService from '~/services/packageService'

export const usePackageStore = defineStore('packages', () => {
  // ── State ────────────────────────────────────────────────
  const packages = ref([])
  const unassignedPackages = ref([])
  const currentPackage = ref(null)
  const searchResults = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  })

  // ── Getters ──────────────────────────────────────────────
  const packageCount = computed(() => packages.value.length)
  const currentPackageItems = computed(() => currentPackage.value?.items || [])
  const currentPackageTotal = computed(() => {
    if (!currentPackage.value?.items) return 0
    return currentPackage.value.items.reduce(
      (total, item) => total + (item.quantity * item.unit_price), 0
    )
  })
  const currentPackageItemsCount = computed(() => {
    if (!currentPackage.value?.items) return 0
    return currentPackage.value.items.reduce((total, item) => total + item.quantity, 0)
  })

  // ── Internal helpers ─────────────────────────────────────
  function _handleApiResponse(response) {
    if (!response) throw new Error('Empty response from API')
    if (response.error) throw new Error(response.error)
    if (response.packages && response.pagination) {
      return { data: response.packages, pagination: response.pagination }
    }
    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: { totalItems: response.length, totalPages: 1, currentPage: 1, itemsPerPage: response.length },
      }
    }
    return { data: response }
  }

  // ── CRUD Actions ─────────────────────────────────────────
  async function fetchPackages(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = {}
      if (params.limit) queryParams.limit = params.limit
      if (params.skip) queryParams.skip = params.skip
      if (params.status && params.status !== 'all') queryParams.status = params.status
      const response = await packageService.getAllPackages(queryParams)
      const processed = _handleApiResponse(response)
      packages.value = processed.data || []
      if (processed.pagination) {
        pagination.value = { ...pagination.value, ...processed.pagination }
      }
      return packages.value
    } catch (err) {
      error.value = err.message || 'Error al cargar encomiendas'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUnassignedPackages(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await packageService.getUnassignedPackages(params)
      const processed = _handleApiResponse(response)
      unassignedPackages.value = processed.data || []
      return unassignedPackages.value
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Error al cargar encomiendas sin asignar'
      unassignedPackages.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPackageById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentPackage.value = await packageService.getPackageById(id)
      return currentPackage.value
    } catch (err) {
      error.value = err.message || 'Error al obtener la encomienda'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPackageByTrackingNumber(trackingNumber) {
    isLoading.value = true
    error.value = null
    try {
      currentPackage.value = await packageService.getPackageByTrackingNumber(trackingNumber)
      return currentPackage.value
    } catch (err) {
      error.value = err.message || 'Error al buscar por número de tracking'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createNewPackage(packageData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await packageService.createPackage(packageData)
      if (response?.id) packages.value.unshift(response)
      return response
    } catch (err) {
      error.value = err.message || 'Error al crear la encomienda'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateExistingPackage(id, packageData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await packageService.updatePackage(id, packageData)
      const idx = packages.value.findIndex(p => p.id === id)
      if (idx !== -1) packages.value[idx] = { ...packages.value[idx], ...response }
      return response
    } catch (err) {
      error.value = err.message || 'Error al actualizar la encomienda'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteExistingPackage(id) {
    isLoading.value = true
    error.value = null
    try {
      await packageService.deletePackage(id)
      packages.value = packages.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar la encomienda'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ── Trip assignment (deduplicated) ───────────────────────
  async function assignToTrip(packageId, tripId) {
    error.value = null
    try {
      const result = await packageService.assignPackageToTrip(packageId, tripId)
      const idx = packages.value.findIndex(p => p.id === packageId)
      if (idx !== -1) {
        packages.value[idx] = { ...packages.value[idx], status: 'assigned_to_trip', trip_id: tripId }
      }
      unassignedPackages.value = unassignedPackages.value.filter(p => p.id !== packageId)
      return result
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Error al asignar encomienda al viaje'
      throw err
    }
  }

  async function unassignFromTrip(packageId) {
    error.value = null
    try {
      const result = await packageService.unassignPackageFromTrip(packageId)
      const idx = packages.value.findIndex(p => p.id === packageId)
      if (idx !== -1) {
        packages.value[idx] = { ...packages.value[idx], status: 'registered_at_office', trip_id: null }
      }
      return result
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Error al desasignar encomienda del viaje'
      throw err
    }
  }

  async function updateStatus(packageId, newStatus, changedByUserId = null) {
    error.value = null
    try {
      const result = await packageService.updatePackageStatus(packageId, newStatus, changedByUserId)
      const idx = packages.value.findIndex(p => p.id === packageId)
      if (idx !== -1) {
        packages.value[idx] = { ...packages.value[idx], status: newStatus }
      }
      if (currentPackage.value?.id === packageId) {
        currentPackage.value.status = newStatus
      }
      return result
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Error al actualizar estado'
      throw err
    }
  }

  // ── Package items ────────────────────────────────────────
  async function fetchPackageItems(packageId) {
    try {
      const items = await packageService.getPackageItems(packageId)
      if (currentPackage.value?.id === packageId) currentPackage.value.items = items
      return items
    } catch (err) {
      console.error('Error fetching package items:', err)
      return []
    }
  }

  async function addPackageItem(packageId, itemData) {
    try {
      const newItem = await packageService.addPackageItem(packageId, itemData)
      if (currentPackage.value?.id === packageId) {
        if (!currentPackage.value.items) currentPackage.value.items = []
        currentPackage.value.items.push(newItem)
      }
      return newItem
    } catch (err) {
      console.error('Error adding package item:', err)
      throw err
    }
  }

  async function updatePackageItem(itemId, itemData) {
    try {
      const updated = await packageService.updatePackageItem(itemId, itemData)
      if (currentPackage.value?.items) {
        const idx = currentPackage.value.items.findIndex(i => i.id === itemId)
        if (idx !== -1) currentPackage.value.items[idx] = updated
      }
      return updated
    } catch (err) {
      console.error('Error updating package item:', err)
      throw err
    }
  }

  async function deletePackageItem(itemId) {
    try {
      await packageService.deletePackageItem(itemId)
      if (currentPackage.value?.items) {
        currentPackage.value.items = currentPackage.value.items.filter(i => i.id !== itemId)
      }
      return true
    } catch (err) {
      console.error('Error deleting package item:', err)
      throw err
    }
  }

  // ── Filtering and search ─────────────────────────────────
  async function fetchPackagesByTrip(tripId) {
    try {
      const response = await packageService.getPackagesByTrip(tripId)
      return Array.isArray(response) ? response : []
    } catch (err) {
      console.error('Error fetching packages by trip:', err)
      return []
    }
  }

  async function fetchPackagesByClient(clientId, type = 'sender') {
    try {
      const response = type === 'sender'
        ? await packageService.getPackagesBySender(clientId)
        : await packageService.getPackagesByRecipient(clientId)
      return Array.isArray(response) ? response : []
    } catch (err) {
      console.error('Error fetching packages by client:', err)
      return []
    }
  }

  async function searchPackagesByTerm(term) {
    isLoading.value = true
    error.value = null
    try {
      searchResults.value = await packageService.searchPackages(term)
      return searchResults.value
    } catch (err) {
      error.value = err.message || 'Error en la búsqueda'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // ── Utility ──────────────────────────────────────────────
  function calculateItemTotal(item) {
    return (item.quantity || 0) * (item.unit_price || 0)
  }

  function generateTrackingNumber() {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${timestamp}${random}`
  }

  function createEmptyItem() {
    return { quantity: 1, description: '', unit_price: 0, total_price: 0 }
  }

  function clearCurrentPackage() { currentPackage.value = null }
  function clearSearchResults() { searchResults.value = [] }
  function clearError() { error.value = null }

  function $reset() {
    packages.value = []
    unassignedPackages.value = []
    currentPackage.value = null
    searchResults.value = []
    isLoading.value = false
    error.value = null
    pagination.value = { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 10 }
  }

  return {
    // State
    packages, unassignedPackages, currentPackage, searchResults, isLoading, error, pagination,
    // Getters
    packageCount, currentPackageItems, currentPackageTotal, currentPackageItemsCount,
    // CRUD
    fetchPackages, fetchUnassignedPackages, fetchPackageById, fetchPackageByTrackingNumber,
    createNewPackage, updateExistingPackage, deleteExistingPackage,
    // Trip assignment
    assignToTrip, unassignFromTrip, updateStatus,
    // Items
    fetchPackageItems, addPackageItem, updatePackageItem, deletePackageItem,
    // Filtering
    fetchPackagesByTrip, fetchPackagesByClient, searchPackagesByTerm,
    // Utility
    calculateItemTotal, generateTrackingNumber, createEmptyItem,
    clearCurrentPackage, clearSearchResults, clearError, $reset,
  }
})