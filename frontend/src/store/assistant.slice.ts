import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { assistantService } from '@/services/assistant.service'

interface AssistantState { assistants: unknown[]; isLoading: boolean; error: string | null }
const initialState: AssistantState = { assistants: [], isLoading: false, error: null }

export const fetchAssistants = createAsyncThunk('assistant/fetchAll', async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return await assistantService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
})

const assistantSlice = createSlice({
    name: 'assistant',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssistants.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchAssistants.fulfilled, (s, a) => { s.isLoading = false; s.assistants = a.payload as unknown[] })
            .addCase(fetchAssistants.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })
    },
})

export const selectAssistants = (state: { assistant: AssistantState }) => state.assistant.assistants
export default assistantSlice.reducer
