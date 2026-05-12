import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'

export default function DefaultLayout() {
  const location = useLocation()

  useEffect(() => {
    const announcer = document.getElementById('route-announcer')
    if (announcer) {
      announcer.textContent = ''
      requestAnimationFrame(() => {
        announcer.textContent = document.title
      })
    }
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
    }
  }, [location.pathname])

  return (
    <>
      <div
        id="route-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div id="main-content" className="flex-1 p-4 lg:p-6 min-w-0" tabIndex={-1}>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
