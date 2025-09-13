import React, { ErrorInfo, ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./services/supabase";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Something went wrong.</h1>
            <p className="mb-4 text-gray-700">An unexpected error has occurred. You can try to fix this by resetting the application state.</p>
            <Button onClick={this.handleReset} className="w-full bg-red-600 hover:bg-red-700">
              Reset Application State
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
        <SessionContextProvider supabaseClient={supabase}>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <RouterProvider router={router} />
                </TooltipProvider>
            </QueryClientProvider>
        </SessionContextProvider>
    </ErrorBoundary>
  );
};

export default App;
