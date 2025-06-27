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
    loading: false,
    error: null
  }),

  getters: {
    // 🔒 FASE 2: La autenticación se basa en la existencia de datos de usuario
    // ya que los tokens están en cookies httpOnly
    isAuthenticated: (state) => !!state.user,
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
    // 🔒 FASE 2: La autenticación se basa en cookies httpOnly
    init() {
      // Ya no obtenemos token del localStorage, se maneja vía cookies
      this.token = null
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
      this.loading = true
      this.error = null

      try {
        const data = await authService.login(email, password)
        // 🔒 FASE 2: No guardamos token en el store, se maneja vía cookies
        this.token = null

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
        this.error = error.message || 'Error en el inicio de sesión'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cerrar sesión
    // 🔒 FASE 2: logout ahora es async para notificar al servidor
    async logout(skipServerLogout = false) {
      await authService.logout(skipServerLogout)
      this.token = null
      this.user = null
    },

    // Refrescar el token
    // 🔒 FASE 2: Los tokens se manejan vía cookies httpOnly
    async refreshToken() {
      this.loading = true

      try {
        const data = await authService.refreshToken()
        // No guardamos token en el store, se maneja vía cookies
        this.token = null
        
        // Actualizar datos del usuario si han cambiado
        if (data.user_id) {
          this.user = createPlainObject({
            ...this.user,
            firstname: data.firstname || this.user?.firstname,
            lastname: data.lastname || this.user?.lastname,
            person: data.person || this.user?.person
          })
        }
        
        return data
      } catch (error) {
        this.error = error.message
        this.token = null
        this.user = null
        throw error
      } finally {
        this.loading = false
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
    },

    // Limpiar errores
    clearError() {
      this.error = null
    }
  }
})
