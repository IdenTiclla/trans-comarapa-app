import FormCheckbox from '@/components/forms/FormCheckbox'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PackageReceiptModal from './PackageReceiptModal'
import { usePackageRegistration } from './registration/use-package-registration'
import { PackageTopBar } from './registration/PackageTopBar'
import { ClientSection } from './registration/ClientSection'
import { ItemsSection } from './registration/ItemsSection'

interface PackageRegistrationModalProps {
  show: boolean
  tripId?: number | string | null
  mode?: 'create' | 'edit'
  packageId?: number | null
  onClose: () => void
  onPackageRegistered?: (pkg: Record<string, unknown>) => void
}

const senderIcon = (
  <svg className="w-4 h-4 text-primary mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const recipientIcon = (
  <svg className="w-4 h-4 text-primary mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

export default function PackageRegistrationModal({
  show,
  tripId = null,
  mode = 'create',
  packageId = null,
  onClose,
  onPackageRegistered,
}: PackageRegistrationModalProps) {
  const r = usePackageRegistration({ show, tripId, mode, packageId, onClose, onPackageRegistered })

  if (!show && !r.showReceiptModal) return null

  return (
    <>
      <Dialog open={show && !r.showReceiptModal} onOpenChange={(open) => { if (!open) onClose() }}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[96dvh] max-w-[calc(100%-1rem)] flex-col gap-0 p-0 sm:max-w-[88rem] sm:max-h-[92vh]"
        >
          <DialogHeader className="flex shrink-0 flex-col gap-3 border-b bg-primary px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary-foreground/10 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <DialogTitle className="text-lg font-bold text-primary-foreground leading-tight">
                {r.isEditMode ? 'Editar Encomienda' : 'Emisión de Encomienda'}
              </DialogTitle>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end sm:space-x-4">
              <div className="text-primary-foreground sm:text-right">
                <div className="text-[10px] font-medium text-primary-foreground/70 uppercase tracking-wider">No. Seguimiento</div>
                <div className="text-lg font-bold tracking-wider leading-none">{r.packageNumber}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar"
                onClick={onClose}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar bg-background min-h-0">
            <form id="package-form" onSubmit={r.submitPackage} className="space-y-4">
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
                    setNewForm={r.setNewSenderForm as React.Dispatch<React.SetStateAction<{ firstname: string; lastname: string; document_id: string; phone: string }>>}
                    locked={r.isEditMode}
                  />

                  <ClientSection
                    title="Consignatario"
                    color="green"
                    icon={recipientIcon}
                    search={r.recipientSearch}
                    newForm={r.newRecipientForm}
                    setNewForm={r.setNewRecipientForm as React.Dispatch<React.SetStateAction<{ firstname: string; lastname: string; document_id: string; phone: string }>>}
                    locked={r.isEditMode}
                  />

                  {r.isSamePerson && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 col-span-1 md:col-span-2 flex items-center">
                      <svg className="w-5 h-5 text-destructive mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <p className="text-xs text-destructive font-medium">El remitente y el destinatario no pueden ser la misma persona.</p>
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-2 text-xs flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="flex-1 bg-muted rounded-lg p-3 border text-muted-foreground flex items-start">
                      <svg className="w-4 h-4 text-muted-foreground mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
                      Aviso Legal: La empresa no se responsabiliza de mercancía que no coincida con el contenido declarado. Sin reclamo pasados los 30 días.
                    </div>
                    <div className="flex-1 bg-card rounded-lg p-3 border flex items-center">
                      <FormCheckbox
                        checked={r.packageData.received_confirmation}
                        onChange={(checked) => r.setPackageData((prev) => ({ ...prev, received_confirmation: checked }))}
                        label="El cliente declara que el contenido es lícito y RECIBE CONFORME su comprobante."
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <ItemsSection
                    items={r.packageData.items}
                    totalAmount={r.totalAmount}
                    onAdd={r.addItem}
                    onRemove={r.removeItem}
                    onUpdate={r.updateItem}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="px-5 py-3 border-t bg-background shrink-0">
            <div className="flex flex-col md:flex-row md:justify-between items-center gap-3">
              <div className="flex-1 min-h-[36px] flex items-center w-full md:w-auto">
                {r.formErrorMessage && (
                  <Alert variant="destructive" role="alert" className="py-2 px-4">
                    <AlertDescription>{r.formErrorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex space-x-3 w-full md:w-auto shrink-0">
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
                  form="package-form"
                  disabled={r.isSubmitting || !r.isFormValid}
                  className="flex-1 md:flex-none"
                >
                  {r.isSubmitting ? 'Procesando...' : r.isEditMode ? 'Guardar Cambios' : 'Confirmar Encomienda'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PackageReceiptModal
        show={r.showReceiptModal}
        packageData={r.registeredPackageData}
        onClose={r.closeReceiptModal}
      />
    </>
  )
}
