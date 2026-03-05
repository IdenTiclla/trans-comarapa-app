import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ticketService } from '@/services/ticket.service'

interface TicketState { tickets: unknown[]; isLoading: boolean; error: string | null }
const initialState: TicketState = { tickets: [], isLoading: false, error: null }

export const fetchTickets = createAsyncThunk('ticket/fetchAll', async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return await ticketService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const fetchTicketsByTrip = createAsyncThunk('ticket/fetchByTrip', async (tripId: number, { rejectWithValue }) => {
    try { return await ticketService.getByTripId(tripId) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const createTicket = createAsyncThunk('ticket/create', async (data: Record<string, unknown>, { rejectWithValue }) => {
    try { return await ticketService.create(data) } catch (e) { return rejectWithValue((e as Error).message) }
})

const ticketSlice = createSlice({
    name: 'ticket',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTickets.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchTickets.fulfilled, (s, a) => { s.isLoading = false; s.tickets = a.payload as unknown[] })
            .addCase(fetchTickets.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string })
            .addCase(fetchTicketsByTrip.fulfilled, (s, a) => { s.tickets = a.payload as unknown[] })
    },
})

export const selectTickets = (state: { ticket: TicketState }) => state.ticket.tickets
export const selectTicketLoading = (state: { ticket: TicketState }) => state.ticket.isLoading
export default ticketSlice.reducer
