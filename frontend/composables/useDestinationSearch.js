import { ref, computed } from 'vue'

export function useDestinationSearch() {
  // Estado para tipo de destino (existente o nuevo)
  const destinationType = ref('existing')
  
  // Estado para búsqueda de destinos existentes
  const destinationSearchQuery = ref('')
  const foundDestinations = ref([])
  const searchingDestinations = ref(false)
  const hasSearchedDestinations = ref(false)
  const selectedExistingDestination = ref(null)
  
  // Estado para nuevo destino
  const newDestinationForm = ref({
    name: '',
    description: ''
  })
  
  // Computed properties
  const hasSelectedExistingDestination = computed(() => {
    return selectedExistingDestination.value !== null
  })
  
  const hasSearched = computed(() => {
    return hasSearchedDestinations.value
  })
  
  // Función para buscar destinos
  const searchDestinations = async (originLocationId = null) => {
    if (!destinationSearchQuery.value.trim()) {
      foundDestinations.value = []
      hasSearchedDestinations.value = false
      return
    }
    
    searchingDestinations.value = true
    hasSearchedDestinations.value = false
    
    try {
      const config = useRuntimeConfig()
      const params = {
        search: destinationSearchQuery.value.trim()
      }
      
      // Si tenemos el ID de la ubicación de origen, filtrar por rutas desde ese origen
      if (originLocationId) {
        params.origin_location_id = originLocationId
      }
      
      const response = await $fetch(`${config.public.apiBaseUrl}/locations/search-destinations`, {
        params
      })
      
      foundDestinations.value = response || []
      hasSearchedDestinations.value = true
    } catch (error) {
      console.error('Error searching destinations:', error)
      foundDestinations.value = []
      hasSearchedDestinations.value = true
    } finally {
      searchingDestinations.value = false
    }
  }
  
  // Función para seleccionar destino existente
  const selectExistingDestination = (destination) => {
    // Crear un objeto plano para evitar problemas de serialización
    selectedExistingDestination.value = {
      id: destination.id,
      name: destination.name,
      description: destination.description,
      latitude: destination.latitude,
      longitude: destination.longitude,
      address: destination.address,
      city: destination.city,
      state: destination.state,
      country: destination.country
    }
    destinationSearchQuery.value = destination.name
  }
  
  // Función para limpiar selección de destino existente
  const clearExistingDestinationSelection = () => {
    selectedExistingDestination.value = null
    destinationSearchQuery.value = ''
  }
  
  // Función para crear nuevo destino
  const createDestination = async (destinationData) => {
    try {
      const config = useRuntimeConfig()
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      
      const response = await $fetch(`${config.public.apiBaseUrl}/locations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: destinationData.name,
          description: destinationData.description || '',
          // Valores por defecto para campos requeridos
          latitude: 0.0,
          longitude: 0.0,
          address: 'Dirección por definir',
          city: 'Ciudad por definir',
          state: 'Estado por definir',
          country: 'Bolivia'
        }
      })
      
      return response
    } catch (error) {
      console.error('Error creating destination:', error)
      throw error
    }
  }
  
  // Función para obtener o crear destino
  const getOrCreateDestination = async () => {
    if (destinationType.value === 'existing' && selectedExistingDestination.value) {
      return selectedExistingDestination.value
    }
    
    if (destinationType.value === 'new' && newDestinationForm.value.name) {
      return await createDestination(newDestinationForm.value)
    }
    
    throw new Error('No destination selected or form incomplete')
  }
  
  // Función para resetear búsqueda
  const resetDestinationSearch = () => {
    destinationType.value = 'existing'
    destinationSearchQuery.value = ''
    foundDestinations.value = []
    searchingDestinations.value = false
    hasSearchedDestinations.value = false
    selectedExistingDestination.value = null
    newDestinationForm.value = {
      name: '',
      description: ''
    }
  }
  
  return {
    // Estados reactivos
    destinationType,
    destinationSearchQuery,
    foundDestinations,
    searchingDestinations,
    hasSearchedDestinations,
    selectedExistingDestination,
    newDestinationForm,
    
    // Computed properties
    hasSelectedExistingDestination,
    hasSearched,
    
    // Métodos
    searchDestinations,
    selectExistingDestination,
    clearExistingDestinationSelection,
    createDestination,
    getOrCreateDestination,
    resetDestinationSearch
  }
}