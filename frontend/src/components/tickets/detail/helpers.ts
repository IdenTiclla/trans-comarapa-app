export const getTicketStatusNumber = (state: string | undefined) => {
  switch (state) {
    case 'pending': return 1
    case 'confirmed': return 2
    case 'completed': return 3
    case 'cancelled': return -1
    default: return 0
  }
}

export const makeGetTicketHistoryDate = (ticket: Record<string, unknown>) => (stateName: string) => {
  if (!ticket.state_history) return null
  const history = ticket.state_history as Array<Record<string, unknown>>
  const historyItem = history.find((h) => h.new_state === stateName)
  return historyItem ? (historyItem.changed_at as string) : null
}
