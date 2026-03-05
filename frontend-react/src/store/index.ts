import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import authReducer from './auth.slice'
import appReducer from './app.slice'
import statsReducer from './stats.slice'
import busReducer from './bus.slice'
import routeReducer from './route.slice'
import locationReducer from './location.slice'
import driverReducer from './driver.slice'
import assistantReducer from './assistant.slice'
import tripReducer from './trip.slice'
import clientReducer from './client.slice'
import ticketReducer from './ticket.slice'
import packageReducer from './package.slice'
import secretaryReducer from './secretary.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    stats: statsReducer,
    bus: busReducer,
    route: routeReducer,
    location: locationReducer,
    driver: driverReducer,
    assistant: assistantReducer,
    trip: tripReducer,
    client: clientReducer,
    ticket: ticketReducer,
    package: packageReducer,
    secretary: secretaryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
