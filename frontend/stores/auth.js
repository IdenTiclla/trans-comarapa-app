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
        if (data.user) {
          this.user = data.user
        } else {
          this.user = {
            id: data.user_id,
            role: data.role
          }

          // Añadir información específica del rol si está disponible
          if (data.role === 'secretary' && data.secretary_id) {
            this.user.secretary_id = data.secretary_id
            this.user.firstname = data.secretary_firstname
            this.user.lastname = data.secretary_lastname
          } else if (data.role === 'driver' && data.driver_id) {
            this.user.driver_id = data.driver_id
            this.user.firstname = data.driver_firstname
            this.user.lastname = data.driver_lastname
          } else if (data.role === 'assistant' && data.assistant_id) {
            this.user.assistant_id = data.assistant_id
            this.user.firstname = data.assistant_firstname
            this.user.lastname = data.assistant_lastname
          } else if (data.role === 'admin' && data.admin_id) {
            this.user.admin_id = data.admin_id
            this.user.firstname = data.admin_firstname
            this.user.lastname = data.admin_lastname
          }
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
