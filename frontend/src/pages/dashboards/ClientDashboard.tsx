import { useAuth } from '@/hooks/use-auth'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { User, Ticket } from 'lucide-react'

export function Component() {
  useDocumentTitle('Panel de Cliente')
  const { user } = useAuth()
  return (
    <div className="w-full">
      <div className="border-b">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard del Cliente</h1>
              <p className="text-sm text-muted-foreground">Bienvenido, {user?.firstname} {user?.lastname}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
        <div className="bg-card border rounded-lg p-8 text-center">
          <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-foreground mb-1">Portal del cliente</h2>
          <p className="text-sm text-muted-foreground">Aquí podrás ver tus boletos, paquetes y próximos viajes.</p>
        </div>
      </div>
    </div>
  )
}
