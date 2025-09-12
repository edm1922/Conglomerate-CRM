import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import Leads from "./pages/Leads";
import Inventory from "./pages/Inventory";
import Clients from "./pages/Clients";
import Payments from "./pages/Payments";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { getSession, onAuthStateChange } from "@/services/auth";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  
  // Sync store changes to localStorage
  useLocalStorageSync();

  useEffect(() => {
    getSession().then((session) => {
      setIsAuthed(!!session);
      setLoading(false);
    });
    const sub = onAuthStateChange((session) => setIsAuthed(!!session));
    return () => {
      sub.unsubscribe?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {loading ? null : isAuthed ? (
            <Layout>
              <Routes>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
