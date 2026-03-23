"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Bell,
  LogOut,
  Building2,
  LayoutDashboard,
  Users,
  Package,
  CalendarDays,
  Hammer,
  DollarSign,
  FileBarChart,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/sites", label: "Sites", icon: Building2 },
  { href: "/admin/labour", label: "Labour", icon: Users },
  { href: "/admin/materials", label: "Materials", icon: Package },
  { href: "/admin/daily-log", label: "Daily Log", icon: CalendarDays },
  { href: "/admin/work-progress", label: "Work Progress", icon: Hammer },
  { href: "/admin/expenses", label: "Expenses", icon: DollarSign },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const pageTitle: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/sites": "Site Management",
  "/admin/labour": "Labour Management",
  "/admin/materials": "Materials",
  "/admin/daily-log": "Daily Log",
  "/admin/work-progress": "Work Progress",
  "/admin/expenses": "Expenses",
  "/admin/reports": "Reports",
  "/admin/settings": "Settings",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const title = pageTitle[pathname] || "Admin Panel";

  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-2xl border-b border-slate-200/50">
      <div className="flex items-center justify-between h-18 px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-10 h-10 rounded-xl hover:bg-slate-100"
              />
            }>
              <Menu className="w-5 h-5 text-slate-600" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r-0">
              <SheetTitle className="sr-only">Nav</SheetTitle>
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-tight">SS Construction</span>
                </div>
              </div>
              <nav className="px-4 space-y-1.5">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                        isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1 hidden sm:block">Overview</h1>
            <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="hidden sm:flex w-10 h-10 rounded-xl border-slate-200 hover:bg-slate-50 relative group">
            <Bell className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-600 rounded-full border-2 border-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group" />
            }>
                <Avatar className="w-9 h-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-black">
                    {user?.email?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">{user?.email?.split('@')[0] || "Admin"}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Super Admin</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100">
              <div className="px-3 py-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onClick={signOut} className="rounded-xl h-11 px-3 text-red-600 focus:text-white focus:bg-red-600 font-bold text-sm cursor-pointer">
                <LogOut className="w-4.5 h-4.5 mr-2.5" />
                Logout Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
