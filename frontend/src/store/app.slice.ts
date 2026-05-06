import { createSlice } from '@reduxjs/toolkit'
import { COMPANY } from '@/lib/company-config'

interface AppState {
    appName: string
}

const initialState: AppState = {
    appName: COMPANY.name,
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {},
})

export default appSlice.reducer
