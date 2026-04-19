/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEffectiveName } from '@/lib/person-utils'
import { receiptPrintStyles } from './print-styles'

export function computeTotalAmount(packageData: any): number {
  if (packageData?.total_amount !== undefined) return packageData.total_amount
  if (!packageData?.items) return 0
  return packageData.items.reduce((total: number, item: any) => {
    const price = item.unit_price ?? (item.total_price ? item.total_price / (item.quantity || 1) : 0)
    return total + item.quantity * price
  }, 0)
}

export function resolveNames(packageData: any) {
  const sender = packageData?.sender
  const recipient = packageData?.recipient
  const senderName = !sender && packageData?.sender_name ? packageData.sender_name : getEffectiveName(sender)
  const recipientName = !recipient && packageData?.recipient_name ? packageData.recipient_name : getEffectiveName(recipient)
  return { senderName, recipientName }
}

export function resolveLocations(packageData: any) {
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
        <title>Recibo de Encomienda - Trans Comarapa</title>
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
  }, 300)
}
