import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function Component() {
  useDocumentTitle('Página no encontrada')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-comarapa-dark">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
        <Button onClick={() => navigate(ROUTES.HOME)} className="mt-6 h-auto px-6 py-3 font-semibold">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
