import { API_BASE_URL } from './constants'
import { TIMING } from './timing'
import { ROUTES } from './routes'
import { toast } from 'sonner'

export class SessionExpiredError extends Error {
  constructor(message = 'Session expired') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}

export class AbortError extends Error {
  constructor() {
    super('Request cancelled')
    this.name = 'AbortError'
  }
}

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, data: unknown) {
    const detail = parseErrorDetail(data, status)
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function parseErrorDetail(data: unknown, status: number): string {
  if (!data || typeof data !== 'object') return `HTTP ${status}`
  const d = data as Record<string, unknown>

  if (typeof d.detail === 'string') return d.detail

  if (Array.isArray(d.detail)) {
    const messages = d.detail
      .map((err: unknown) => {
        if (typeof err === 'string') return err
        if (err && typeof err === 'object') {
          const e = err as Record<string, unknown>
          const field = typeof e.loc === 'object' && Array.isArray(e.loc)
            ? (e.loc as string[]).filter(l => l !== 'body').join('.')
            : ''
          return field ? `${field}: ${e.msg ?? ''}` : String(e.msg ?? '')
        }
        return String(err)
      })
      .filter(Boolean)
    return messages.length > 0 ? messages.join('; ') : `HTTP ${status}`
  }

  return d.detail ? String(d.detail) : `HTTP ${status}`
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null
let isLoggingOut = false

export function setLoggingOut(value: boolean) {
  isLoggingOut = value
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, unknown>
  timeout?: number
}

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, params, timeout = TIMING.API_TIMEOUT, ...init } = options

  let url = `${API_BASE_URL}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort('timeout'), timeout)

  // If the caller provided an external signal (e.g. from useEffect cleanup), link it
  if (init.signal) {
    if (init.signal.aborted) {
      controller.abort(init.signal.reason ?? 'cancelled')
    } else {
      init.signal.addEventListener('abort', () => controller.abort(init.signal!.reason ?? 'cancelled'))
    }
  }

  const fetchOptions: RequestInit = {
    ...init,
    credentials: 'include',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  }

  if (body !== undefined) {
    if (body instanceof URLSearchParams || body instanceof FormData || typeof body === 'string') {
      fetchOptions.body = body as BodyInit
    } else {
      fetchOptions.body = JSON.stringify(body)
    }
  }

  try {
    let response = await fetch(url, fetchOptions)

    if (
      response.status === 401 &&
      !isLoggingOut &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/logout') &&
      !endpoint.includes('/auth/refresh')
    ) {
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshToken().finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
      }

      const refreshed = await refreshPromise
      if (refreshed) {
        response = await fetch(url, {
          ...fetchOptions,
          signal: new AbortController().signal,
        })
      } else {
        localStorage.removeItem('user_data')
        toast.error('Su sesión ha expirado. Redirigiendo al inicio de sesión...')
        setTimeout(() => {
          window.location.href = ROUTES.LOGIN
        }, 1500)
        throw new SessionExpiredError()
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const reason = controller.signal.reason
      if (reason === 'timeout') {
        throw new Error('La solicitud tardó demasiado. Intenta nuevamente.')
      }
      // Cancelled by component unmount or external signal — swallow silently
      throw new AbortError()
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
