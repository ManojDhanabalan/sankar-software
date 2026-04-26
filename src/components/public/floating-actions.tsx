import React from "react";
import { MessageCircle, PhoneCall, MapPin } from "lucide-react";

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Location Button */}
      <a
        href="https://www.google.com/maps/place//@11.3214479,77.7350351,20.35z/data=!4m6!1m5!3m4!2zMTHCsDE5JzE2LjkiTiA3N8KwNDQnMDYuNSJF!8m2!3d11.321352!4d77.735137!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#1a1a2e] text-white rounded-full shadow-[0_4px_14px_rgba(26,26,46,0.3)] hover:shadow-[0_6px_20px_rgba(26,26,46,0.4)] hover:scale-110 transition-all duration-300"
        title="Location"
      >
        <MapPin className="w-6 h-6" />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
          Location
        </span>
      </a>

      {/* Call Button */}
      <a
        href="tel:+919486987424"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#9b2c2c] text-white rounded-full shadow-[0_4px_14px_rgba(155,44,44,0.3)] hover:shadow-[0_6px_20px_rgba(155,44,44,0.4)] hover:scale-110 transition-all duration-300"
        title="Call Us"
      >
        <PhoneCall className="w-6 h-6" />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
          Call Now
        </span>
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919486987424"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all duration-300"
        title="WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
          WhatsApp
        </span>
      </a>
    </div>
  );
}
