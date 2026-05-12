import { useNavigate } from 'react-router'
import { useAppSelector } from '@/store'
import PendingCollections from '@/components/packages/PendingCollections'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function Component() {
    useDocumentTitle('Encomiendas Pendientes')
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    return (
        <div className="w-full space-y-6">
            <h1 className="sr-only">Encomiendas Pendientes de Cobro</h1>
            <div className="flex items-center justify-end">
                <Button variant="outline" onClick={() => navigate(ROUTES.PACKAGES)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ver todas las encomiendas
                </Button>
            </div>

            <PendingCollections officeId={user?.office_id} showTitle={false} />
        </div>
    )
}
