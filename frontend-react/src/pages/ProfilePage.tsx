import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { officeService } from '@/services/office.service'
import { toast } from 'sonner'
import type { Office } from '@/types/office'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone } from 'lucide-react'

export function Component() {
  const { user, userFullName, userInitials, userRole, updateProfile, loading } = useAuth()
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)
  const [office, setOffice] = useState<Office | null>(null)
  const [officeLoading, setOfficeLoading] = useState(false)

  const ROLE_LABELS: Record<string, string> = { admin: 'Administrador', secretary: 'Secretaria', driver: 'Conductor', assistant: 'Asistente', client: 'Cliente' }

  useEffect(() => {
    if (userRole === 'secretary' && user?.office_id) {
      setOfficeLoading(true)
      officeService.getById(user.office_id)
        .then(setOffice)
        .catch(() => toast.error('Error al cargar la oficina'))
        .finally(() => setOfficeLoading(false))
    }
  }, [userRole, user?.office_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      toast.success('Perfil actualizado correctamente')
    } catch {
      toast.error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
              <input type="text" value={formData.firstname} onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} className="w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Apellido</label>
              <input type="text" value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} className="w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border-border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground" />
          </div>
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
