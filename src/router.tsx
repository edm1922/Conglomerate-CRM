
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";

import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { isAdminUser } from "@/services/auth";
import Leads from "./pages/Leads";
import Inventory from "./pages/Inventory";
import Clients from "./pages/Clients";
import Payments from "./pages/Payments";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AppointmentTemplates from "./pages/appointment-templates";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useSessionContext();
  const user = useUser();
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useSessionContext();
  const user = useUser();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser(user.email || "")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Layout>
          <Admin />
        </Layout>
      </AdminRoute>
    ),
  },
  {
    path: "/leads",
    element: (
      <ProtectedRoute>
        <Layout>
          <Leads />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory",
    element: (
      <ProtectedRoute>
        <Layout>
          <Inventory />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/clients",
    element: (
      <ProtectedRoute>
        <Layout>
          <Clients />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/payments",
    element: (
      <ProtectedRoute>
        <Layout>
          <Payments />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/calendar",
    element: (
      <ProtectedRoute>
        <Layout>
          <Calendar />
        </Layout>
      </ProtectedRoute>
    ),
  },
   {
    path: "/appointment-templates",
    element: (
      <ProtectedRoute>
        <Layout>
          <AppointmentTemplates />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <Layout>
          <Reports />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
