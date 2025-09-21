import { useEffect, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, getSession, onAuthStateChange } from "@/services/auth";
import {
  User,
  Settings,
  LogOut,
  UserPlus,
  Calendar,
} from "lucide-react";

export function TopNavbar({ children }: { children?: ReactNode }) {
  const { 
    setOpenDialogOnLoad 
  } = useAppStore();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    getSession().then((session) => {
      const user = session?.user;
      setDisplayName(user?.user_metadata?.full_name || user?.email || null);
      setIsLoadingUser(false);
    });
    const sub = onAuthStateChange((session) => {
      const user = session?.user;
      setDisplayName(user?.user_metadata?.full_name || user?.email || null);
      setIsLoadingUser(false);
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
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Conglomerate Realty CRM
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoadingUser ? (
                <Skeleton className="h-3 w-32" />
              ) : (
                displayName ? `Welcome back, ${displayName}` : "Welcome"
              )}
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

        {children}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {isLoadingUser ? (
                <LoadingSpinner size="sm" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="hidden md:inline">
                {isLoadingUser ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  displayName || "Account"
                )}
              </span>
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
