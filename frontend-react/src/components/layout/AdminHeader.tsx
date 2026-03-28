import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const NAV_LINKS: Record<string, { to: string; label: string }[]> = {
    admin: [
        { to: '/dashboards/dashboard-admin', label: 'Dashboard' },
        { to: '/admin/users', label: 'Usuarios' },
        { to: '/admin/secretaries', label: 'Secretarias' },
        { to: '/admin/drivers', label: 'Choferes' },
        { to: '/admin/owners', label: 'Socios' },
        { to: '/admin/assistants', label: 'Asistentes' },
        { to: '/admin/buses', label: 'Buses' },
        { to: '/admin/routes', label: 'Rutas' },
        { to: '/admin/offices', label: 'Oficinas' },
        { to: '/admin/financial', label: 'Finanzas' },
        { to: '/admin/owner-settlements', label: 'Liq. Socios' },
        { to: '/reports', label: 'Reportes' },
    ],
    secretary: [
        { to: '/dashboards/dashboard-secretary', label: 'Dashboard' },
        { to: '/trips', label: 'Viajes' },
        { to: '/bookings', label: 'Boletos' },
        { to: '/packages', label: 'Encomiendas' },
        { to: '/admin/cash-register', label: 'Caja' },
        { to: '/admin/owner-settlements', label: 'Liq. Socios' },
        { to: '/clients', label: 'Clientes' },
        { to: '/reports', label: 'Reportes' },
    ],
    driver: [
        { to: '/dashboards/dashboard-driver', label: 'Dashboard' },
    ],
    assistant: [
        { to: '/dashboards/dashboard-assistant', label: 'Dashboard' },
    ],
}

function NavItem({ to, label, mobile }: { to: string; label: string; mobile?: boolean }) {
    const base = mobile
        ? 'block px-3 py-2 rounded-md text-base font-medium'
        : 'px-3 py-2 rounded-md text-sm font-medium'
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `${base} ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
            }
        >
            {label}
        </NavLink>
    )
}

export default function AdminHeader() {
    const { user, userFullName, userInitials, userRole, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const links = NAV_LINKS[userRole ?? ''] ?? []

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        setUserMenuOpen(false)
        setMobileOpen(false)
        await logout()
    }

    return (
        <header className="bg-white shadow-sm w-full relative z-40">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-gray-800">
                            Trans Comarapa
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex space-x-4">
                        {links.map((link) => (
                            <NavItem key={link.to} {...link} />
                        ))}
                    </nav>

                    <div className="flex items-center">
                        {/* User menu */}
                        <div className="ml-3 relative">
                            <button
                                ref={buttonRef}
                                onClick={() => setUserMenuOpen((v) => !v)}
                                type="button"
                                className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                id="user-menu-button"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white">
                                    {userInitials}
                                </div>
                            </button>

                            {userMenuOpen && (
                                <div
                                    ref={menuRef}
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100"
                                    role="menu"
                                >
                                    <Link
                                        to="/profile"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        Perfil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex md:hidden ml-2">
                            <button
                                type="button"
                                onClick={() => setMobileOpen((v) => !v)}
                                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {mobileOpen ? (
                                    <XMarkIcon className="block h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden w-full bg-white border-t border-gray-100 shadow-inner">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {links.map((link) => (
                            <NavItem key={link.to} {...link} mobile />
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-5">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-white">
                                    {userInitials}
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{userFullName}</div>
                                <div className="text-sm font-medium text-gray-500">{user?.email ?? ''}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <Link
                                to="/profile"
                                onClick={() => setMobileOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            >
                                Perfil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
