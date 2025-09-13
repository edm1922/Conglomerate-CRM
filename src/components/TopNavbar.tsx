import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { signOut, getSession, onAuthStateChange } from "@/services/auth";
import {
  Plus,
  Bell,
  User,
  Settings,
  LogOut,
  UserPlus,
  Calendar,
} from "lucide-react";

export function TopNavbar() {
  const { 
    leads,
    payments,
    setOpenDialogOnLoad 
  } = useAppStore();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);

  const notifications = [
    ...(leads.slice(0,2).map(l => ({ type: 'lead', message: `New lead: ${l.name}` }))),
    ...(payments.slice(0,1).map(p => ({ type: 'payment', message: `Payment from ${(p.clients as any)?.name}` })))
  ];

  useEffect(() => {
    getSession().then((session) => {
      const user = session?.user;
      setDisplayName(user?.user_metadata?.full_name || user?.email || null);
    });
    const sub = onAuthStateChange((session) => {
      const user = session?.user;
      setDisplayName(user?.user_metadata?.full_name || user?.email || null);
    });
    return () => {
      sub.unsubscribe?.();
    };
  }, []);

  const handleQuickAction = (dialog: 'lead' | 'payment' | 'appointment', path: string) => {
    setOpenDialogOnLoad(dialog);
    navigate(path);
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Conglomerate Realty CRM
          </h1>
          <p className="text-sm text-muted-foreground">
            {displayName ? `Welcome back, ${displayName}` : "Welcome"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleQuickAction('lead', '/leads')}>
            <UserPlus className="w-4 h-4" />
            Add Lead
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleQuickAction('payment', '/payments')}>
            <span className="text-sm font-bold">₱</span>
            Add Payment
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleQuickAction('appointment', '/calendar')}>
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2">
              <h3 className="font-semibold mb-2">Recent Notifications</h3>
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <div key={i} className="p-2 bg-muted rounded text-sm">{n.message}</div>
                ))}
                 {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center">No new notifications</p>}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden md:inline">{displayName || "Account"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
