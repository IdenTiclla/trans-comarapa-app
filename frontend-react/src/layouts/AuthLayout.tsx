import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800">Trans Comarapa</span>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <Outlet />
      </div>

      <footer className="py-4 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Trans Comarapa. Todos los derechos reservados.
      </footer>
    </div>
  )
}
