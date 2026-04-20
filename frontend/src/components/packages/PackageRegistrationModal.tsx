/* eslint-disable @typescript-eslint/no-explicit-any */
import FormCheckbox from '@/components/forms/FormCheckbox'
import { Button } from '@/components/ui/button'
import PackageReceiptModal from './PackageReceiptModal'
import { cn } from '@/lib/utils'
import { usePackageRegistration } from './registration/use-package-registration'
import { PackageTopBar } from './registration/PackageTopBar'
import { ClientSection } from './registration/ClientSection'
import { ItemsSection } from './registration/ItemsSection'

interface PackageRegistrationModalProps {
  show: boolean
  tripId?: number | string | null
  onClose: () => void
  onPackageRegistered?: (pkg: any) => void
}

const senderIcon = (
  <svg className="w-4 h-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const recipientIcon = (
  <svg className="w-4 h-4 text-green-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

export default function PackageRegistrationModal({
  show,
  tripId = null,
  onClose,
  onPackageRegistered,
}: PackageRegistrationModalProps) {
  const r = usePackageRegistration({ show, tripId, onClose, onPackageRegistered })

  if (!show && !r.showReceiptModal) return null

  const showCopyButton = r.hasSender && r.hasRecipient &&
    String(r.getSenderDocument()) !== String(r.getRecipientDocument())

  return (
    <>
      <div className={cn(
        'fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 modal-overlay-bokeh backdrop-blur-sm transition-all duration-300',
        r.showReceiptModal ? 'hidden' : 'opacity-100'
      )}>
        <div className="absolute inset-0" aria-hidden="true" onClick={onClose}></div>

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="relative bg-gray-50 rounded-2xl text-left shadow-2xl transform transition-all w-full max-w-6xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between border-b rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">Emisión de Encomienda</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white text-right">
                <div className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">No. Seguimiento</div>
                <div className="text-lg font-bold tracking-wider leading-none">{r.packageNumber}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar bg-gray-50/50">
            <form onSubmit={r.submitPackage} className="space-y-4">
              <PackageTopBar
                offices={r.offices}
                loadingOffices={r.loadingOffices}
                packageData={r.packageData}
                setPackageData={r.setPackageData}
                fieldErrors={r.fieldErrors}
                tripId={tripId}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClientSection
                    title="Remitente"
                    color="blue"
                    icon={senderIcon}
                    search={r.senderSearch}
                    newForm={r.newSenderForm}
                    setNewForm={r.setNewSenderForm as any}
                  />

                  <ClientSection
                    title="Consignatario"
                    color="green"
                    icon={recipientIcon}
                    search={r.recipientSearch}
                    newForm={r.newRecipientForm}
                    setNewForm={r.setNewRecipientForm as any}
                    headerExtra={showCopyButton && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={r.copySenderToRecipient}
                        className="text-xs text-gray-500 hover:text-green-600 uppercase"
                      >
                        ¿Misma persona?
                      </Button>
                    )}
                  />

                  {r.isSamePerson && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 col-span-1 md:col-span-2 flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <p className="text-xs text-red-800 font-medium">El remitente y el destinatario no pueden ser la misma persona.</p>
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-2 text-xs flex mt-auto gap-4">
                    <div className="flex-1 bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-yellow-800 flex items-start">
                      <svg className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
                      Aviso Legal: La empresa no se responsabiliza de mercancía que no coincida con el contenido declarado. Sin reclamo pasados los 30 días.
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 flex items-center">
                      <FormCheckbox
                        checked={r.packageData.received_confirmation}
                        onChange={(checked) => r.setPackageData((prev: any) => ({ ...prev, received_confirmation: checked }))}
                        label="El cliente declara que el contenido es lícito y RECIBE CONFORME su comprobante."
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <ItemsSection
                    items={r.packageData.items}
                    totalAmount={r.totalAmount}
                    onAdd={r.addItem}
                    onRemove={r.removeItem}
                    onUpdate={r.updateItem}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-2 flex flex-col md:flex-row md:justify-between items-center gap-4">
                {r.formErrorMessage ? (
                  <div className="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-sm flex-1 text-left w-full">
                    {r.formErrorMessage}
                  </div>
                ) : (
                  <div className="flex-1"></div>
                )}

                <div className="flex space-x-3 w-full md:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 md:flex-none"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={r.isSubmitting || !r.isFormValid}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
                  >
                    {r.isSubmitting ? 'Procesando...' : 'Confirmar Encomienda'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <PackageReceiptModal
        show={r.showReceiptModal}
        packageData={r.registeredPackageData}
        onClose={r.closeReceiptModal}
      />
    </>
  )
}
