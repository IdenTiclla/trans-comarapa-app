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
    fullName: (state) => {
      if (!state.user) return '';

      // Si ambos campos están presentes, mostrar nombre completo
      if (state.user.firstname && state.user.lastname) {
        return `${state.user.firstname} ${state.user.lastname}`;
      }

      // Si solo hay un campo, mostrar ese
      if (state.user.firstname) return state.user.firstname;
      if (state.user.lastname) return state.user.lastname;

      // Si no hay ningún campo, mostrar un valor por defecto
      return 'Usuario';
    },
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
        if (!userId || !firstname || !lastname) {
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
          for (const [roleKey, fields] of Object.entries(roleMap)) {
            if (data[fields.idField]) {
              detectedRole = roleKey;
              userId = data[fields.idField];
              firstname = data[fields.firstnameField] || '';
              lastname = data[fields.lastnameField] || '';
              break;
            }
          }

          // Si no se detectó ningún rol específico, buscar en otros campos
          if (!detectedRole) {
            // Intentar obtener el nombre del usuario directamente
            if (data.firstname && data.lastname) {
              firstname = data.firstname;
              lastname = data.lastname;
            } else if (data.name) {
              // Si hay un campo 'name', intentar dividirlo en nombre y apellido
              const nameParts = data.name.split(' ');
              if (nameParts.length > 1) {
                firstname = nameParts[0];
                lastname = nameParts.slice(1).join(' ');
              } else {
                firstname = data.name;
                lastname = '';
              }
            } else if (data.full_name) {
              // Si hay un campo 'full_name', intentar dividirlo
              const nameParts = data.full_name.split(' ');
              if (nameParts.length > 1) {
                firstname = nameParts[0];
                lastname = nameParts.slice(1).join(' ');
              } else {
                firstname = data.full_name;
                lastname = '';
              }
            }

            // Si aún no tenemos nombre, usar valores por defecto
            if (!firstname && !lastname) {
              userId = data.user_id || 0;
              firstname = 'Usuario';
              lastname = 'Sistema';
            }

            // Determinar el rol si no lo tenemos
            if (!role) {
              if (data.role) {
                role = data.role;
              } else if (data.user_role) {
                role = data.user_role;
              } else {
                role = 'user';
              }
            }
          } else {
            // Si se detectó un rol, usarlo
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

        // Intentar obtener más información del usuario
        if (this.token) {
          // Usar setTimeout para no bloquear la respuesta del login
          setTimeout(() => {
            this.fetchUserInfo().then(() => {
              // Actualizar localStorage con la información más reciente
              localStorage.setItem('auth_user', JSON.stringify(this.user));
            });
          }, 500);
        }

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

      // Inicializar autenticación

      if (token) {
        this.token = token
      }

      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          // Cargar datos del usuario desde localStorage

          // Asegurarse de que los datos del usuario tengan la estructura correcta
          this.user = {
            id: userData.id || 0,
            firstname: userData.firstname || '',
            lastname: userData.lastname || '',
            role: userData.role || 'user'
          }

          // Usuario inicializado desde localStorage

          // Verificar si tenemos un nombre válido
          if (!this.user.firstname && !this.user.lastname) {
            // Intentar recuperar el nombre de otros campos
            if (userData.name) {
              const nameParts = userData.name.split(' ')
              if (nameParts.length > 1) {
                this.user.firstname = nameParts[0]
                this.user.lastname = nameParts.slice(1).join(' ')
              } else {
                this.user.firstname = userData.name
              }
              // Nombre recuperado del campo name
            } else if (userData.full_name) {
              const nameParts = userData.full_name.split(' ')
              if (nameParts.length > 1) {
                this.user.firstname = nameParts[0]
                this.user.lastname = nameParts.slice(1).join(' ')
              } else {
                this.user.firstname = userData.full_name
              }
              // Nombre recuperado del campo full_name
            }
          }

          // Si tenemos token pero no tenemos nombre completo, intentar obtenerlo de la API
          if (this.token && (!this.user.firstname || !this.user.lastname)) {
            setTimeout(() => this.fetchUserInfo(), 100)
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e)
        }
      }
    },

    async fetchUserInfo() {
      if (!this.token) return;

      try {
        // Obtener la configuración de runtime
        const config = useRuntimeConfig();
        const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:8000/api/v1';

        // Obtener información adicional del usuario

        // Primero intentamos obtener información de la persona asociada al usuario
        let response = await fetch(`${apiBaseUrl}/auth/me/person`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          mode: 'cors'
        });

        // Si el endpoint /auth/me/person no está disponible, intentamos con /auth/me
        if (!response.ok) {
          // Intentar con /auth/me si /auth/me/person no está disponible

          response = await fetch(`${apiBaseUrl}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            mode: 'cors'
          });

          // Si /auth/me tampoco está disponible, intentamos con /users/me
          if (!response.ok) {
            // Intentar con /users/me si /auth/me no está disponible

            response = await fetch(`${apiBaseUrl}/users/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
              },
              mode: 'cors'
            });

            if (!response.ok) {
              return; // No se pudo obtener información del usuario
            }
          }
        }

        const userData = await response.json();
        // Procesar la información del usuario
        if (userData) {
          let firstname = '';
          let lastname = '';
          let updated = false;

          // Caso 1: Respuesta de /auth/me/person
          if (userData.person_data) {
            firstname = userData.person_data.firstname || '';
            lastname = userData.person_data.lastname || '';
          }
          // Caso 2: Respuesta directa con firstname/lastname
          else if (userData.firstname && userData.lastname) {
            firstname = userData.firstname;
            lastname = userData.lastname;
          }
          // Caso 3: Respuesta con name o full_name
          else if (userData.name || userData.full_name) {
            const fullName = userData.name || userData.full_name;
            const nameParts = fullName.split(' ');
            if (nameParts.length > 1) {
              firstname = nameParts[0];
              lastname = nameParts.slice(1).join(' ');
            } else {
              firstname = fullName;
              lastname = '';
            }
          }
          // Caso 4: Respuesta con secretary_firstname/secretary_lastname
          else if (userData.secretary_firstname || userData.secretary_lastname) {
            firstname = userData.secretary_firstname || '';
            lastname = userData.secretary_lastname || '';
          }
          // Caso 5: Buscar en cualquier campo que contenga 'firstname' o 'lastname'
          else {
            // Buscar en todos los campos del objeto
            for (const key in userData) {
              if (key.toLowerCase().includes('firstname') || key.toLowerCase().includes('first_name')) {
                firstname = userData[key] || '';
              }
              if (key.toLowerCase().includes('lastname') || key.toLowerCase().includes('last_name')) {
                lastname = userData[key] || '';
              }
            }
          }

          // Actualizar la información del usuario si obtuvimos datos válidos
          if (firstname || lastname) {
            if (!this.user) {
              this.user = {
                id: userData.id || 0,
                firstname: firstname,
                lastname: lastname,
                role: userData.role || 'user'
              };
              updated = true;
            } else {

              // Actualizar firstname si tenemos uno nuevo y válido
              if (firstname && firstname.trim() !== '') {
                this.user.firstname = firstname;
                updated = true;
              }

              // Actualizar lastname si tenemos uno nuevo y válido
              if (lastname && lastname.trim() !== '') {
                this.user.lastname = lastname;
                updated = true;
              }
            }

            // Si se actualizó la información, guardarla en localStorage
            if (updated && this.user) {
              localStorage.setItem('auth_user', JSON.stringify(this.user));
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
      }
    }
  }
})
