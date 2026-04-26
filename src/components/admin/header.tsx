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
  { href: "/admin/site-setup", label: "Site Setup", icon: Building2 },
  { href: "/admin/daily-entry", label: "Daily Entry", icon: CalendarDays },
  { href: "/admin/reports", label: "View Records", icon: FileBarChart },
];

const pageTitle: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/site-setup": "Infrastructure Setup",
  "/admin/daily-entry": "Resource Daily Entry",
  "/admin/reports": "Data Analytics Archive",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const title = pageTitle[pathname] || "Admin Panel";

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border/50">
      <div className="flex items-center justify-between h-18 px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-10 h-10 rounded-xl hover:bg-muted"
              />
            }>
              <Menu className="w-5 h-5 text-muted-foreground" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
              <SheetTitle className="sr-only">Nav</SheetTitle>
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
                    <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
                  </div>
                  <span className="text-sm font-black text-sidebar-foreground uppercase tracking-tight">SS Construction</span>
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
                        isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
            <h1 className="text-sm font-black text-muted-foreground uppercase tracking-[0.15em] leading-none mb-1 hidden sm:block">Overview</h1>
            <p className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-none">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="hidden sm:flex w-10 h-10 rounded-xl border-border hover:bg-muted relative group">
            <Bell className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full border-2 border-background" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl hover:bg-muted transition-all border border-transparent hover:border-border group" />
            }>
                <Avatar className="w-9 h-9 border-2 border-background shadow-sm ring-1 ring-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                    {user?.email?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[13px] font-black text-foreground tracking-tight">{user?.email?.split('@')[0] || "Admin"}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Super Admin</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-xl border-border">
              <div className="px-3 py-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Signed in as</p>
                <p className="text-sm font-bold text-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="my-2 bg-border" />
              <DropdownMenuItem onClick={signOut} className="rounded-xl h-11 px-3 text-destructive focus:text-destructive-foreground focus:bg-destructive font-bold text-sm cursor-pointer">
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
