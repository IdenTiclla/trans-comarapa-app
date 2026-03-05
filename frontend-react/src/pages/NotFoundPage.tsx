import { useNavigate } from 'react-router'

export function Component() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-comarapa-dark">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 comarapa-button-primary"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
