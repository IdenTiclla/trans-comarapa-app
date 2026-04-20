import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { apiFetch } from '@/lib/api'
import type { TripPackage } from './helpers'

export function useTripManifest(tripId: number) {
  const dispatch = useAppDispatch()
  const trip = useAppSelector(selectCurrentTrip) as Record<string, unknown> | null
  const loading = useAppSelector(selectTripLoading)
  const error = useAppSelector(selectTripError)

  const [packages, setPackages] = useState<TripPackage[]>([])
  const [loadingPkgs, setLoadingPkgs] = useState(true)
  const [pkgError, setPkgError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoadingPkgs(true)
      setPkgError(null)
      try {
        await dispatch(fetchTripById(tripId))
        const data = await apiFetch(`/packages/by-trip/${tripId}`) as TripPackage[] | { items?: TripPackage[] }
        setPackages(Array.isArray(data) ? data : data?.items || [])
      } catch (err) {
        setPkgError(err instanceof Error ? err.message : 'Error al cargar el manifiesto.')
      } finally {
        setLoadingPkgs(false)
      }
    }
    load()
  }, [dispatch, tripId])

  return {
    trip,
    packages,
    isLoading: loading || loadingPkgs,
    hasError: error || pkgError,
    errorMessage: error || pkgError,
  }
}
