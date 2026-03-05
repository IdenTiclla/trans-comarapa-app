import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { driverService } from '@/services/driver.service'

interface DriverState { drivers: unknown[]; isLoading: boolean; error: string | null }
const initialState: DriverState = { drivers: [], isLoading: false, error: null }

export const fetchDrivers = createAsyncThunk('driver/fetchAll', async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return await driverService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
})

const driverSlice = createSlice({
    name: 'driver',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDrivers.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchDrivers.fulfilled, (s, a) => { s.isLoading = false; s.drivers = a.payload as unknown[] })
            .addCase(fetchDrivers.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })
    },
})

export const selectDrivers = (state: { driver: DriverState }) => state.driver.drivers
export default driverSlice.reducer
