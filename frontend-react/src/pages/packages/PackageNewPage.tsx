import { useNavigate } from 'react-router'
import PackageRegistrationModal from '@/components/packages/PackageRegistrationModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export function Component() {
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

      <Card>
        <CardContent className="p-6 min-h-[500px] relative">
          <PackageRegistrationModal
            show={true}
            onClose={() => navigate('/packages')}
            onPackageRegistered={() => navigate('/packages')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
