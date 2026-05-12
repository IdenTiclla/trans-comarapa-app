import { Link } from 'react-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Bell, User, LogOut } from 'lucide-react'
import { ROUTES } from '@/lib/routes'

export default function AppHeader() {
  const { user, userFullName, userInitials, logout } = useAuth()
  const breadcrumbs = useBreadcrumb()

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Mobile: current page name only (breadcrumb hidden) — avoid duplicating page h1 */}
      <nav aria-label="Ubicación" className="md:hidden min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground" aria-current="page">
          {breadcrumbs[breadcrumbs.length - 1]?.label}
        </p>
      </nav>

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={crumb.path} className="contents">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.path}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-11 md:size-8" aria-label="Notificaciones">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-11 md:size-8 rounded-full" aria-label="Menú de usuario">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {userInitials}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userFullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.PROFILE} className="cursor-pointer">
                <User className="mr-2 size-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
