import { useState } from 'react'
import { cashRegisterService } from '@/services/cash-register.service'
import type { CashTransaction } from '@/types/cash-register'

export function useRegisterTransactions() {
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [expandedTransactions, setExpandedTransactions] = useState<CashTransaction[]>([])
    const [loadingTransactions, setLoadingTransactions] = useState(false)

    const toggleExpand = async (registerId: number) => {
        if (expandedId === registerId) {
            setExpandedId(null)
            setExpandedTransactions([])
            return
        }

        setExpandedId(registerId)
        setLoadingTransactions(true)
        try {
            const transactions = await cashRegisterService.getTransactions(registerId)
            setExpandedTransactions(transactions)
        } catch {
            setExpandedTransactions([])
        } finally {
            setLoadingTransactions(false)
        }
    }

    return {
        expandedId,
        expandedTransactions,
        loadingTransactions,
        toggleExpand,
    }
}
