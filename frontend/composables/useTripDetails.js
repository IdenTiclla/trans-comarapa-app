import { ref, computed, watch, nextTick, reactive } from 'vue'
import { useTripStore } from '~/stores/tripStore'
import { useAuthStore } from '~/stores/auth'

export const useTripDetails = () => {
  const config = useRuntimeConfig()
  const tripStore = useTripStore()
  const authStore = useAuthStore()

  // Función helper para inicializar objetos de forma segura
  const safeObject = () => reactive({})
  
  // Estado para boletos vendidos
  const soldTickets = ref([])
  const isLoadingSoldTickets = ref(false)
  const soldTicketsError = ref(null)
  const showSoldTickets = ref(false)
  const showTicketsByState = safeObject()

  // Estado para paquetes
  const packages = ref([])
  const isLoadingPackages = ref(false)
  const packagesError = ref(null)
  const showPackages = ref(false)
  const showPackagesByStatus = safeObject()

  // Computed properties
  const groupedSoldTickets = computed(() => {
    if (!soldTickets.value || soldTickets.value.length === 0) {
      return {}
    }
    return soldTickets.value.reduce((acc, ticket) => {
      const state = ticket.state || 'unknown'
      if (!acc[state]) {
        acc[state] = []
      }
      acc[state].push(ticket)
      return acc
    }, {})
  })

  const groupedPackages = computed(() => {
    if (!packages.value || packages.value.length === 0) {
      return {}
    }
    return packages.value.reduce((acc, pkg) => {
      const status = pkg.status || 'unknown'
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(pkg)
      return acc
    }, {})
  })

  const reservedSeatNumbers = computed(() => {
    if (!soldTickets.value || soldTickets.value.length === 0) {
      return []
    }
    
    return soldTickets.value
      .filter(ticket => ticket.state === 'pending' && ticket.seat)
      .map(ticket => ticket.seat.seat_number)
  })

  // Métodos para fetch de datos
  // Helper function to initialize all states as closed
  const initializeTicketStates = (tickets) => {
    const states = [...new Set(tickets.map(ticket => ticket.state || 'unknown'))]
    states.forEach(state => {
      if (showTicketsByState[state] === undefined) {
        showTicketsByState[state] = false // Start all states closed
      }
    })
  }

  const fetchSoldTickets = async (tripId) => {
    if (!tripId) {
      soldTicketsError.value = 'ID del viaje no disponible para cargar boletos.'
      return
    }
    
    isLoadingSoldTickets.value = true
    soldTicketsError.value = null
    
    try {
      const apiUrl = `${config.public.apiBaseUrl}/tickets/trip/${tripId}`
      const responseData = await $fetch(apiUrl, {
        method: 'GET'
      })

      if (responseData) {
        soldTickets.value = Array.isArray(responseData) ? [...responseData] : responseData
        console.log('Tickets cargados:', soldTickets.value)
        
        // Initialize all ticket states as visible
        initializeTicketStates(soldTickets.value)
        // Initialize main sections as visible
        initializeMainSections()
      } else {
        soldTickets.value = []
      }
    } catch (err) { 
      console.error("API Error fetching sold tickets:", err)
      let errorMessage = 'No se pudieron cargar los boletos vendidos. Intente más tarde.'
      if (err.response && err.response._data && err.response._data.detail) {
        errorMessage = err.response._data.detail
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      soldTicketsError.value = errorMessage
      soldTickets.value = []
    } finally {
      isLoadingSoldTickets.value = false
    }
  }

  // Helper function to initialize all package statuses as closed
  const initializePackageStatuses = (packages) => {
    const statuses = [...new Set(packages.map(pkg => pkg.status || 'unknown'))]
    statuses.forEach(status => {
      if (showPackagesByStatus[status] === undefined) {
        showPackagesByStatus[status] = false // Start all statuses closed
      }
    })
  }

  const fetchPackages = async (tripId) => {
    if (!tripId) {
      packagesError.value = 'ID del viaje no disponible para cargar paquetes.'
      return
    }
    
    isLoadingPackages.value = true
    packagesError.value = null
    
    try {
      const apiUrl = `${config.public.apiBaseUrl}/packages/by-trip/${tripId}`
      const responseData = await $fetch(apiUrl, {
        method: 'GET'
      })

      if (responseData) {
        packages.value = Array.isArray(responseData) ? [...responseData] : responseData
        console.log('Paquetes cargados:', packages.value)
        
        // Initialize all package statuses as visible
        initializePackageStatuses(packages.value)
        // Initialize main sections as visible
        initializeMainSections()
      } else {
        packages.value = []
      }
    } catch (err) { 
      console.error("API Error fetching packages:", err)
      let errorMessage = 'No se pudieron cargar los paquetes. Intente más tarde.'
      if (err.response && err.response._data && err.response._data.detail) {
        errorMessage = err.response._data.detail
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      packagesError.value = errorMessage
      packages.value = []
    } finally {
      isLoadingPackages.value = false
    }
  }

  // Métodos para toggle de secciones
  const toggleSoldTickets = () => {
    showSoldTickets.value = !showSoldTickets.value
  }
  
  // Initialize main sections as closed by default
  const initializeMainSections = () => {
    // Keep sections closed by default, they will be opened only when user clicks
    showSoldTickets.value = false
    showPackages.value = false
  }

  const toggleTicketsByState = (state) => {
    if (!state) return
    const current = showTicketsByState[state] || false
    showTicketsByState[state] = !current
  }

  const togglePackages = () => {
    showPackages.value = !showPackages.value
  }

  const togglePackagesByStatus = (status) => {
    if (!status) return
    const current = showPackagesByStatus[status] || false
    showPackagesByStatus[status] = !current
  }

  // Utilidades para formateo
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible'
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options)
    } catch (e) {
      return 'Fecha inválida'
    }
  }

  const formatTime = (timeString, dateString) => {
    if (!timeString) return 'Hora no especificada'
    if (timeString.includes('T')) {
      const date = new Date(timeString)
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
    if (dateString && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeString.split(':')
      const date = new Date(dateString)
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
    const parts = timeString.split(':')
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10)
      const minutes = parts[1]
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      return `${displayHours}:${minutes} ${period}`
    }
    return timeString
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'boarding': return 'bg-yellow-100 text-yellow-800'
      case 'departed': return 'bg-indigo-100 text-indigo-800'
      case 'arrived': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'delayed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Programado'
      case 'boarding': return 'Abordando'
      case 'departed': return 'En Ruta'
      case 'arrived': return 'Llegó'
      case 'cancelled': return 'Cancelado'
      case 'delayed': return 'Retrasado'
      default: return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Desconocido'
    }
  }

  // Función para limpiar el estado
  const clearState = () => {
    soldTickets.value = []
    packages.value = []
    soldTicketsError.value = null
    packagesError.value = null
    showSoldTickets.value = false
    showPackages.value = false
    
    // Limpiar objetos reactive de forma segura
    Object.keys(showTicketsByState).forEach(key => {
      delete showTicketsByState[key]
    })
    Object.keys(showPackagesByStatus).forEach(key => {
      delete showPackagesByStatus[key]
    })
  }

  // Function to manually initialize sections (useful for existing data)
  const initializeAllSections = () => {
    if (soldTickets.value.length > 0) {
      showSoldTickets.value = false  // Start closed
      initializeTicketStates(soldTickets.value)
    }
    if (packages.value.length > 0) {
      showPackages.value = false  // Start closed
      initializePackageStatuses(packages.value)
    }
  }

  return {
    // Estado
    soldTickets,
    isLoadingSoldTickets,
    soldTicketsError,
    showSoldTickets,
    showTicketsByState,
    packages,
    isLoadingPackages,
    packagesError,
    showPackages,
    showPackagesByStatus,
    
    // Computed
    groupedSoldTickets,
    groupedPackages,
    reservedSeatNumbers,
    
    // Métodos
    fetchSoldTickets,
    fetchPackages,
    toggleSoldTickets,
    toggleTicketsByState,
    togglePackages,
    togglePackagesByStatus,
    clearState,
    initializeAllSections,
    
    // Utilidades
    formatDate,
    formatTime,
    getStatusClass,
    getStatusText
  }
} 