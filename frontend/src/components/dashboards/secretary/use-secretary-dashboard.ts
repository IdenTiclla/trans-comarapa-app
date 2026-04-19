import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '@/store'
import { fetchDashboardStats } from '@/store/stats.slice'
import { activityService } from '@/services/activity.service'
import { cashRegisterService } from '@/services/cash-register.service'
import type { CashRegister, DailySummary } from '@/types/cash-register'
import type { Activity } from './activity-helpers'

export function useSecretaryDashboard(officeId: number | undefined) {
  const dispatch = useAppDispatch()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [cashLoading, setCashLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchDashboardStats('today'))
    intervalRef.current = setInterval(() => dispatch(fetchDashboardStats('today')), 5 * 60 * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [dispatch])

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setActivitiesLoading(true)
        const data = await activityService.getRecentActivities()
        setRecentActivities((data as Activity[]).slice(0, 5))
      } catch {
        setRecentActivities([])
      } finally {
        setActivitiesLoading(false)
      }
    }
    loadActivities()
  }, [])

  useEffect(() => {
    const loadCashRegister = async () => {
      if (!officeId) {
        setCashLoading(false)
        return
      }
      try {
        setCashLoading(true)
        const register = await cashRegisterService.getCurrentRegister(officeId)
        setCashRegister(register)
        if (register?.id) {
          const summary = await cashRegisterService.getDailySummary(register.id)
          setDailySummary(summary)
        } else {
          setDailySummary(null)
        }
      } catch {
        setCashRegister(null)
        setDailySummary(null)
      } finally {
        setCashLoading(false)
      }
    }
    loadCashRegister()
  }, [officeId])

  return { recentActivities, activitiesLoading, cashRegister, dailySummary, cashLoading }
}
