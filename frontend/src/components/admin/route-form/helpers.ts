export const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0])
  const minutes = parts[1]
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}
