import { useBusesPage } from '@/hooks/use-buses-page'
import BusForm from '@/components/admin/BusForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function Component() {
    useDocumentTitle('Buses')
    const {
        buses, loading, error, showForm, setShowForm,
        editingBus, existingSeats, saving, owners,
        openCreate, openEdit, handleFormSubmit, handleDelete,
        confirmDialog,
    } = useBusesPage()

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Bus
                </Button>
            </div>

            {error && (
                <div role="alert" className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div role="status" aria-live="polite" className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                    <span className="sr-only">Cargando buses...</span>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        {/* eslint-disable-next-line no-restricted-syntax */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <caption className="sr-only">Lista de buses</caption>
                            <thead className="bg-muted/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pisos</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dueño</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {buses.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No hay buses registrados</td></tr>
                                ) : (
                                    buses.map((bus) => (
                                        <tr key={bus.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{bus.plate_number || bus.license_plate}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{bus.model || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{bus.brand || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{bus.capacity || '—'}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={(bus.floors ?? 1) === 2 ? 'default' : 'secondary'}>
                                                    {(bus.floors ?? 1) === 2 ? '2 pisos' : '1 piso'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {(() => {
                                                    const owner = bus.owner_id ? owners.find(o => o.id === bus.owner_id) : null
                                                    return owner ? `${owner.firstname} ${owner.lastname}` : <span className="text-gray-400">Sin dueño</span>
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={bus.is_active !== false ? 'default' : 'destructive'}>
                                                    {bus.is_active !== false ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(bus)}>
                                                        <Pencil className="h-3.5 w-3.5 mr-1" />
                                                        Editar
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(bus)}>
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            <Dialog open={showForm} onOpenChange={(open) => { if (!open) setShowForm(false) }}>
                <DialogContent
                    className="p-0 bg-transparent border-0 shadow-none sm:max-w-none gap-0 overflow-visible"
                    showCloseButton={false}
                >
                    <DialogTitle className="sr-only">{editingBus ? 'Editar Bus' : 'Nuevo Bus'}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulario de registro de bus con datos básicos y planilla de asientos.
                    </DialogDescription>
                    <BusForm
                        bus={editingBus}
                        isEditing={!!editingBus}
                        existingSeats={existingSeats}
                        loading={saving}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </DialogContent>
            </Dialog>
            {confirmDialog}
        </div>
    )
}
