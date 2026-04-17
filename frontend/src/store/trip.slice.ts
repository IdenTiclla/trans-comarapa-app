import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { tripService, type TripQueryParams } from '@/services/trip.service'

interface TripState {
    trips: unknown[]
    currentTrip: unknown | null
    totalItems: number
    isLoading: boolean
    error: string | null
}

const initialState: TripState = { trips: [], currentTrip: null, totalItems: 0, isLoading: false, error: null }

export const fetchTrips = createAsyncThunk('trip/fetchAll', async (params: TripQueryParams = {}, { rejectWithValue }) => {
    try { return await tripService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const fetchTripById = createAsyncThunk('trip/fetchById', async (id: number, { rejectWithValue }) => {
    try { return await tripService.getById(id) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const createTrip = createAsyncThunk('trip/create', async (data: Record<string, unknown>, { rejectWithValue }) => {
    try { return await tripService.create(data) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const updateTrip = createAsyncThunk('trip/update', async ({ id, data }: { id: number; data: Record<string, unknown> }, { rejectWithValue }) => {
    try { return await tripService.update(id, data) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const deleteTrip = createAsyncThunk('trip/delete', async (id: number, { rejectWithValue }) => {
    try { await tripService.delete(id); return id } catch (e) { return rejectWithValue((e as Error).message) }
})

const tripSlice = createSlice({
    name: 'trip',
    initialState,
    reducers: { clearCurrentTrip(state) { state.currentTrip = null } },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrips.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchTrips.fulfilled, (s, a) => {
                s.isLoading = false
                const data = a.payload
                if (Array.isArray(data)) { s.trips = data; s.totalItems = data.length }
                else {
                    const d = data as { items?: unknown[]; trips?: unknown[]; pagination?: { total: number }; total?: number }
                    s.trips = d.trips || d.items || [];
                    s.totalItems = d.pagination?.total || d.total || s.trips.length
                }
            })
            .addCase(fetchTrips.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; s.trips = [] })
            .addCase(fetchTripById.pending, (s) => { s.isLoading = true })
            .addCase(fetchTripById.fulfilled, (s, a) => { s.isLoading = false; s.currentTrip = a.payload })
            .addCase(fetchTripById.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })
    },
})

export const { clearCurrentTrip } = tripSlice.actions
export const selectTrips = (state: { trip: TripState }) => state.trip.trips
export const selectCurrentTrip = (state: { trip: TripState }) => state.trip.currentTrip
export const selectTripLoading = (state: { trip: TripState }) => state.trip.isLoading
export const selectTripError = (state: { trip: TripState }) => state.trip.error
export const selectTripTotal = (state: { trip: TripState }) => state.trip.totalItems
export default tripSlice.reducer
