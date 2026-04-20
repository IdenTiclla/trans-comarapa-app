/* eslint-disable @typescript-eslint/no-explicit-any */
import FormSelect from '@/components/forms/FormSelect'
import type { Office } from './use-package-registration'

interface Props {
  offices: Office[]
  loadingOffices: boolean
  packageData: any
  setPackageData: (updater: any) => void
  fieldErrors: Record<string, string>
  tripId: number | string | null
}

export function PackageTopBar({ offices, loadingOffices, packageData, setPackageData, fieldErrors, tripId }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
        <FormSelect
          label="Oficina Origen *"
          value={packageData.origin_office_id?.toString() || ''}
          onChange={(val) => setPackageData((prev: any) => ({ ...prev, origin_office_id: val ? Number(val) : null }))}
          required
          options={offices.map(o => ({ value: o.id.toString(), label: o.name }))}
          error={fieldErrors.origin_office_id}
          placeholder={loadingOffices ? 'Cargando...' : 'Seleccione origen'}
        />
        <FormSelect
          label="Oficina Destino *"
          value={packageData.destination_office_id?.toString() || ''}
          onChange={(val) => setPackageData((prev: any) => ({ ...prev, destination_office_id: val ? Number(val) : null }))}
          required
          options={offices.filter(o => o.id !== packageData.origin_office_id).map(o => ({ value: o.id.toString(), label: o.name }))}
          error={fieldErrors.destination_office_id}
          placeholder={loadingOffices ? 'Cargando...' : 'Seleccione destino'}
        />
        <FormSelect
          label="Estado del Pago *"
          value={packageData.payment_status}
          onChange={(val) => setPackageData((prev: any) => ({ ...prev, payment_status: val }))}
          required
          options={[
            { value: 'paid_on_send', label: 'Pagado al enviar' },
            { value: 'collect_on_delivery', label: 'Por cobrar en destino' },
          ]}
        />
        {packageData.payment_status === 'paid_on_send' ? (
          <FormSelect
            label="Método *"
            value={packageData.payment_method}
            onChange={(val) => setPackageData((prev: any) => ({ ...prev, payment_method: val }))}
            required
            options={[
              { value: 'cash', label: '💵 Físico' },
              { value: 'qr', label: '📱 QR/Transf.' },
            ]}
          />
        ) : (
          <div className="hidden md:block"></div>
        )}
        <div>
          <span className="block text-xs font-medium text-gray-700 mb-1">Estado</span>
          <div className="flex items-center h-[38px]">
            {tripId ? (
              <span className="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 w-full justify-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                Asignado
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200 w-full justify-center">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                En oficina
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
