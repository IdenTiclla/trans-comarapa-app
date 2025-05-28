import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSecretaryStore = defineStore('secretary', () => {
  // State
  const secretaries = ref([])
  const secretary = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Create apiFetch function
  const apiFetch = (url, options = {}) => {
    return $fetch(url, {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      ...options
    })
  }

  // Getters
  const getSecretaryById = computed(() => {
    return (id) => secretaries.value.find(secretary => secretary.id === id)
  })

  const activeSecretaries = computed(() => {
    return secretaries.value.filter(secretary => secretary.user?.is_active !== false)
  })

  // Actions
  const fetchSecretaries = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Fetching secretaries...')
      const response = await apiFetch('/secretaries')
      console.log('Secretaries fetched:', response)
      secretaries.value = response
    } catch (err) {
      console.error('Error fetching secretaries:', err)
      error.value = err.message || 'Error fetching secretaries'
    } finally {
      isLoading.value = false
    }
  }

  const fetchSecretaryById = async (id) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log(`Fetching secretary with id: ${id}`)
      const response = await apiFetch(`/secretaries/${id}`)
      console.log('Secretary fetched:', response)
      secretary.value = response
      return response
    } catch (err) {
      console.error('Error fetching secretary:', err)
      error.value = err.message || 'Error fetching secretary'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createSecretary = async (secretaryData) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Creating secretary:', secretaryData)
      const response = await apiFetch('/secretaries', {
        method: 'POST',
        body: secretaryData
      })
      console.log('Secretary created:', response)
      
      // Add to local state
      secretaries.value.push(response)
      return response
    } catch (err) {
      console.error('Error creating secretary:', err)
      error.value = err.message || 'Error creating secretary'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteSecretary = async (id) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log(`Deleting secretary with id: ${id}`)
      await apiFetch(`/secretaries/${id}`, {
        method: 'DELETE'
      })
      
      // Remove from local state
      secretaries.value = secretaries.value.filter(secretary => secretary.id !== id)
      console.log('Secretary deleted successfully')
    } catch (err) {
      console.error('Error deleting secretary:', err)
      error.value = err.message || 'Error deleting secretary'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearState = () => {
    secretaries.value = []
    secretary.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    // State
    secretaries,
    secretary,
    isLoading,
    error,
    
    // Getters
    getSecretaryById,
    activeSecretaries,
    
    // Actions
    fetchSecretaries,
    fetchSecretaryById,
    createSecretary,
    deleteSecretary,
    clearError,
    clearState
  }
}) 