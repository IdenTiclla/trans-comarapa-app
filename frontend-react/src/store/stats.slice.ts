import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { statsService } from '@/services/stats.service'
import { salesService } from '@/services/sales.service'

interface StatData {
    count: number
    amount?: number
    trend: number
}

interface SalesSummary {
    totalAmount: number
    ticketCount: number
    packageCount: number
    trend: number
}

interface StatsState {
    dashboardStats: {
        tickets: StatData | null
        packages: StatData | null
        trips: StatData | null
    }
    salesSummary: SalesSummary | null
    isLoading: boolean
    error: string | null
}

const initialState: StatsState = {
    dashboardStats: { tickets: null, packages: null, trips: null },
    salesSummary: null,
    isLoading: false,
    error: null,
}

export const fetchDashboardStats = createAsyncThunk(
    'stats/fetchDashboardStats',
    async (period: string = 'today', { rejectWithValue }) => {
        try {
            const [dashboard, salesSummary] = await Promise.all([
                statsService.getDashboardStats(period) as Promise<{
                    tickets: StatData
                    packages: StatData
                    trips: StatData
                }>,
                salesService.getSalesSummary(period) as Promise<SalesSummary>,
            ])
            return { dashboard, salesSummary }
        } catch (error) {
            return rejectWithValue((error as Error).message || 'Error al cargar estadísticas')
        }
    }
)

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        clearStatsError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false
                state.dashboardStats = {
                    tickets: action.payload.dashboard.tickets || null,
                    packages: action.payload.dashboard.packages || null,
                    trips: action.payload.dashboard.trips || null,
                }
                state.salesSummary = action.payload.salesSummary
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
                state.dashboardStats = {
                    tickets: { count: 0, amount: 0, trend: 0 },
                    packages: { count: 0, trend: 0 },
                    trips: { count: 0, trend: 0 },
                }
                state.salesSummary = { totalAmount: 0, ticketCount: 0, packageCount: 0, trend: 0 }
            })
    },
})

export const { clearStatsError } = statsSlice.actions

export const selectDashboardStats = (state: { stats: StatsState }) => state.stats.dashboardStats

const defaultStatData: StatData = { count: 0, amount: 0, trend: 0 }
const defaultPackageData: StatData = { count: 0, trend: 0 }
const defaultSalesSummary: SalesSummary = { totalAmount: 0, ticketCount: 0, packageCount: 0, trend: 0 }

export const selectTicketStats = (state: { stats: StatsState }) => state.stats.dashboardStats.tickets || defaultStatData
export const selectPackageStats = (state: { stats: StatsState }) => state.stats.dashboardStats.packages || defaultPackageData
export const selectTripStats = (state: { stats: StatsState }) => state.stats.dashboardStats.trips || defaultPackageData
export const selectSalesSummary = (state: { stats: StatsState }) => state.stats.salesSummary || defaultSalesSummary
export const selectStatsLoading = (state: { stats: StatsState }) => state.stats.isLoading
export const selectStatsError = (state: { stats: StatsState }) => state.stats.error

export default statsSlice.reducer
