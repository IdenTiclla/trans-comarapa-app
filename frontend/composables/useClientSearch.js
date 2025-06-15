import { ref, computed } from 'vue'

export const useClientSearch = () => {
  const config = useRuntimeConfig()
  
  // Estado para tipo de cliente
  const clientType = ref('new')
  
  // Estado para búsqueda de clientes
  const clientSearchQuery = ref('')
  const foundClients = ref([])
  const searchingClients = ref(false)
  const hasSearched = ref(false)
  const selectedExistingClient = ref(null)
  
  let searchTimeout = null

  // Función para buscar clientes con debounce
  const searchClients = async () => {
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Si no hay query, limpiar resultados
    if (!clientSearchQuery.value.trim()) {
      foundClients.value = []
      hasSearched.value = false
      selectedExistingClient.value = null
      return
    }
    
    // Aplicar debounce de 500ms
    searchTimeout = setTimeout(async () => {
      searchingClients.value = true
      hasSearched.value = false
      
      try {
        const searchTerm = clientSearchQuery.value.trim()
        const apiUrl = `${config.public.apiBaseUrl}/clients/search?q=${encodeURIComponent(searchTerm)}`
        
        const response = await $fetch(apiUrl, {
          method: 'GET'
        })
        
        foundClients.value = response || []
        hasSearched.value = true
        
      } catch (error) {
        console.error('Error searching clients:', error)
        foundClients.value = []
        hasSearched.value = true
        
        if (error.response?.status === 400) {
          console.warn('Término de búsqueda muy corto o inválido')
        } else if (error.response?.status >= 500) {
          console.error('Error del servidor al buscar clientes')
        }
      } finally {
        searchingClients.value = false
      }
    }, 500)
  }

  // Función para seleccionar un cliente existente
  const selectExistingClient = (client) => {
    // Crear un objeto plano para evitar problemas de serialización
    selectedExistingClient.value = {
      id: client.id,
      firstname: client.firstname,
      lastname: client.lastname,
      document_id: client.document_id,
      phone: client.phone,
      email: client.email,
      address: client.address,
      city: client.city,
      state: client.state,
      is_minor: client.is_minor
    }
    foundClients.value = []
    clientSearchQuery.value = `${client.firstname} ${client.lastname} (${client.document_id})`
    
    return {
      firstname: client.firstname || '',
      lastname: client.lastname || '',
      document_id: client.document_id || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      is_minor: client.is_minor || false
    }
  }

  // Función para limpiar la selección de cliente existente
  const clearExistingClientSelection = () => {
    selectedExistingClient.value = null
    clientSearchQuery.value = ''
    foundClients.value = []
    hasSearched.value = false
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      searchTimeout = null
    }
  }

  // Función para resetear todo el estado
  const resetClientSearch = () => {
    clientType.value = 'new'
    clearExistingClientSelection()
  }

  // Computed para verificar si se ha seleccionado un cliente existente
  const hasSelectedExistingClient = computed(() => {
    return clientType.value === 'existing' && selectedExistingClient.value
  })

  // Función para crear cliente en API
  const createClient = async (clientData) => {
    try {
      const apiUrl = `${config.public.apiBaseUrl}/clients`
      const response = await $fetch(apiUrl, {
        method: 'POST',
        body: clientData
      })
      return response
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  // Función para obtener cliente (crear nuevo o usar existente)
  const getOrCreateClient = async (clientData) => {
    if (hasSelectedExistingClient.value) {
      return selectedExistingClient.value
    } else {
      return await createClient(clientData)
    }
  }

  return {
    // Estado
    clientType,
    clientSearchQuery,
    foundClients,
    searchingClients,
    hasSearched,
    selectedExistingClient,
    
    // Computed
    hasSelectedExistingClient,
    
    // Métodos
    searchClients,
    selectExistingClient,
    clearExistingClientSelection,
    resetClientSearch,
    createClient,
    getOrCreateClient
  }
} 