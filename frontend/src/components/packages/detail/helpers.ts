/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatDateTime = (dateStr: string | null | undefined, includeTime = true) => {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
  return date.toLocaleString('en-US', options)
}

export const getStatusNumber = (status: string | undefined) => {
  switch (status) {
    case 'registered_at_office': return 1
    case 'assigned_to_trip': return 2
    case 'in_transit': return 3
    case 'arrived_at_destination': return 4
    case 'delivered': return 5
    default: return 0
  }
}

export const resolveLocations = (pkg: any) => {
  const originName =
    pkg.origin_office?.name ||
    pkg.origin_office_name ||
    pkg.origin ||
    pkg.sender?.branch?.name ||
    pkg.sender?.office?.name ||
    pkg.trip?.route?.origin_location?.name ||
    pkg.trip?.route?.origin ||
    'Origen'

  const destinationName =
    pkg.destination_office?.name ||
    pkg.destination_office_name ||
    pkg.destination ||
    pkg.recipient?.branch?.name ||
    pkg.recipient?.office?.name ||
    pkg.trip?.route?.destination_location?.name ||
    pkg.trip?.route?.destination ||
    'Destino'

  return { originName, destinationName }
}

export const makeGetHistoryDate = (pkg: any) => (stateName: string) => {
  if (!pkg.state_history) return null
  const historyItem = pkg.state_history.find((h: any) => h.new_state === stateName)
  return historyItem ? historyItem.changed_at : null
}
