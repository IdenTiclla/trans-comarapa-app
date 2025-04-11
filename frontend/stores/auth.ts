import { defineStore } from 'pinia'

interface User {
  id: number
  firstname: string
  lastname: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    fullName: (state) => state.user ? `${state.user.firstname} ${state.user.lastname}` : '',
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null

      try {
        console.log('Iniciando login con:', { email })

        // Obtener la configuración de runtime
        const config = useRuntimeConfig()
        const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:8000/api/v1'

        console.log('URL de la API:', `${apiBaseUrl}/auth/login`)

        // Llamada a la API de login
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: email,  // El backend espera 'username' aunque sea un email
            password: password
          }),
          mode: 'cors' // Habilitar CORS
        })

        console.log('Respuesta recibida:', response.status, response.statusText)

        const responseData = await response.json()
        console.log('Datos de respuesta:', responseData)

        if (!response.ok) {
          throw new Error(responseData.detail || 'Error de autenticación')
        }

        // Aceptar cualquier usuario con un token válido
        // Comentamos la verificación de secretaria para permitir cualquier rol
        // if (responseData.secretary_id === null) {
        //   throw new Error('El usuario no es una secretaria')
        // }

        const data = responseData

        // Guardar token y datos de usuario
        this.token = data.access_token

        // Usar el nuevo formato si está disponible, o el antiguo como respaldo
        let userId = data.user_info ? data.user_info.id : null;
        let firstname = data.user_info ? data.user_info.firstname : '';
        let lastname = data.user_info ? data.user_info.lastname : '';
        let role = data.role || '';

        // Si no tenemos la información en el nuevo formato, intentar con el antiguo
        if (!userId) {
          // Mapeo de roles a sus campos específicos
          const roleMap = {
            'secretary': {
              idField: 'secretary_id',
              firstnameField: 'secretary_firstname',
              lastnameField: 'secretary_lastname'
            },
            'driver': {
              idField: 'driver_id',
              firstnameField: 'driver_firstname',
              lastnameField: 'driver_lastname'
            },
            'assistant': {
              idField: 'assistant_id',
              firstnameField: 'assistant_firstname',
              lastnameField: 'assistant_lastname'
            },
            'admin': {
              idField: 'admin_id',
              firstnameField: 'admin_firstname',
              lastnameField: 'admin_lastname'
            },
            'client': {
              idField: 'client_id',
              firstnameField: 'client_firstname',
              lastnameField: 'client_lastname'
            }
          };

          // Detectar el rol basado en los campos presentes
          let detectedRole = '';
          for (const [role, fields] of Object.entries(roleMap)) {
            if (data[fields.idField]) {
              detectedRole = role;
              userId = data[fields.idField];
              firstname = data[fields.firstnameField];
              lastname = data[fields.lastnameField];
              break;
            }
          }

          // Si no se detectó ningún rol específico, usar los campos genéricos
          if (!detectedRole) {
            userId = data.user_id || 0;
            firstname = firstname || 'Usuario';
            lastname = lastname || 'Sistema';
            role = role || 'user';
          } else {
            role = detectedRole;
          }
        }

        this.user = {
          id: userId,
          firstname: firstname,
          lastname: lastname,
          role: role
        }

        // Guardar en localStorage para persistencia
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('auth_user', JSON.stringify(this.user))

        return true
      } catch (error: any) {
        this.error = error.message || 'Error de inicio de sesión'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null

      // Limpiar localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      // Redireccionar a login (esto se manejará en el componente)
    },

    initAuth() {
      // Inicializar estado desde localStorage al cargar la app
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('auth_user')

      if (token) {
        this.token = token
      }

      if (userStr) {
        try {
          this.user = JSON.parse(userStr)
        } catch (e) {
          console.error('Error parsing user data from localStorage')
        }
      }
    }
  }
})
