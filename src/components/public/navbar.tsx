"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#workflow", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#fcfbfe]/95 backdrop-blur-xl border-b border-[#e8e4de] py-2 shadow-sm" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative flex items-center justify-center w-36 sm:w-48 h-12 sm:h-14">
              <img 
                src="/logo.png" 
                alt="SS Construction Logo" 
                className="w-full h-full object-contain scale-[1.6] sm:scale-[1.8] mix-blend-multiply"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-[13px] font-medium text-[#6b7280] hover:text-[#1a1a2e] rounded-lg hover:bg-[#1a1a2e]/[0.04] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
            <Link href="/admin" className="ml-4">
              <Button
                size="sm"
                className="bg-[#9b2c2c] hover:bg-[#822727] text-white shadow-md shadow-[#9b2c2c]/15 hover:shadow-[#9b2c2c]/25 transition-all duration-300 rounded-lg font-semibold border-0 text-[13px] h-9 px-5"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Center Sign In */}
          <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
            <Link href="/admin">
              <Button
                size="sm"
                className="bg-[#9b2c2c] hover:bg-[#822727] text-white shadow-md shadow-[#9b2c2c]/20 transition-all duration-300 rounded-lg font-semibold border-0 text-[11px] h-7 px-4"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-[#1a1a2e] hover:bg-[#1a1a2e]/5 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#fcfbfe]/98 backdrop-blur-2xl border-t border-[#e8e4de]">
          <div className="px-6 py-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-base font-medium text-[#6b7280] hover:text-[#1a1a2e] rounded-xl hover:bg-[#1a1a2e]/[0.04] transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
