import { useProfilePage } from '@/hooks/use-profile-page'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'

const ROLE_LABELS: Record<string, string> = { admin: 'Administrador', secretary: 'Secretaria', driver: 'Conductor', assistant: 'Asistente', client: 'Cliente' }

export function Component() {
  const {
    user, userFullName, userInitials, userRole, loading,
    formData, setFormData, saving, office, officeLoading, handleSubmit,
  } = useProfilePage()

  return (
    <div className="w-full space-y-6 max-w-2xl">
      <Card className="overflow-hidden">
        <div className="bg-primary px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground font-bold text-2xl border-2 border-primary-foreground/20">
              {userInitials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-foreground">{userFullName}</h2>
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                  {ROLE_LABELS[userRole || ''] || userRole}
                </Badge>
                {userRole === 'secretary' && (
                  <Badge variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                    {officeLoading ? 'Cargando...' : office?.name || 'Sin oficina asignada'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nombre"
              value={formData.firstname}
              onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
            />
            <FormInput
              label="Apellido"
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
            />
          </div>
          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving || loading}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
