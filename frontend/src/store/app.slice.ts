import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { COMPANY } from '@/lib/company-config'

interface Notification {
    id: number
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
}

interface AppState {
    appName: string
    isLoading: boolean
    notifications: Notification[]
}

const initialState: AppState = {
    appName: COMPANY.name,
    isLoading: false,
    notifications: [],
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        },
        addNotification(state, action: PayloadAction<Omit<Notification, 'id'>>) {
            state.notifications.push({ id: Date.now(), ...action.payload })
        },
        removeNotification(state, action: PayloadAction<number>) {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload)
        },
    },
})

export const { setLoading, addNotification, removeNotification } = appSlice.actions

export const selectAppName = (state: RootState) => state.app.appName
export const selectIsLoading = (state: RootState) => state.app.isLoading
export const selectNotifications = (state: RootState) => state.app.notifications

export default appSlice.reducer
