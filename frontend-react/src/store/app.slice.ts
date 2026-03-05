import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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
    appName: 'Trans Comarapa',
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

export const selectAppName = (state: { app: AppState }) => state.app.appName
export const selectIsLoading = (state: { app: AppState }) => state.app.isLoading
export const selectNotifications = (state: { app: AppState }) => state.app.notifications

export default appSlice.reducer
