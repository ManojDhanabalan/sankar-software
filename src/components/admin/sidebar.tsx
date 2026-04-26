"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  CalendarDays,
  Hammer,
  DollarSign,
  FileBarChart,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/site-setup", label: "Site Setup", icon: Building2 },
  { href: "/admin/reports", label: "View Records", icon: FileBarChart },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex-col z-40">
        {/* Logo Section */}
        <div className="p-8">
          <Link href="/admin" className="flex flex-col gap-4">
            <div className="w-16 h-16 relative overflow-hidden rounded-2xl shadow-xl shadow-maroon-900/40 ring-1 ring-white/10 group bg-white p-1">
              <img 
                src="/logo.jpg" 
                alt="SS Construction Logo" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-white tracking-tight uppercase">
                SS Construction
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Control Panel
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
          <div className="text-[10px] font-black text-sidebar-foreground/50 uppercase tracking-[0.2em] px-3 mb-4">
            Main Management
          </div>
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50"
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-sidebar-primary-foreground/20" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 mt-auto">
          <div className="bg-sidebar-accent/50 rounded-2xl p-4 border border-sidebar-border">
             <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors uppercase tracking-wider"
            >
              <div className="w-6 h-6 rounded-lg bg-sidebar-accent flex items-center justify-center">
                <X className="w-3 h-3 text-sidebar-foreground/80" />
              </div>
              Exit Admin
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
