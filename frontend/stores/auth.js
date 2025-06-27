// Store para gestionar la autenticación
import { defineStore } from 'pinia'
import authService from '~/services/authService'
import personService from '~/services/personService'
import { usePersonData } from '~/composables/usePersonData'

// Función auxiliar para crear objetos planos
const createPlainObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(obj))
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role || null,
    
    // ✅ MANTENER getters existentes para compatibilidad
    userFullName: (state) => {
      const { getEffectiveName } = usePersonData()
      return getEffectiveName(state.user)
    },
    
    userFirstName: (state) => {
      const { getEffectiveFirstName } = usePersonData()
      return getEffectiveFirstName(state.user)
    },
    
    userLastName: (state) => {
      const { getEffectiveLastName } = usePersonData()
      return getEffectiveLastName(state.user)
    },
    
    userInitials: (state) => {
      const { getInitials } = usePersonData()
      return getInitials(state.user)
    },
    
    // 🆕 NUEVOS getters para datos de persona
    userPersonType: (state) => {
      const { getPersonType } = usePersonData()
      return getPersonType(state.user)
    },
    
    userHasPersonData: (state) => {
      const { hasPersonData } = usePersonData()
      return hasPersonData(state.user)
    }
  },

  actions: {
    // Inicializar el store con los datos del localStorage
    init() {
      this.token = authService.getToken()
      const userData = authService.getUserData()
      this.user = userData ? createPlainObject(userData) : null
      
      // Migrar datos existentes si no tienen email
      if (this.user && !this.user.email && typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem('user_email')
        if (storedEmail) {
          this.user.email = storedEmail
          // Actualizar localStorage con el email incluido
          localStorage.setItem('user_data', JSON.stringify(this.user))
        }
      }
    },

    // Iniciar sesión
    async login(email, password) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.login(email, password)
        this.token = data.access_token

        // Construir objeto usuario compatible con todas las estructuras
        this.user = createPlainObject({
          id: data.user_id,
          role: data.role,
          email: email,
          username: data.username || email,
          
          // Campos legacy (para compatibilidad)
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          
          // Datos de person si existen
          person: data.person || null,
          
          // Datos de profile si existen (para compatibilidad futura)
          profile: data.profile || null
        })

        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Cerrar sesión
    logout() {
      authService.logout()
      this.token = null
      this.user = null
    },

    // Refrescar el token
    async refreshToken() {
      this.isLoading = true

      try {
        const data = await authService.refreshToken()
        this.token = data.access_token
        return data
      } catch (error) {
        this.error = error.message
        this.token = null
        this.user = null
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async updateUserPersonData(personData) {
      if (!this.user?.person?.id) {
        throw new Error('Usuario no tiene datos de persona')
      }
      
      try {
        const updatedPerson = await personService.updatePerson(
          this.user.person.id, 
          personData
        )
        
        // Actualizar datos en el store
        this.user.person = { ...this.user.person, ...updatedPerson }
        
        return updatedPerson
      } catch (error) {
        console.error('Error actualizando datos de persona:', error)
        throw error
      }
    }
  }
})
