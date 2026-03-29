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
          className="mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
