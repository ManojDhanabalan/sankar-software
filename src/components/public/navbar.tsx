"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-maroon-600/40 transition-all duration-300">
              <img 
                src="/logo.jpg" 
                alt="SS Construction Logo" 
                className="w-full h-full object-contain bg-white"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                SS Construction
              </span>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase">
                Building Excellence
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-maroon-600 rounded-lg hover:bg-maroon-50/80 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" className="ml-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-maroon-600 to-maroon-700 hover:from-maroon-800 hover:to-maroon-900 text-white shadow-lg shadow-maroon-600/20 hover:shadow-maroon-600/40 transition-all duration-300 rounded-xl"
              >
                Admin Login
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-slate-700" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/60 animate-in slide-in-from-top-5">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-maroon-600 rounded-xl hover:bg-maroon-50/80 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setIsOpen(false)}>
              <Button className="w-full mt-2 bg-gradient-to-r from-maroon-600 to-maroon-700 rounded-xl">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
