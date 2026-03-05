import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { locationService } from '@/services/location.service'

interface LocationState {
    locations: unknown[]
    isLoading: boolean
    error: string | null
}

const initialState: LocationState = { locations: [], isLoading: false, error: null }

export const fetchLocations = createAsyncThunk('location/fetchAll', async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return await locationService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const createLocation = createAsyncThunk('location/create', async (data: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try { const r = await locationService.create(data); dispatch(fetchLocations({})); return r } catch (e) { return rejectWithValue((e as Error).message) }
})
export const updateLocation = createAsyncThunk('location/update', async ({ id, data }: { id: number; data: Record<string, unknown> }, { dispatch, rejectWithValue }) => {
    try { const r = await locationService.update(id, data); dispatch(fetchLocations({})); return r } catch (e) { return rejectWithValue((e as Error).message) }
})
export const deleteLocation = createAsyncThunk('location/delete', async (id: number, { dispatch, rejectWithValue }) => {
    try { await locationService.delete(id); dispatch(fetchLocations({})); return id } catch (e) { return rejectWithValue((e as Error).message) }
})

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocations.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchLocations.fulfilled, (s, a) => { s.isLoading = false; s.locations = a.payload as unknown[] })
            .addCase(fetchLocations.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })
    },
})

export const selectLocations = (state: { location: LocationState }) => state.location.locations
export const selectLocationLoading = (state: { location: LocationState }) => state.location.isLoading
export default locationSlice.reducer
