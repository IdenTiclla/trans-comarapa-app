import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { store } from '@/store'
import { initAuth } from '@/store/auth.slice'
import { router } from '@/router'
import '@/styles/globals.css'

// Initialize auth state from localStorage before rendering
store.dispatch(initAuth())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </Provider>
  </StrictMode>
)
