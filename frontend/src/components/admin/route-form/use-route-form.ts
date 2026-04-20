import { useEffect, useMemo, useState } from 'react'
import { locationService } from '@/services/location.service'
import type { Location, RouteFormState, Schedule, RouteFormProps } from './types'

let localIdCounter = 0

const EMPTY_FORM: RouteFormState = {
  origin_location_id: '',
  destination_location_id: '',
  distance: '',
  duration: '',
  price: '',
}

export function useRouteForm(route: RouteFormProps['route']) {
  const [locations, setLocations] = useState<Location[]>([])
  const [newScheduleTime, setNewScheduleTime] = useState('')
  const [scheduleError, setScheduleError] = useState('')
  const [localSchedules, setLocalSchedules] = useState<Schedule[]>([])
  const [form, setForm] = useState<RouteFormState>(EMPTY_FORM)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await locationService.getAll()
        setLocations(data)
      } catch (err) {
        console.error('Error loading locations:', err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (route) {
      setForm({
        origin_location_id: String(route.origin_location_id ?? ''),
        destination_location_id: String(route.destination_location_id ?? ''),
        distance: String(route.distance ?? ''),
        duration: String(route.duration ?? ''),
        price: String(route.price ?? ''),
      })
      if (route.schedules && route.schedules.length > 0) {
        setLocalSchedules(route.schedules.map((s) => ({
          id: s.id,
          route_id: s.route_id,
          departure_time: s.departure_time,
          is_active: s.is_active,
          _isNew: false,
          _localId: ++localIdCounter,
        })))
      } else {
        setLocalSchedules([])
      }
    } else {
      setForm(EMPTY_FORM)
      setLocalSchedules([])
    }
  }, [route])

  const sameLocationError = Boolean(
    form.origin_location_id &&
    form.destination_location_id &&
    form.origin_location_id === form.destination_location_id,
  )

  const availableDestinations = useMemo(
    () => locations.filter((loc) => loc.id.toString() !== form.origin_location_id.toString()),
    [locations, form.origin_location_id],
  )

  const sortedLocalSchedules = useMemo(
    () => [...localSchedules].sort((a, b) => a.departure_time.localeCompare(b.departure_time)),
    [localSchedules],
  )

  const addLocalSchedule = () => {
    if (!newScheduleTime) return
    setScheduleError('')

    const timeWithSeconds = newScheduleTime.length === 5 ? newScheduleTime + ':00' : newScheduleTime
    const exists = localSchedules.some((s) => s.departure_time.substring(0, 5) === newScheduleTime.substring(0, 5))

    if (exists) {
      setScheduleError('Este horario ya existe')
      return
    }

    setLocalSchedules([
      ...localSchedules,
      { _localId: ++localIdCounter, departure_time: timeWithSeconds, is_active: true, _isNew: true },
    ])
    setNewScheduleTime('')
  }

  const removeLocalSchedule = (sortedIndex: number) => {
    const sortedItem = sortedLocalSchedules[sortedIndex]
    const realIndex = localSchedules.findIndex((s) =>
      (s._localId && s._localId === sortedItem._localId) || (s.id && s.id === sortedItem.id),
    )
    if (realIndex !== -1) {
      const next = [...localSchedules]
      next.splice(realIndex, 1)
      setLocalSchedules(next)
    }
  }

  const toggleScheduleActive = (sortedIndex: number) => {
    const sortedItem = sortedLocalSchedules[sortedIndex]
    const realIndex = localSchedules.findIndex((s) =>
      (s._localId && s._localId === sortedItem._localId) || (s.id && s.id === sortedItem.id),
    )
    if (realIndex !== -1) {
      const next = [...localSchedules]
      next[realIndex] = { ...next[realIndex], is_active: !next[realIndex].is_active }
      setLocalSchedules(next)
    }
  }

  return {
    locations,
    newScheduleTime, setNewScheduleTime,
    scheduleError,
    localSchedules,
    sortedLocalSchedules,
    form, setForm,
    sameLocationError,
    availableDestinations,
    addLocalSchedule,
    removeLocalSchedule,
    toggleScheduleActive,
  }
}
