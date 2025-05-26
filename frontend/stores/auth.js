// Store para gestionar la autenticación
import { defineStore } from 'pinia'
import authService from '~/services/authService'

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
    userFullName: (state) => {
      if (state.user) {
        const firstName = state.user.firstname || '';
        const lastName = state.user.lastname || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || (state.user.username || 'Usuario Anónimo');
      }
      return 'Usuario Anónimo';
    }
  },

  actions: {
    // Inicializar el store con los datos del localStorage
    init() {
      this.token = authService.getToken()
      const userData = authService.getUserData()
      this.user = userData ? createPlainObject(userData) : null
    },

    // Iniciar sesión
    async login(email, password) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.login(email, password)
        this.token = data.access_token

        // Construir el objeto de usuario a partir de los datos disponibles
        // Asegurar que sea un objeto plano
        this.user = createPlainObject({
          id: data.user_id,
          role: data.role,
          firstname: data.firstname || '',
          lastname: data.lastname || ''
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
    }
  }
})
