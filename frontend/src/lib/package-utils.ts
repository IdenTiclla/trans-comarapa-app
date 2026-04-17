/**
 * Pure utility functions for package calculation and validation.
 * Extracted from services/package.service.ts where they didn't belong
 * (a service should only contain API calls).
 */

export interface PackageItem {
    description: string
    quantity: number
    unit_price: number
}

export function calculatePackageTotal(items: PackageItem[]): number {
    return items.reduce((total, item) => total + item.quantity * item.unit_price, 0)
}

export function calculateItemsCount(items: PackageItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0)
}

export function validatePackageData(packageData: {
    items?: PackageItem[]
    sender_id?: number
    recipient_id?: number
}): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!packageData.items || packageData.items.length === 0) {
        errors.push('El paquete debe tener al menos un item')
    }

    if (packageData.items) {
        packageData.items.forEach((item, index) => {
            if (!item.description || item.description.trim() === '') {
                errors.push(`Item ${index + 1}: La descripción es requerida`)
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`)
            }
            if (!item.unit_price || item.unit_price <= 0) {
                errors.push(`Item ${index + 1}: El precio unitario debe ser mayor a 0`)
            }
        })
    }

    if (!packageData.sender_id) errors.push('El remitente es requerido')
    if (!packageData.recipient_id) errors.push('El destinatario es requerido')

    return { isValid: errors.length === 0, errors }
}
