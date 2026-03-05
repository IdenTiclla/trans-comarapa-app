import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { routeService } from '@/services/route.service'

interface RouteState {
    routes: unknown[]
    routesWithSchedules: unknown[]
    currentRoute: unknown | null
    isLoading: boolean
    error: string | null
}

const initialState: RouteState = {
    routes: [],
    routesWithSchedules: [],
    currentRoute: null,
    isLoading: false,
    error: null,
}

export const fetchRoutes = createAsyncThunk('route/fetchAll', async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try { return await routeService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
})
export const fetchRoutesWithSchedules = createAsyncThunk('route/fetchWithSchedules', async (_, { rejectWithValue }) => {
    try { return await routeService.getWithSchedules() } catch (e) { return rejectWithValue((e as Error).message) }
})
export const createRoute = createAsyncThunk('route/create', async (data: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try { const r = await routeService.create(data); dispatch(fetchRoutes({})); return r } catch (e) { return rejectWithValue((e as Error).message) }
})
export const updateRoute = createAsyncThunk('route/update', async ({ id, data }: { id: number; data: Record<string, unknown> }, { dispatch, rejectWithValue }) => {
    try { const r = await routeService.update(id, data); dispatch(fetchRoutes({})); return r } catch (e) { return rejectWithValue((e as Error).message) }
})
export const deleteRoute = createAsyncThunk('route/delete', async (id: number, { dispatch, rejectWithValue }) => {
    try { await routeService.delete(id); dispatch(fetchRoutes({})); return id } catch (e) { return rejectWithValue((e as Error).message) }
})

const routeSlice = createSlice({
    name: 'route',
    initialState,
    reducers: { clearCurrentRoute(state) { state.currentRoute = null } },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoutes.pending, (s) => { s.isLoading = true; s.error = null })
            .addCase(fetchRoutes.fulfilled, (s, a) => { s.isLoading = false; s.routes = a.payload as unknown[] })
            .addCase(fetchRoutes.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; s.routes = [] })
            .addCase(fetchRoutesWithSchedules.fulfilled, (s, a) => { s.routesWithSchedules = a.payload as unknown[] })
            .addCase(createRoute.rejected, (s, a) => { s.error = a.payload as string })
            .addCase(updateRoute.rejected, (s, a) => { s.error = a.payload as string })
            .addCase(deleteRoute.rejected, (s, a) => { s.error = a.payload as string })
    },
})

export const { clearCurrentRoute } = routeSlice.actions
export const selectRoutes = (state: { route: RouteState }) => state.route.routes
export const selectRouteLoading = (state: { route: RouteState }) => state.route.isLoading
export const selectRouteError = (state: { route: RouteState }) => state.route.error
export default routeSlice.reducer
