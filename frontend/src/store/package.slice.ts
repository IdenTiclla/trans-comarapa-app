import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { packageService } from '@/services/package.service'
import type { RootState } from '@/store'
import type { Package } from '@/types'

interface Pagination {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}

interface PaginatedPackages {
    items?: Package[]
    packages?: Package[]
    total?: number
    pages?: number
    page?: number
}

interface PackageState {
    packages: Package[]
    currentPackage: Package | null
    loading: boolean
    error: string | null
    pagination: Pagination
}

const initialState: PackageState = {
    packages: [],
    currentPackage: null,
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
    },
}

export const fetchPackages = createAsyncThunk(
    'package/fetchAll',
    async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
        try { return await packageService.getAll(params) } catch (e) { return rejectWithValue((e as Error).message) }
    }
)

export const fetchPackageById = createAsyncThunk(
    'package/fetchById',
    async (id: number, { rejectWithValue }) => {
        try { return await packageService.getById(id) } catch (e) { return rejectWithValue((e as Error).message) }
    }
)

export const createPackage = createAsyncThunk(
    'package/create',
    async (data: Record<string, unknown>, { rejectWithValue }) => {
        try { return await packageService.create(data) } catch (e) { return rejectWithValue((e as Error).message) }
    }
)

export const updatePackage = createAsyncThunk(
    'package/update',
    async ({ id, data }: { id: number; data: Record<string, unknown> }, { rejectWithValue }) => {
        try { return await packageService.update(id, data) } catch (e) { return rejectWithValue((e as Error).message) }
    }
)

export const deletePackage = createAsyncThunk(
    'package/delete',
    async (id: number, { rejectWithValue }) => {
        try { await packageService.delete(id); return id } catch (e) { return rejectWithValue((e as Error).message) }
    }
)

const packageSlice = createSlice({
    name: 'package',
    initialState,
    reducers: {
        clearCurrentPackage(state) { state.currentPackage = null },
        clearError(state) { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPackages.pending, (s) => { s.loading = true; s.error = null })
            .addCase(fetchPackages.fulfilled, (s, a) => {
                s.loading = false
                const data = a.payload as Package[] | PaginatedPackages
                if (Array.isArray(data)) {
                    s.packages = data
                    s.pagination.totalItems = data.length
                } else {
                    s.packages = data?.items || data?.packages || []
                    s.pagination.totalItems = data?.total || s.packages.length
                    s.pagination.totalPages = data?.pages || 1
                    s.pagination.currentPage = data?.page || 1
                }
            })
            .addCase(fetchPackages.rejected, (s, a) => { s.loading = false; s.error = a.payload as string })
            .addCase(fetchPackageById.pending, (s) => { s.loading = true; s.error = null })
            .addCase(fetchPackageById.fulfilled, (s, a) => { s.loading = false; s.currentPackage = a.payload as Package })
            .addCase(fetchPackageById.rejected, (s, a) => { s.loading = false; s.error = a.payload as string })
            .addCase(updatePackage.fulfilled, (s, a) => {
                const payload = a.payload as Package
                s.currentPackage = payload
                const idx = s.packages.findIndex((p) => p.id === payload.id)
                if (idx !== -1) s.packages[idx] = payload
            })
            .addCase(deletePackage.fulfilled, (s, a) => {
                s.packages = s.packages.filter((p) => p.id !== a.payload)
            })
    },
})

export const { clearCurrentPackage, clearError } = packageSlice.actions

export const selectPackages = (state: RootState) => state.package.packages
export const selectCurrentPackage = (state: RootState) => state.package.currentPackage
export const selectPackageLoading = (state: RootState) => state.package.loading
export const selectPackageError = (state: RootState) => state.package.error
export const selectPackagePagination = (state: RootState) => state.package.pagination

export const selectIsLoading = selectPackageLoading

export default packageSlice.reducer
