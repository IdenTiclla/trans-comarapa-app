import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { officeService } from '@/services/office.service'
import type { Office } from '@/types/office'

interface OfficeState {
    offices: Office[]
    isLoading: boolean
    error: string | null
}

const initialState: OfficeState = { offices: [], isLoading: false, error: null }

export const fetchOffices = createAsyncThunk('office/fetchAll', async (_, { rejectWithValue }) => {
    try { return await officeService.getAll() } catch (e) { return rejectWithValue((e as Error).message) }
})

export const fetchOffice = createAsyncThunk('office/fetchOne', async (id: number, { rejectWithValue }) => {
    try { return await officeService.getById(id) } catch (e) { return rejectWithValue((e as Error).message) }
})

export const createOffice = createAsyncThunk('office/create', async (data: Omit<Office, 'id' | 'created_at' | 'updated_at'>, { dispatch, rejectWithValue }) => {
    try { 
        const response = await officeService.create(data); 
        dispatch(fetchOffices()); 
        return response 
    } catch (e) { 
        return rejectWithValue((e as Error).message) 
    }
})

export const updateOffice = createAsyncThunk('office/update', async ({ id, data }: { id: number; data: Partial<Office> }, { dispatch, rejectWithValue }) => {
    try { 
        const response = await officeService.update(id, data); 
        dispatch(fetchOffices()); 
        return response 
    } catch (e) { 
        return rejectWithValue((e as Error).message) 
    }
})

export const deleteOffice = createAsyncThunk('office/delete', async (id: number, { dispatch, rejectWithValue }) => {
    try { 
        await officeService.delete(id); 
        dispatch(fetchOffices()); 
        return id 
    } catch (e) { 
        return rejectWithValue((e as Error).message) 
    }
})

const officeSlice = createSlice({
    name: 'office',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOffices.pending, (state) => { state.isLoading = true; state.error = null })
            .addCase(fetchOffices.fulfilled, (state, action) => { state.isLoading = false; state.offices = action.payload })
            .addCase(fetchOffices.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
    },
})

export const selectOffices = (state: { office: OfficeState }) => state.office.offices
export const selectOfficeLoading = (state: { office: OfficeState }) => state.office.isLoading
export const selectOfficeError = (state: { office: OfficeState }) => state.office.error

export default officeSlice.reducer
