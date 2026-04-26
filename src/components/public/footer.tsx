import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white/70 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 relative overflow-hidden rounded-xl bg-white p-0.5">
                <img src="/logo.png" alt="SS Construction Logo" className="w-full h-full object-contain scale-[1.8]" />
              </div>
            </div>
            <p className="text-sm text-white/80 leading-[1.7]">
              Building strong foundations for the future. We deliver excellence
              in every project, from residential to commercial construction.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: "Home", href: "#home" },
                { name: "About", href: "#about" },
                { name: "Services", href: "#services" },
                { name: "Contact", href: "#contact" }
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-white/80 hover:text-[#b7791f] transition-colors font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-6">
              Our Services
            </h3>
            <ul className="space-y-3.5">
              {[
                "Residential Construction",
                "Commercial Construction",
                "Renovation",
                "Structural Work",
                "Labour Contract",
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-white/80 font-medium">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-6">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#b7791f] mt-0.5 shrink-0" />
                <span className="text-sm text-white/80 leading-relaxed">
                  Sadayappa Complex, First Floor, Shop No.3, 19th Road, Kollampalayam Bypass, Erode.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#b7791f] shrink-0" />
                <span className="text-sm text-white/80">+91 94869 87424</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#b7791f] shrink-0" />
                <span className="text-sm text-white/80 break-all">
                  ssconstructionerode01@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/60 font-medium">
            &copy; {new Date().getFullYear()} SS Construction. All rights reserved.
          </p>
          <p className="text-xs text-white/60 font-medium">
            Designed with excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
