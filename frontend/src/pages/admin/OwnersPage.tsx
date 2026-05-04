import { useOwnersPage } from '@/hooks/use-owners-page'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Pencil, Loader2 } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'

export function Component() {
  const {
    owners, loading, saving, isModalOpen, setIsModalOpen,
    editing, formData, setFormData, openCreate, openEdit, handleSubmit,
  } = useOwnersPage()

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Socio
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : owners.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 font-medium text-gray-900">No hay socios registrados</p>
            <p className="text-sm mt-1 text-gray-500">Agrega el primer socio usando el botón "Nuevo Socio".</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* eslint-disable-next-line no-restricted-syntax */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Socio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Carnet</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">
                          {owner.firstname?.charAt(0) || ''}{owner.lastname?.charAt(0) || ''}
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-gray-900">{owner.firstname} {owner.lastname}</p>
                           <p className="text-xs text-gray-500 font-medium">ID: #{owner.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm text-gray-800 font-medium">{owner.phone || <span className="text-gray-400 italic">Sin teléfono</span>}</div>
                       <div className="text-xs text-gray-500">{owner.email || <span className="text-gray-400 italic">Sin correo</span>}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {owner.ci}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">Activo</Badge>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(owner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <Card className="max-w-md w-full">
             <CardContent className="p-0">
               <div className="px-6 py-5 border-b border-gray-100 bg-muted/50">
                   <h2 className="text-xl font-bold text-gray-900">
                       {editing ? 'Editar Socio' : 'Registrar Nuevo Socio'}
                   </h2>
                   <p className="text-sm text-gray-500 mt-1">Completa los datos del dueño.</p>
               </div>
               
               <div className="p-6">
                 <form onSubmit={handleSubmit} className="space-y-4 text-left">
                   <div className="grid grid-cols-2 gap-4">
                     <FormInput
                       label="Nombre/s *"
                       type="text"
                       required
                       value={formData.firstname}
                       onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                       placeholder="Ej: Juan"
                     />
                     <FormInput
                       label="Apellidos *"
                       type="text"
                       required
                       value={formData.lastname}
                       onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                       placeholder="Ej: Perez"
                     />
                   </div>
                   <FormInput
                     label="Cédula de Identidad (CI) *"
                     type="text"
                     required
                     value={formData.ci}
                     onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                     placeholder="Ej: 1234567"
                   />
                   <FormInput
                     label="Teléfono"
                     type="tel"
                     value={formData.phone}
                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                     placeholder="Ej: 77766554"
                   />
                   <FormInput
                     label="Email (Opcional)"
                     type="email"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     placeholder="Ej: correo@ejemplo.com"
                   />

                   <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                     <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                       Cancelar
                     </Button>
                     <Button type="submit" disabled={saving}>
                       {saving ? 'Guardando...' : 'Guardar Socio'}
                     </Button>
                   </div>
                 </form>
               </div>
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  )
}
