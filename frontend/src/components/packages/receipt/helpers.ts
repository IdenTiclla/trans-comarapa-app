import { getEffectiveName } from '@/lib/person-utils'
import type { PackageItem } from '@/types'
import { receiptPrintStyles } from './print-styles'
import { COMPANY } from '@/lib/company-config'
import { TIMING } from '@/lib/timing'

export function computeTotalAmount(packageData: Record<string, unknown>): number {
  if (packageData?.total_amount !== undefined) return packageData.total_amount as number
  const items = packageData?.items as PackageItem[] | undefined
  if (!items) return 0
  return items.reduce((total: number, item) => {
    const price = item.unit_price ?? (item.total_price ? item.total_price / (item.quantity || 1) : 0)
    return total + item.quantity * price
  }, 0)
}

export function resolveNames(packageData: Record<string, unknown>) {
  const sender = packageData?.sender as Record<string, unknown> | undefined
  const recipient = packageData?.recipient as Record<string, unknown> | undefined
  const senderName = !sender && packageData?.sender_name ? packageData.sender_name as string : getEffectiveName(sender)
  const recipientName = !recipient && packageData?.recipient_name ? packageData.recipient_name as string : getEffectiveName(recipient)
  return { senderName, recipientName }
}

export function resolveLocations(packageData: Record<string, unknown>) {
  const originName =
    packageData?.origin ||
    packageData?.origin_office_name ||
    packageData?.origin_office?.name ||
    'SCZ'
  const destinationName =
    packageData?.destination ||
    packageData?.destination_office_name ||
    packageData?.destination_office?.name ||
    'N/A'
  return { originName, destinationName }
}

export function printReceipt() {
  const printContent = document.getElementById('receipt-content')
  if (!printContent) return
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Recibo de Encomienda - ${COMPANY.name}</title>
        <meta charset="UTF-8">
        <style>${receiptPrintStyles}</style>
      </head>
      <body>
        <div class="receipt-container">${printContent.innerHTML}</div>
      </body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, TIMING.PRINT_DELAY)
}
