import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPackages, deletePackage, selectPackages, selectPackageLoading, selectPackageError } from '@/store/package.slice'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

interface Package {
    id: number
    tracking_code?: string
    sender_name?: string
    receiver_name?: string
    origin_name?: string
    destination_name?: string
    weight_kg?: number
    price?: number
    status?: string
    [key: string]: unknown
}

const STATUS_LABELS: Record<string, string> = {
    registered: 'Registrado', in_transit: 'En tránsito', delivered: 'Entregado', cancelled: 'Cancelado',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    registered: 'secondary', in_transit: 'outline', delivered: 'default', cancelled: 'destructive',
}

export function Component() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const packages = useAppSelector(selectPackages) as Package[]
    const loading = useAppSelector(selectPackageLoading)
    const error = useAppSelector(selectPackageError)

    useEffect(() => { dispatch(fetchPackages({})) }, [dispatch])

    const handleDelete = async (pkg: Package) => {
        if (!confirm(`¿Eliminar paquete ${pkg.tracking_code}?`)) return
        try { await dispatch(deletePackage(pkg.id)).unwrap(); toast.success('Paquete eliminado'); dispatch(fetchPackages({})) } catch (err) { toast.error(`Error: ${err}`) }
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-end">
                <Button onClick={() => navigate('/packages/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Encomienda
                </Button>
            </div>

            {error && (
                <Card className="border-l-4 border-l-destructive">
                    <CardContent className="p-4">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Remitente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Destinatario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Peso</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Precio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {packages.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No hay encomiendas</td></tr>
                                ) : (
                                    packages.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/50">
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">{p.tracking_code || `#${p.id}`}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{p.sender_name || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{p.receiver_name || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{p.weight_kg ? `${p.weight_kg} kg` : '—'}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{p.price ? `Bs. ${p.price}` : '—'}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={STATUS_VARIANT[p.status || ''] || 'secondary'}>
                                                    {STATUS_LABELS[p.status || ''] || p.status || 'Registrado'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/packages/${p.id}`)}>Ver</Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p)}>Eliminar</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}
