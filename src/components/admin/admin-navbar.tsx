"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileBarChart, Building2, LogOut, ChevronDown, UserCircle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/admin/reports", label: "VIEW RECORDS", icon: FileBarChart },
  { href: "/admin/weekly-pay", label: "WEEKLY PAY", icon: CalendarDays },
  { href: "/admin/site-setup", label: "MANAGE SITES", icon: Building2 },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Desktop Top Navbar - Sticky */}
      <header className="hidden lg:flex sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between mx-auto px-4 sm:px-6">
          {/* Logo & Section */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center p-1.5 border border-primary/20">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
               </div>
               <span className="text-[11px] font-black uppercase tracking-widest text-blue-950">SS CONSTRUCTION</span>
            </div>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-5 text-[10px] font-black uppercase tracking-widest transition-all",
                      isActive 
                        ? "text-primary" 
                        : "text-blue-950/40 hover:text-blue-950"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Profile Section */}
          <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-sm border border-border/40 bg-muted/5 hover:bg-muted/10 transition-all group cursor-pointer outline-none"
                  >
                    <div className="h-7 w-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-[9px] font-black tracking-tight text-primary">ADM</span>
                    </div>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                      <span className="text-[10px] font-black text-blue-950 uppercase">PROFILE</span>
                      <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">SETTINGS</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-blue-950/20 group-hover:text-primary transition-colors ml-1" />
                  </div>
                }
              />
              <DropdownMenuContent className="w-64 rounded-sm border-border p-2 bg-popover shadow-2xl mt-1" align="end">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">SECURITY SESSION</p>
                    <p className="text-[11px] font-black leading-none text-blue-950 truncate uppercase">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-1 my-2 bg-border/40" />
                <DropdownMenuItem onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest py-3 text-destructive cursor-pointer hover:bg-destructive/5 transition-colors flex items-center gap-2 px-3 rounded-sm">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden w-full border-b border-border/40 bg-background py-3 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center p-2 border border-primary/20 shadow-inner">
             <img src="/logo.png" alt="SS" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-blue-950">SS CONSTRUCTION</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <div
                role="button"
                tabIndex={0}
                className="relative h-9 w-9 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center p-0 cursor-pointer active:scale-95 transition-all outline-none"
              >
                <span className="text-[10px] font-black tracking-tighter text-primary">ADM</span>
              </div>
            }
          />
          <DropdownMenuContent className="w-64 rounded-sm border-border p-2 bg-popover shadow-2xl mt-2 mr-2" align="end">
            <DropdownMenuLabel className="font-normal p-3">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">ADMINISTRATOR</p>
              <p className="text-[11px] font-black text-blue-950 truncate uppercase">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-1 my-2 bg-border/40" />
            <DropdownMenuItem onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest py-3 text-destructive cursor-pointer flex items-center gap-2 px-3 rounded-sm">
              <LogOut className="h-3.5 w-3.5" />
              <span>TERMINATE SESSION</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Bottom Navigation - FIXED */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background shadow-[0_-8px_30px_rgb(0,0,0,0.06)] px-2">
        <nav className="flex items-center justify-around h-16 pb-safe max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 transition-all h-full justify-center border-t-2 min-w-24",
                  isActive ? "text-primary border-primary" : "text-blue-950/40 border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-[9px] font-black uppercase tracking-[0.1em]")}>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
