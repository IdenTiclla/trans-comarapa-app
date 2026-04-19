/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { fetchPackageById, updatePackage } from '@/store/package.slice'
import { AlertCircle } from 'lucide-react'
import PackageDeliveryModal from '@/components/packages/PackageDeliveryModal'
import PackageReceptionModal from '@/components/packages/PackageReceptionModal'
import PackageReceiptModal from '@/components/packages/PackageReceiptModal'
import PackageStakeholders from '@/components/packages/PackageStakeholders'
import { Skeleton } from '@/components/ui/skeleton'
import { getStatusNumber, resolveLocations, makeGetHistoryDate } from '@/components/packages/detail/helpers'
import { PackageHeader } from '@/components/packages/detail/PackageHeader'
import { RouteDetails } from '@/components/packages/detail/RouteDetails'
import { JourneyProgress } from '@/components/packages/detail/JourneyProgress'
import { StateHistoryTable } from '@/components/packages/detail/StateHistoryTable'
import { PaymentSummary } from '@/components/packages/detail/PaymentSummary'
import { AssignedTripCard } from '@/components/packages/detail/AssignedTripCard'
import { MapOverview } from '@/components/packages/detail/MapOverview'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<any>()

  const { currentPackage, loading, error } = useSelector((state: RootState) => state.package)

  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showReceptionModal, setShowReceptionModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  useEffect(() => {
    if (id) dispatch(fetchPackageById(Number(id)))
  }, [dispatch, id])

  const onDeliverPackageConfirm = async () => {
    setShowDeliveryModal(false)
    if (id) dispatch(fetchPackageById(Number(id)))
  }

  const onReceivePackageConfirm = async () => {
    if (!id) return
    await dispatch(updatePackage({ id: Number(id), data: { status: 'arrived_at_destination' } })).unwrap()
    setShowReceptionModal(false)
    dispatch(fetchPackageById(Number(id)))
  }

  if (loading && !currentPackage) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!currentPackage || error) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Encomienda no encontrada</h3>
      </div>
    )
  }

  const statusNum = getStatusNumber(currentPackage.status)
  const { originName, destinationName } = resolveLocations(currentPackage)
  const getHistoryDate = makeGetHistoryDate(currentPackage)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-full mx-auto px-4 lg:px-12 py-8">
        <PackageHeader
          pkg={currentPackage}
          onEdit={() => navigate(`/packages/${currentPackage.id}/edit`)}
          onShowReceipt={() => setShowReceiptModal(true)}
          onMarkReceived={() => setShowReceptionModal(true)}
          onDeliver={() => setShowDeliveryModal(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <RouteDetails originName={originName} destinationName={destinationName} />
            <PackageStakeholders
              sender={currentPackage.sender}
              recipient={currentPackage.recipient}
              secretary={currentPackage.secretary}
              senderName={currentPackage.sender_name}
              recipientName={currentPackage.recipient_name}
            />
            <JourneyProgress
              statusNum={statusNum}
              getHistoryDate={getHistoryDate}
              createdAt={currentPackage.created_at}
            />
            <MapOverview pkg={currentPackage} />
            <StateHistoryTable pkg={currentPackage} originName={originName} destinationName={destinationName} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <PaymentSummary pkg={currentPackage} />
            <AssignedTripCard pkg={currentPackage} />
          </div>
        </div>
      </div>

      <PackageDeliveryModal
        show={showDeliveryModal}
        packageData={currentPackage}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={onDeliverPackageConfirm}
      />

      <PackageReceptionModal
        show={showReceptionModal}
        packageData={currentPackage}
        onClose={() => setShowReceptionModal(false)}
        onConfirm={onReceivePackageConfirm}
      />

      <PackageReceiptModal
        show={showReceiptModal}
        packageData={currentPackage}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  )
}
