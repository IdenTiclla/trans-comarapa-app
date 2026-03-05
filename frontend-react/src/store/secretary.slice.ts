import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { secretaryService, type Secretary } from '@/services/secretary.service'

interface SecretaryState {
    secretaries: Secretary[]
    isLoading: boolean
    error: string | null
}

const initialState: SecretaryState = {
    secretaries: [],
    isLoading: false,
    error: null,
}

export const fetchSecretaries = createAsyncThunk(
    'secretary/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await secretaryService.getAll()
        } catch (error) {
            return rejectWithValue((error as Error).message || 'Error fetching secretaries')
        }
    }
)

const secretarySlice = createSlice({
    name: 'secretary',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSecretaries.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchSecretaries.fulfilled, (state, action) => {
                state.isLoading = false
                state.secretaries = action.payload
            })
            .addCase(fetchSecretaries.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    },
})

export const selectSecretaries = (state: { secretary: SecretaryState }) => state.secretary.secretaries
export const selectSecretaryLoading = (state: { secretary: SecretaryState }) => state.secretary.isLoading

export default secretarySlice.reducer
