import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { createPackage, updatePackage } from '@/store/package.slice'
import { officeService } from '@/services/office.service'
import { secretaryService } from '@/services/secretary.service'
import { packageService } from '@/services/package.service'
import { useClientSearch } from '@/hooks/use-client-search'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'

export interface Office {
  id: number
  name: string
}

interface UsePackageRegistrationParams {
  show: boolean
  tripId?: number | string | null
  mode?: 'create' | 'edit'
  packageId?: number | null
  onClose: () => void
  onPackageRegistered?: (pkg: Record<string, unknown>) => void
}

const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${timestamp}${random}`
}

export function usePackageRegistration({ show, tripId = null, mode = 'create', packageId = null, onClose, onPackageRegistered }: UsePackageRegistrationParams) {
  const isEditMode = mode === 'edit' && !!packageId
  const dispatch = useAppDispatch()
  const authStore = useAppSelector((state) => state.auth)

  const senderSearch = useClientSearch()
  const recipientSearch = useClientSearch()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [packageNumber, setPackageNumber] = useState('000000')
  const [offices, setOffices] = useState<Office[]>([])
  const [loadingOffices, setLoadingOffices] = useState(false)

  const [newSenderForm, setNewSenderForm] = useState({ firstname: '', lastname: '', document_id: '', phone: '' })
  const [newRecipientForm, setNewRecipientForm] = useState({ firstname: '', lastname: '', document_id: '', phone: '' })

  const [packageData, setPackageData] = useState({
    tracking_number: '',
    origin_office_id: null as number | null,
    destination_office_id: null as number | null,
    total_weight: 0,
    total_declared_value: 0,
    notes: '',
    items: [{ quantity: 1, description: '', unit_price: 0 }],
    payment_status: 'paid_on_send',
    payment_method: 'cash',
    received_confirmation: false,
  })

  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [registeredPackageData, setRegisteredPackageData] = useState<Record<string, unknown>>({})

  const totalAmount = useMemo(
    () => packageData.items.reduce((t, item) => t + item.quantity * item.unit_price, 0),
    [packageData.items]
  )
  const totalItemsCount = useMemo(
    () => packageData.items.reduce((t, item) => t + item.quantity, 0),
    [packageData.items]
  )

  const getSenderDocument = () =>
    senderSearch.clientType === 'existing'
      ? senderSearch.selectedExistingClient?.document_id
      : newSenderForm.document_id

  const getRecipientDocument = () =>
    recipientSearch.clientType === 'existing'
      ? recipientSearch.selectedExistingClient?.document_id
      : newRecipientForm.document_id

  const isSamePerson = useMemo(() => {
    const sDoc = getSenderDocument()
    const rDoc = getRecipientDocument()
    return Boolean(sDoc && rDoc && String(sDoc).trim() === String(rDoc).trim())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderSearch.clientType, senderSearch.selectedExistingClient, newSenderForm.document_id, recipientSearch.clientType, recipientSearch.selectedExistingClient, newRecipientForm.document_id])

  const hasSender = useMemo(() => {
    if (senderSearch.clientType === 'existing') return !!senderSearch.selectedExistingClient
    return newSenderForm.firstname.trim() !== '' && newSenderForm.lastname.trim() !== '' && newSenderForm.document_id.trim() !== ''
  }, [senderSearch.clientType, senderSearch.selectedExistingClient, newSenderForm])

  const hasRecipient = useMemo(() => {
    if (recipientSearch.clientType === 'existing') return !!recipientSearch.selectedExistingClient
    return newRecipientForm.firstname.trim() !== '' && newRecipientForm.lastname.trim() !== '' && newRecipientForm.document_id.trim() !== ''
  }, [recipientSearch.clientType, recipientSearch.selectedExistingClient, newRecipientForm])

  const isFormValid = useMemo(() => {
    const basic =
      hasSender &&
      hasRecipient &&
      packageData.destination_office_id !== null &&
      packageData.origin_office_id !== null &&
      packageData.items.length > 0 &&
      packageData.items.every(item => item.description.trim() !== '' && item.quantity > 0 && item.unit_price >= 0) &&
      packageData.received_confirmation
    return basic && !isSamePerson
  }, [hasSender, hasRecipient, packageData, isSamePerson])

  const resetForm = useCallback(() => {
    const trackingNumber = generateTrackingNumber()
    senderSearch.resetClientSearch()
    recipientSearch.resetClientSearch()
    setNewSenderForm({ firstname: '', lastname: '', document_id: '', phone: '' })
    setNewRecipientForm({ firstname: '', lastname: '', document_id: '', phone: '' })
    setFormErrorMessage('')
    setFieldErrors({})

    const userOfficeId = authStore.user?.office_id || null
    setPackageData({
      tracking_number: trackingNumber,
      origin_office_id: userOfficeId,
      destination_office_id: null,
      total_weight: 0,
      total_declared_value: 0,
      notes: '',
      items: [{ quantity: 1, description: '', unit_price: 0 }],
      payment_status: 'paid_on_send',
      payment_method: 'cash',
      received_confirmation: false,
    })
    setPackageNumber(trackingNumber)
  }, [senderSearch, recipientSearch, authStore.user?.office_id])

  useEffect(() => {
    const fetchOffices = async () => {
      setLoadingOffices(true)
      try {
        const response = await officeService.getAll()
        setOffices(response as Office[])
      } catch {
        // offices load failed - non-critical
      } finally {
        setLoadingOffices(false)
      }
    }
    fetchOffices()
  }, [])

  useEffect(() => {
    if (show) {
      senderSearch.setClientType('existing')
      recipientSearch.setClientType('existing')
      if (!isEditMode && !packageData.origin_office_id && authStore.user?.office_id) {
        setPackageData(prev => ({ ...prev, origin_office_id: authStore.user?.office_id ?? null }))
      }
    } else {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  useEffect(() => {
    if (!show || !isEditMode || !packageId) return
    let cancelled = false
    ;(async () => {
      try {
        const pkg = await packageService.getById(packageId) as Record<string, unknown>
        if (cancelled) return
        const items = (pkg.items as Array<Record<string, unknown>> | undefined) ?? []
        setPackageData({
          tracking_number: (pkg.tracking_number as string) ?? '',
          origin_office_id: (pkg.origin_office_id as number) ?? null,
          destination_office_id: (pkg.destination_office_id as number) ?? null,
          total_weight: (pkg.total_weight as number) ?? 0,
          total_declared_value: (pkg.total_declared_value as number) ?? 0,
          notes: (pkg.notes as string) ?? '',
          items: items.length
            ? items.map(it => ({
                quantity: Number(it.quantity ?? 1),
                description: String(it.description ?? ''),
                unit_price: Number(it.unit_price ?? 0),
              }))
            : [{ quantity: 1, description: '', unit_price: 0 }],
          payment_status: (pkg.payment_status as string) ?? 'paid_on_send',
          payment_method: (pkg.payment_method as string) ?? 'cash',
          received_confirmation: true,
        })
        setPackageNumber((pkg.tracking_number as string) ?? '------')

        const sender = pkg.sender as Record<string, unknown> | null
        if (sender && sender.id) {
          senderSearch.setClientType('existing')
          senderSearch.selectExistingClient(sender)
        }
        const recipient = pkg.recipient as Record<string, unknown> | null
        if (recipient && recipient.id) {
          recipientSearch.setClientType('existing')
          recipientSearch.selectExistingClient(recipient)
        }
      } catch (e) {
        setFormErrorMessage(e instanceof Error ? e.message : 'No se pudo cargar la encomienda.')
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isEditMode, packageId])

  useEffect(() => {
    setFieldErrors(prev => ({
      ...prev,
      origin_office_id: packageData.origin_office_id ? '' : 'El origen es requerido',
      destination_office_id: packageData.destination_office_id ? '' : 'El destino es requerido',
    }))
  }, [packageData.origin_office_id, packageData.destination_office_id])

  const addItem = () =>
    setPackageData(prev => ({ ...prev, items: [...prev.items, { quantity: 1, description: '', unit_price: 0 }] }))

  const removeItem = (index: number) => {
    if (packageData.items.length > 1) {
      setPackageData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
    }
  }

  const updateItem = (index: number, field: string, value: unknown) => {
    setPackageData(prev => {
      const newItems = [...prev.items]
      ;(newItems[index] as Record<string, unknown>)[field] = value
      return { ...prev, items: newItems }
    })
  }

  const copySenderToRecipient = () => {
    if (!senderSearch.selectedExistingClient && !newSenderForm.document_id) return
    if (senderSearch.clientType === 'existing') {
      recipientSearch.setClientType('existing')
      recipientSearch.selectExistingClient(senderSearch.selectedExistingClient)
    } else {
      recipientSearch.setClientType('new')
      setNewRecipientForm({ ...newSenderForm })
    }
  }

  const submitPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrorMessage('')

    if (!isFormValid) {
      if (!hasSender) setFormErrorMessage('Complete la información del remitente.')
      else if (!hasRecipient) setFormErrorMessage('Complete la información del destinatario.')
      else if (!packageData.received_confirmation) setFormErrorMessage('Debe marcar la casilla de validación.')
      else setFormErrorMessage('Complete los datos requeridos.')
      return
    }

    if (isSamePerson) {
      setFormErrorMessage('El remitente y el destinatario no pueden ser la misma persona.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && packageId) {
        const updatePayload = {
          total_weight: packageData.total_weight || null,
          total_declared_value: packageData.total_declared_value || null,
          notes: packageData.notes || null,
          origin_office_id: packageData.origin_office_id,
          destination_office_id: packageData.destination_office_id,
          payment_status: packageData.payment_status,
          payment_method: packageData.payment_status === 'paid_on_send' ? packageData.payment_method : null,
          items: packageData.items.map(item => ({
            quantity: item.quantity,
            description: item.description,
            unit_price: item.unit_price,
          })),
        }
        const updated = await dispatch(updatePackage({ id: packageId, data: updatePayload })).unwrap() as Record<string, unknown>
        toast.success('¡Encomienda actualizada!', {
          description: `Seguimiento: ${updated.tracking_number ?? packageData.tracking_number}`,
          duration: 4000,
        })
        if (onPackageRegistered) onPackageRegistered(updated)
        onClose()
        return
      }

      const senderPayload = senderSearch.clientType === 'existing' ? senderSearch.selectedExistingClient : newSenderForm
      const finalSender = await senderSearch.getOrCreateClient(senderPayload) as Record<string, unknown>

      const recipientPayload = recipientSearch.clientType === 'existing' ? recipientSearch.selectedExistingClient : newRecipientForm
      const finalRecipient = await recipientSearch.getOrCreateClient(recipientPayload) as Record<string, unknown>

      if (finalSender.id === finalRecipient.id) {
        throw new Error('El remitente y el destinatario no pueden ser el mismo registro en la base de datos.')
      }

      if (!authStore.user || !authStore.user.id) {
        throw new Error('Debe iniciar sesión para registrar paquetes.')
      }

      let secretaryId = null
      try {
        const secretaryResponse = await secretaryService.getByUserId(authStore.user.id)
        secretaryId = secretaryResponse.id
      } catch {
        throw new Error('No se pudo verificar su rol de secretario o no tiene los permisos suficientes.')
      }

      const packagePayload = {
        tracking_number: packageData.tracking_number,
        total_weight: packageData.total_weight || null,
        total_declared_value: packageData.total_declared_value || null,
        notes: packageData.notes || null,
        status: tripId ? 'assigned_to_trip' : 'registered_at_office',
        sender_id: finalSender.id,
        recipient_id: finalRecipient.id,
        secretary_id: secretaryId,
        trip_id: tripId ? Number(tripId) : null,
        origin_office_id: packageData.origin_office_id,
        destination_office_id: packageData.destination_office_id,
        payment_status: packageData.payment_status,
        payment_method: packageData.payment_status === 'paid_on_send' ? packageData.payment_method : null,
        items: packageData.items.map(item => ({
          quantity: item.quantity,
          description: item.description,
          unit_price: item.unit_price,
        })),
      }

      const response = await dispatch(createPackage(packagePayload)).unwrap()

      if (response) {
        const originOffice = offices.find(o => o.id === packageData.origin_office_id)
        const destinationOffice = offices.find(o => o.id === packageData.destination_office_id)
        setRegisteredPackageData({
          id: response.id,
          tracking_number: response.tracking_number,
          origin_office_name: originOffice?.name || 'N/A',
          destination_office_name: destinationOffice?.name || 'N/A',
          sender: {
            firstname: finalSender.firstname,
            lastname: finalSender.lastname,
            document_id: finalSender.document_id,
            phone: finalSender.phone,
          },
          recipient: {
            firstname: finalRecipient.firstname,
            lastname: finalRecipient.lastname,
            document_id: finalRecipient.document_id,
            phone: finalRecipient.phone,
          },
          items: response.items || packageData.items,
          total_amount: response.total_amount || totalAmount,
          total_items_count: response.total_items_count || totalItemsCount,
          created_at: response.created_at || new Date().toISOString(),
          payment_status: response.payment_status || packageData.payment_status,
        })

        toast.success('¡Encomienda Registrada!', {
          description: `Seguimiento: ${response.tracking_number}`,
          duration: 5000,
        })
        setShowReceiptModal(true)
        if (onPackageRegistered) onPackageRegistered(response)
        resetForm()
      }
    } catch (error) {
      setFormErrorMessage(
        error instanceof ApiError
          ? (error.data as Record<string, string>)?.detail || error.message
          : error instanceof Error ? error.message : 'Hubo un error al registrar la encomienda.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeReceiptModal = () => {
    setShowReceiptModal(false)
    setRegisteredPackageData({})
    onClose()
  }

  return {
    isEditMode,
    senderSearch, recipientSearch,
    newSenderForm, setNewSenderForm,
    newRecipientForm, setNewRecipientForm,
    packageData, setPackageData,
    offices, loadingOffices,
    packageNumber,
    fieldErrors,
    formErrorMessage,
    isSubmitting, isFormValid, isSamePerson,
    hasSender, hasRecipient,
    totalAmount, totalItemsCount,
    getSenderDocument, getRecipientDocument,
    addItem, removeItem, updateItem,
    copySenderToRecipient,
    submitPackage,
    showReceiptModal, registeredPackageData,
    closeReceiptModal,
  }
}
