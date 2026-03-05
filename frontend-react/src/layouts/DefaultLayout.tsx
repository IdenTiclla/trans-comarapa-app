import { Outlet } from 'react-router'
import AdminHeader from '@/components/layout/AdminHeader'

export default function DefaultLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 w-full">
      <AdminHeader />

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <footer className="bg-gray-100 text-center py-6 mt-auto w-full">
        <p className="text-sm text-gray-600">&copy;2025 Trans Comarapa</p>
      </footer>
    </div>
  )
}
