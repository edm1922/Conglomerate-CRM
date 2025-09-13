import { Skeleton } from "@/components/ui/skeleton";
import { Home } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex w-full bg-gradient-subtle">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-border bg-card shadow-sm">
        {/* Header Skeleton */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <div className="p-4">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar Skeleton */}
        <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="w-6 h-6" />
            <div>
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-8" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-20 h-8" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-8" />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Loading Conglomerate Realty CRM
              </h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we prepare your dashboard...
              </p>
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}