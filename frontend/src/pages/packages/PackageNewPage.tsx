import { useNavigate } from 'react-router'
import PackageRegistrationModal from '@/components/packages/PackageRegistrationModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function Component() {
  useDocumentTitle('Nueva Encomienda')
  const navigate = useNavigate()

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-lg font-semibold">Registrar Nueva Encomienda</h1>
      </div>

      <PackageRegistrationModal
        show={true}
        onClose={() => navigate(-1)}
        onPackageRegistered={() => {
          // No navegamos aquí para permitir ver el recibo primero
          // El onClose se encargará de la navegación cuando el usuario termine
        }}
      />
    </div>
  )
}
