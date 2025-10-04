import { useEffect } from "react";
import { Link } from "react-router-dom";
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
      <div className="min-h-screen flex flex-col w-full" style={{ background: 'var(--gradient-background)' }}>
        <div className="flex flex-1">
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
        <footer className="bg-gray-100 border-t py-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Conglomerate Realty CRM. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link to="/data-deletion" className="text-sm text-gray-600 hover:text-gray-900">
                Data Deletion
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </SidebarProvider>
  );
}