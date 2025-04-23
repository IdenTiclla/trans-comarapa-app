// Store para gestionar la autenticación
import { defineStore } from 'pinia'
import authService from '~/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null
  },

  actions: {
    // Inicializar el store con los datos del localStorage
    init() {
      this.token = authService.getToken()
      this.user = authService.getUserData()
    },

    // Iniciar sesión
    async login(email, password) {
      this.isLoading = true
      this.error = null

      try {
        const data = await authService.login(email, password)
        this.token = data.access_token

        // Construir el objeto de usuario a partir de los datos disponibles
        this.user = {
          id: data.user_id,
          role: data.role,
          firstname: data.firstname || '',
          lastname: data.lastname || ''
        }

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
