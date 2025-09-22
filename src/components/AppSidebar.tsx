import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  UserCircle,
  CreditCard,
  Calendar,
  BarChart3,
  Home,
  FileText,
  Shield
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Leads & Inquiries", url: "/leads", icon: Users },
  { title: "Property Inventory", url: "/inventory", icon: Building },
  { title: "Client Profiles", url: "/clients", icon: UserCircle },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Appointment Templates", url: "/appointment-templates", icon: FileText },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const adminNavigationItems = [
  { title: "Admin Console", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = useState<string>('agent');

  // Check if current page is admin page to apply admin theme
  const isAdminPage = currentPath === '/admin';

  useEffect(() => {
    // You can implement role detection logic here
    // For now, we'll check if user has access to admin route
    const checkUserRole = () => {
      // This should be replaced with actual role detection from auth service
      const role = localStorage.getItem('userRole') || 'agent';
      setUserRole(role);
    };
    checkUserRole();
  }, []);

  const isActive = (path: string) => currentPath === path;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground";

  return (
    <div className={isAdminPage ? 'admin-theme' : ''}>
      <Sidebar className={`${collapsed ? "w-14" : "w-64"} ${isAdminPage ? 'bg-[hsl(var(--admin-sidebar-background))] border-[hsl(var(--admin-sidebar-border))]' : 'bg-sidebar border-sidebar-border'}`}>
      <SidebarHeader className={`p-6 ${isAdminPage ? 'border-b border-[hsl(var(--admin-sidebar-border))]' : 'border-b border-sidebar-border'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isAdminPage ? 'bg-[hsl(var(--professional-blue))]' : 'bg-gradient-primary'
          }`}>
            <Home className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className={`font-bold text-lg ${
                isAdminPage ? 'text-[hsl(var(--admin-sidebar-foreground))]' : 'text-primary'
              }`}>Conglomerate Realty</h2>
              <p className={`text-sm ${
                isAdminPage ? 'text-[hsl(var(--admin-sidebar-foreground))]/70' : 'text-muted-foreground'
              }`}>{isAdminPage ? 'Admin Console' : 'Residential Lots CRM'}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs uppercase tracking-wide mb-2 ${
            isAdminPage ? 'text-[hsl(var(--admin-sidebar-foreground))]/50' : 'text-muted-foreground'
          }`}>
            Main Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavClass(
                          { isActive }
                        )}`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only show if user has admin role */}
        {userRole === 'admin' && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className={`text-xs uppercase tracking-wide mb-2 ${
              isAdminPage ? 'text-[hsl(var(--admin-sidebar-foreground))]/50' : 'text-muted-foreground'
            }`}>
              Administration
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavClass(
                            { isActive }
                          )} ${isActive && isAdminPage ? 'bg-[hsl(var(--professional-blue))] text-white' : ''}`
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
    </div>
  );
}