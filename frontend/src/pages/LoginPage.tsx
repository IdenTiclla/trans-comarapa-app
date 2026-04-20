import { useState, useMemo, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { login, clearError, selectAuthLoading, selectAuthError } from '@/store/auth.slice'
import { DASHBOARD_PATHS, type Role } from '@/lib/constants'
import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Component() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loading = useAppSelector(selectAuthLoading)
  const serverError = useAppSelector(selectAuthError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isFormValid = useMemo(
    () => email && password && !emailError && !passwordError && emailRegex.test(email) && password.length >= 6,
    [email, password, emailError, passwordError]
  )

  function validateEmail() {
    if (email.length > 0 && !emailRegex.test(email)) {
      setEmailError('Por favor ingresa un email válido')
    } else {
      setEmailError('')
    }
  }

  function validatePassword() {
    if (password.length > 0 && password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
    } else {
      setPasswordError('')
    }
  }

  function validateForm(): boolean {
    let valid = true
    if (!email) {
      setEmailError('El email es requerido')
      valid = false
    } else if (!emailRegex.test(email)) {
      setEmailError('Por favor ingresa un email válido')
      valid = false
    }
    if (!password) {
      setPasswordError('La contraseña es requerida')
      valid = false
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      valid = false
    }
    return valid
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const result = await dispatch(login({ email, password })).unwrap()
      const dashboardPath = DASHBOARD_PATHS[result.role as Role] ?? '/dashboards/dashboard-secretary'
      navigate(dashboardPath)
    } catch {
      // Error is handled by the slice
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    if (emailError) setEmailError('')
    if (serverError) dispatch(clearError())
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    if (passwordError) setPasswordError('')
    if (serverError) dispatch(clearError())
  }


  return (
    <div className="w-full" role="main" aria-labelledby="login-title">
      {/* Mobile Header */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-comarapa-dark to-comarapa-medium p-4 rounded-2xl shadow-lg mb-4">
          <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 6v6m8-6v6m-10 0h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-comarapa-dark">Trans Comarapa</h1>
        <p className="text-comarapa-medium text-sm">Sistema de Gestión de Transporte</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-comarapa-gray">
        <header className="mb-6 text-center lg:text-left">
          <h2 id="login-title" className="text-2xl font-bold text-comarapa-dark mb-2">Bienvenido de vuelta</h2>
          <p className="text-gray-500">Ingresa tus credenciales para continuar</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <FormInput
            id="email"
            label="Correo Electrónico"
            type="email"
            required
            autoComplete="email"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="usuario@transcomarapa.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={validateEmail}
            error={emailError}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <FormInput
            id="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={validatePassword}
            error={passwordError}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            rightIcon={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </Button>
            }
          />

          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" role="alert" aria-live="assertive">
              <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.179 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700 text-sm">{serverError}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className={`w-full h-auto py-3.5 rounded-xl font-semibold text-white min-h-[48px] ${
              isFormValid && !loading
                ? 'bg-gradient-to-r from-comarapa-dark to-comarapa-medium hover:from-comarapa-medium hover:to-comarapa-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed hover:bg-gray-300'
            }`}
            disabled={!isFormValid || loading}
          >
            {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
            <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
          </Button>

          {!isFormValid && (
            <p className="text-center text-sm text-gray-500">
              Complete todos los campos correctamente para continuar
            </p>
          )}
        </form>

        <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Trans Comarapa. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}
