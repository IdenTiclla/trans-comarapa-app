import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { apiFetch } from '@/lib/api'
import type { Passenger } from './helpers'

export function useTripSheet(tripId: number) {
  const dispatch = useAppDispatch()
  const trip = useAppSelector(selectCurrentTrip) as any
  const loading = useAppSelector(selectTripLoading)
  const error = useAppSelector(selectTripError)

  const [passengersBySeat, setPassengersBySeat] = useState<Record<number, Passenger>>({})
  const [loadingPassengers, setLoadingPassengers] = useState(true)
  const [passError, setPassError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoadingPassengers(true)
      setPassError(null)
      try {
        await dispatch(fetchTripById(tripId))
        const tickets = await apiFetch(`/tickets/trip/${tripId}`)
        const confirmed = (Array.isArray(tickets) ? tickets : [])
          .filter((t: Passenger) => ['confirmed', 'sold', 'paid'].includes(t.state))
          .sort((a: Passenger, b: Passenger) => (a.seat?.seat_number || 0) - (b.seat?.seat_number || 0))
        setPassengersBySeat(
          confirmed.reduce((acc: Record<number, Passenger>, p: Passenger) => {
            if (p.seat?.seat_number) acc[p.seat.seat_number] = p
            return acc
          }, {})
        )
      } catch (err: any) {
        setPassError(err?.message || 'Error al cargar la planilla.')
      } finally {
        setLoadingPassengers(false)
      }
    }
    load()
  }, [dispatch, tripId])

  const getPassengerName = (n: number) => {
    const p = passengersBySeat[n]
    return p ? `${p.client?.firstname || ''} ${p.client?.lastname || ''}` : ''
  }
  const getPassengerDoc = (n: number) => passengersBySeat[n]?.client?.document_id || ''
  const getPassengerDest = (n: number) => {
    const p = passengersBySeat[n]
    if (!p) return ''
    if (p.destination?.trim()) return p.destination
    return trip?.route?.destination?.name || trip?.route?.destination || ''
  }

  const totalPassengers = Object.keys(passengersBySeat).length
  const totalAmount = Object.values(passengersBySeat).reduce((acc, p) => acc + Number(p.price || 0), 0)

  return {
    trip,
    isLoading: loading || loadingPassengers,
    hasError: error || passError,
    errorMessage: error || passError,
    getPassengerName,
    getPassengerDoc,
    getPassengerDest,
    totalPassengers,
    totalAmount,
  }
}
