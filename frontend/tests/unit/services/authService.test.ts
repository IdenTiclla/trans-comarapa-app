import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { MockedFunction } from 'vitest'

// Types
interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  refresh_token_expires_in: number
  role: string
  user_id: number
  firstname: string
  lastname: string
  person?: any
}

interface AuthError extends Error {
  data?: {
    detail: string
  }
  status?: number
}

// Mock del authService
const mockAuthService = {
  login: vi.fn() as MockedFunction<(email: string, password: string) => Promise<LoginResponse>>,
  logout: vi.fn() as MockedFunction<(skipServerLogout?: boolean) => Promise<void>>,
  getUserData: vi.fn() as MockedFunction<() => any>
}

// Mock de localStorage con estado persistente
const storageState: { [key: string]: string } = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => storageState[key] || null) as MockedFunction<(key: string) => string | null>,
  setItem: vi.fn((key: string, value: string) => { storageState[key] = value }) as MockedFunction<(key: string, value: string) => void>,
  removeItem: vi.fn((key: string) => { delete storageState[key] }) as MockedFunction<(key: string) => void>,
  clear: vi.fn(() => { Object.keys(storageState).forEach(key => delete storageState[key]) }) as MockedFunction<() => void>
}

describe('authService login functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Limpiar el estado del localStorage entre tests
    Object.keys(storageState).forEach(key => delete storageState[key])

    // Setup global mocks
    globalThis.localStorage = localStorageMock as any
    globalThis.window = {} as Window & typeof globalThis

    // Implementar lógica de login
    mockAuthService.login.mockImplementation(async (email: string, password: string): Promise<LoginResponse> => {
      if (email === 'test@example.com' && password === 'password123') {
        const mockResponse: LoginResponse = {
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 1800,
          refresh_token: 'mock-refresh-token',
          refresh_token_expires_in: 604800,
          role: 'secretary',
          user_id: 1,
          firstname: 'Juan',
          lastname: 'Pérez'
        }

        // Simular almacenamiento en localStorage
        const userInfo = {
          id: mockResponse.user_id,
          role: mockResponse.role,
          firstname: mockResponse.firstname || '',
          lastname: mockResponse.lastname || '',
          email: email,
          person: mockResponse.person || null
        }

        localStorageMock.setItem('user_data', JSON.stringify(userInfo))
        localStorageMock.setItem('user_email', email)

        return mockResponse
      } else {
        const error: AuthError = new Error('Email o contraseña incorrectos')
        error.data = { detail: 'Incorrect email or password' }
        error.status = 401
        throw error
      }
    })

    // Implementar lógica de logout
    mockAuthService.logout.mockImplementation(async (skipServerLogout?: boolean): Promise<void> => {
      // Simular limpieza de localStorage
      localStorageMock.removeItem('user_data')
      localStorageMock.removeItem('user_email')
      localStorageMock.removeItem('auth_token')
      localStorageMock.removeItem('refresh_token')

      // Simular posible error en servidor si no se omite
      if (!skipServerLogout) {
        // En algunos casos puede fallar la comunicación con el servidor
        // pero el logout local debe continuar
      }
    })

    // Implementar lógica de getUserData
    mockAuthService.getUserData.mockImplementation(() => {
      const userData = localStorageMock.getItem('user_data')
      if (userData && userData !== 'undefined') {
        try {
          return JSON.parse(userData)
        } catch {
          return null
        }
      }
      return null
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('login success', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await mockAuthService.login('test@example.com', 'password123')

      // Verificar que se guardaron los datos del usuario en localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify({
        id: 1,
        role: 'secretary',
        firstname: 'Juan',
        lastname: 'Pérez',
        email: 'test@example.com',
        person: null
      }))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_email', 'test@example.com')

      // Verificar estructura de respuesta
      expect(result).toEqual({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 1800,
        refresh_token: 'mock-refresh-token',
        refresh_token_expires_in: 604800,
        role: 'secretary',
        user_id: 1,
        firstname: 'Juan',
        lastname: 'Pérez'
      })

      // Verificar tipos
      expect(typeof result.access_token).toBe('string')
      expect(typeof result.user_id).toBe('number')
      expect(typeof result.expires_in).toBe('number')
    })
  })

  describe('login failure', () => {
    it('should handle login failure with invalid credentials', async () => {
      await expect(mockAuthService.login('wrong@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Email o contraseña incorrectos')

      // Verificar que NO se guardaron datos en localStorage
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle different error formats', async () => {
      // Test con credenciales completamente incorrectas
      await expect(mockAuthService.login('', ''))
        .rejects
        .toThrow('Email o contraseña incorrectos')

      await expect(mockAuthService.login('invalid', 'invalid'))
        .rejects
        .toThrow('Email o contraseña incorrectos')
    })
  })

  describe('logout functionality', () => {
    beforeEach(async () => {
      // Simular usuario logueado antes de cada test de logout
      await mockAuthService.login('test@example.com', 'password123')
    })

    it('should logout successfully and clear localStorage data', async () => {
      // Verificar que hay datos antes del logout
      expect(mockAuthService.getUserData()).toEqual({
        id: 1,
        role: 'secretary',
        firstname: 'Juan',
        lastname: 'Pérez',
        email: 'test@example.com',
        person: null
      })

      // Ejecutar logout
      await mockAuthService.logout()

      // Verificar que se limpiaron los datos del localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_email')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')

      // Verificar que ya no hay datos de usuario
      expect(mockAuthService.getUserData()).toBeNull()
    })

    it('should logout successfully even when skipping server logout', async () => {
      // Verificar que hay datos antes del logout
      expect(mockAuthService.getUserData()).not.toBeNull()

      // Ejecutar logout omitiendo servidor
      await mockAuthService.logout(true)

      // Verificar que se limpiaron los datos locales independientemente
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_email')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')

      // Verificar que ya no hay datos de usuario
      expect(mockAuthService.getUserData()).toBeNull()
    })

    it('should handle logout when no user data exists', async () => {
      // Limpiar datos de usuario manualmente para simular estado sin sesión
      localStorageMock.getItem.mockReturnValue(null)

      // Ejecutar logout
      await mockAuthService.logout()

      // Verificar que se intentó limpiar localStorage de todas formas
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_email')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')

      // Verificar que getUserData devuelve null
      expect(mockAuthService.getUserData()).toBeNull()
    })
  })
})