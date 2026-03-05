import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { busService } from '@/services/bus.service'

interface BusState {
    buses: unknown[]
    currentBus: unknown | null
    isLoading: boolean
    error: string | null
}

const initialState: BusState = {
    buses: [],
    currentBus: null,
    isLoading: false,
    error: null,
}

export const fetchBuses = createAsyncThunk('bus/fetchAll', async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return await busService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const fetchBusById = createAsyncThunk('bus/fetchById', async (id: number, { rejectWithValue }) => {
    try { return await busService.getById(id) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const createBus = createAsyncThunk('bus/create', async (data: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try { const r = await busService.create(data); dispatch(fetchBuses({})); return r } catch (e) { return rejectWithValue((e as Error).message) }
})
export const updateBus = createAsyncThunk('bus/update', async ({ id, data }: { id: number; data: Record<string, unknown> }, { dispatch, rejectWithValue }) => {
    try { const r = await busService.update(id, data); dispatch(fetchBuses({})); return r } catch (e) { return rejectWithValue((e as Error).message) }
})
export const deleteBus = createAsyncThunk('bus/delete', async (id: number, { dispatch, rejectWithValue }) => {
    try { await busService.delete(id); dispatch(fetchBuses({})); return id } catch (e) { return rejectWithValue((e as Error).message) }
})

const busSlice = createSlice({
    name: 'bus',
    initialState,
    reducers: { clearCurrentBus(state) { state.currentBus = null } },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBuses.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchBuses.fulfilled, (s, a) => { s.isLoading = false; s.buses = a.payload as unknown[] })
            .addCase(fetchBuses.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; s.buses = [] })
            .addCase(fetchBusById.fulfilled, (s, a) => { s.currentBus = a.payload })
            .addCase(createBus.rejected, (s, a) => { s.error = a.payload as string })
            .addCase(updateBus.rejected, (s, a) => { s.error = a.payload as string })
            .addCase(deleteBus.rejected, (s, a) => { s.error = a.payload as string })
    },
})

export const { clearCurrentBus } = busSlice.actions
export const selectBuses = (state: { bus: BusState }) => state.bus.buses
export const selectBusLoading = (state: { bus: BusState }) => state.bus.isLoading
export const selectBusError = (state: { bus: BusState }) => state.bus.error
export default busSlice.reducer
