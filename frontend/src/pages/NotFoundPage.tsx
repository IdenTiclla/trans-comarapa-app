import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'

export function Component() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-comarapa-dark">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
        <Button onClick={() => navigate('/')} className="mt-6 h-auto px-6 py-3 font-semibold">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
