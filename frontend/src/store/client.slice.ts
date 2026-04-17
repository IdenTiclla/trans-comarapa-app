import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { clientService } from '@/services/client.service'

interface ClientState {
    clients: unknown[]
    totalItems: number
    isLoading: boolean
    error: string | null
}

const initialState: ClientState = { clients: [], totalItems: 0, isLoading: false, error: null }

export const fetchClients = createAsyncThunk(
    'client/fetchAll',
    async ({ filters, pagination }: { filters?: Record<string, unknown>; pagination?: { page: number; itemsPerPage: number } } = {}, { rejectWithValue }) => {
        try { return await clientService.getAll(filters || {}, pagination) } catch (e) { return rejectWithValue((e as Error).message) }
    }
)
export const searchClients = createAsyncThunk('client/search', async (term: string, { rejectWithValue }) => {
    try { return await clientService.search(term) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const createClient = createAsyncThunk('client/create', async (data: Record<string, unknown>, { rejectWithValue }) => {
    try { return await clientService.create(data) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const updateClient = createAsyncThunk('client/update', async ({ id, data }: { id: number; data: Record<string, unknown> }, { rejectWithValue }) => {
    try { return await clientService.update(id, data) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const deleteClient = createAsyncThunk('client/delete', async (id: number, { rejectWithValue }) => {
    try { await clientService.delete(id); return id } catch (e) { return rejectWithValue((e as Error).message) }
})

const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchClients.fulfilled, (s, a) => {
                s.isLoading = false
                const data = a.payload
                if (Array.isArray(data)) { s.clients = data; s.totalItems = data.length }
                else {
                    const d = data as { items?: unknown[]; clients?: unknown[]; pagination?: { total: number }; total?: number };
                    s.clients = d.clients || d.items || [];
                    s.totalItems = d.pagination?.total || d.total || s.clients.length
                }
            })
            .addCase(fetchClients.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })
            .addCase(searchClients.fulfilled, (s, a) => { s.clients = a.payload as unknown[] })
    },
})

export const selectClients = (state: { client: ClientState }) => state.client.clients
export const selectClientLoading = (state: { client: ClientState }) => state.client.isLoading
export const selectClientError = (state: { client: ClientState }) => state.client.error
export default clientSlice.reducer
