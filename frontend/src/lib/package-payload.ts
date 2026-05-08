interface PackageDataShape {
  tracking_number: string
  origin_office_id: number | null
  destination_office_id: number | null
  total_weight: number
  total_declared_value: number
  notes: string
  items: { quantity: number; description: string; unit_price: number }[]
  payment_status: string
  payment_method: string
  received_confirmation: boolean
}

export function buildUpdatePayload(packageData: PackageDataShape) {
  return {
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
}

export function buildCreatePayload(
  packageData: PackageDataShape,
  senderId: number,
  recipientId: number,
  secretaryId: number,
  tripId: number | string | null,
) {
  return {
    tracking_number: packageData.tracking_number,
    total_weight: packageData.total_weight || null,
    total_declared_value: packageData.total_declared_value || null,
    notes: packageData.notes || null,
    status: tripId ? 'assigned_to_trip' : 'registered_at_office',
    sender_id: senderId,
    recipient_id: recipientId,
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
}
