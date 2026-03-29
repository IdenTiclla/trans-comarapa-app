import { NavLink } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { NAV_GROUPS, ROLE_LABELS } from '@/lib/navigation'
import type { Role } from '@/lib/constants'
import { LogOut, Settings, Bus } from 'lucide-react'

export default function AppSidebar() {
  const { userRole, logout } = useAuth()

  const groups = NAV_GROUPS[userRole as Role] ?? []
  const roleLabel = ROLE_LABELS[userRole as Role] ?? userRole ?? ''

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-white">
            <Bus className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">Trans Comarapa</span>
            <span className="text-xs text-sidebar-foreground/60">{roleLabel}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : ''
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configuración">
              <NavLink to="/profile">
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
