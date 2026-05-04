import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchCurrentRegister,
  fetchDailySummary,
  fetchTransactions,
  clearError,
} from '@/store/cash-register.slice'
import { officeService } from '@/services/office.service'
import { cashRegisterService } from '@/services/cash-register.service'
import type { CashRegisterHistoryItem } from '@/types/cash-register'

export function useCashRegisterPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const {
    currentRegister,
    dailySummary,
    transactions,
    isLoading,
    error,
  } = useAppSelector((state) => state.cashRegister)

  const [officeName, setOfficeName] = useState<string>('')
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)
  const [history, setHistory] = useState<CashRegisterHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const officeId = user?.office_id
  const userId = user?.id || 0

  const loadRegisterData = useCallback(async () => {
    if (!officeId) return
    dispatch(clearError())
    await dispatch(fetchCurrentRegister(officeId))
  }, [officeId, dispatch])

  const loadHistory = useCallback(async () => {
    if (!officeId) return
    setHistoryLoading(true)
    try {
      const response = await cashRegisterService.getHistory(officeId)
      setHistory(response.registers)
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [officeId])

  useEffect(() => {
    loadRegisterData()
  }, [loadRegisterData])

  useEffect(() => {
    if (currentRegister?.id) {
      dispatch(fetchDailySummary(currentRegister.id))
      dispatch(fetchTransactions(currentRegister.id))
    }
  }, [currentRegister?.id, dispatch])

  useEffect(() => {
    if (!officeId) return
    const loadOfficeName = async () => {
      try {
        const office = await officeService.getById(officeId)
        setOfficeName(office.name)
      } catch {
        setOfficeName('')
      }
    }
    loadOfficeName()
    loadHistory()
  }, [officeId, loadHistory])

  const handleRegisterOpened = () => {
    loadRegisterData()
  }

  const handleRegisterClosed = () => {
    loadRegisterData()
    loadHistory()
  }

  const handleWithdrawalSuccess = () => {
    if (currentRegister?.id) {
      dispatch(fetchDailySummary(currentRegister.id))
      dispatch(fetchTransactions(currentRegister.id))
    }
  }

  const isOpen = currentRegister?.status === 'open'

  return {
    user,
    currentRegister,
    dailySummary,
    transactions,
    isLoading,
    error,
    officeName,
    withdrawalModalOpen,
    setWithdrawalModalOpen,
    history,
    historyLoading,
    officeId,
    userId,
    isOpen,
    handleRegisterOpened,
    handleRegisterClosed,
    handleWithdrawalSuccess,
  }
}
