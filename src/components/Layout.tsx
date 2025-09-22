import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import NotificationBell from "@/components/NotificationBell";
import { checkReminders } from "@/services/reminders";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ background: 'var(--gradient-background)' }}>
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopNavbar>
            <NotificationBell />
          </TopNavbar>
          <main className="flex-1 p-6 bg-[hsl(var(--background))]">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}