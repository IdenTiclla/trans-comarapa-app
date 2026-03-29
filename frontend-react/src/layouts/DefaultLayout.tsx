import { Outlet } from 'react-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'

export default function DefaultLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
