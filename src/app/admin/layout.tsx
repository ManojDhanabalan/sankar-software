"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AdminNavbar from "@/components/admin/admin-navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (pathname === "/admin/login") return;
      if (!user || !isAdmin) {
        router.push("/admin/login");
      }
    }
  }, [user, isAdmin, loading, pathname, router]);

  // Show login page without admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar />
      <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] relative pb-24 lg:pb-0">
        <main className="flex-1 p-2 sm:p-4 lg:p-8 animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto px-0.5 sm:px-0">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
