"use client";

import Link from "next/link";
import {
  Building2,
  HardHat,
  ShieldCheck,
  Layout,
  TrendingUp,
  Construction,
  Layers,
  Droplets,
  Zap,
  Waves,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  ArrowRight,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";

/*
 * ─── DESIGN SYSTEM ─────────────────────────────────────────
 *
 * Headline:     #1a1a2e  (deep charcoal – authoritative, modern)
 * Body:         #4a5568  (warm gray – easy on the eyes)
 * Accent CTA:   #9b2c2c  (refined brick red – strong but not loud)
 * Label/Tag:    #b7791f  (warm gold – construction / premium feel)
 * Dark BG:      #1a1a2e  (matches headline for visual unity)
 * Card Dark BG: #2d2d44  (lighter complement)
 * Light BG:     #fafaf8  (warm off-white, not yellow, not stark white)
 * Border:       #e8e4de  (warm neutral border)
 *
 * Font hierarchy:
 *   Hero h1:    5.5rem / 700 / tracking-tight / leading-[1.08]
 *   Section h2: 2.75rem / 700 / tracking-tight
 *   Card h3:    1.375rem / 700
 *   Card h4:    1.125rem / 700
 *   Body:       1rem–1.125rem / 400–500 / leading-relaxed
 *   Label:      0.75rem / 600 / tracking-[0.15em] / uppercase
 * ────────────────────────────────────────────────────────────
 */

const services = [
  {
    icon: Building2,
    title: "Residential Construction",
    desc: "Custom homes built with precision and care, from foundation to finishing touches.",
    img: "/service_1.png",
  },
  {
    icon: HardHat,
    title: "Commercial Construction",
    desc: "Modern commercial spaces designed for efficiency and professional aesthetics.",
    img: "/service_2.png",
  },
  {
    icon: Layout,
    title: "Apartments & Complexes",
    desc: "Quality apartment complexes designed for modern living and community comfort.",
    img: "/service_3.png",
  },
  {
    icon: TrendingUp,
    title: "Renovation & Remodeling",
    desc: "Transform your existing space with our expert renovation and remodeling services.",
    img: "/service_4.png",
  },
  {
    icon: Construction,
    title: "Interior Design",
    desc: "Creative interior solutions that blend functionality with aesthetic excellence.",
    img: "/service_5.png",
  },
  {
    icon: ShieldCheck,
    title: "Structural Engineering",
    desc: "Robust structural engineering ensuring safety and longevity of every structure.",
    img: "/service_6.png",
  },
];

const constructionPhases = [
  {
    phase: "Phase 1: Pre-Planning",
    subtitle: "Before Construction (Planning Stages)",
    items: ["Plan (Layout)", "Structural Design", "Elevation Design", "Electrical & Plumbing Planning", "Interior Design"],
    img: "/phase_1.png",
  },
  {
    phase: "Phase 2: Site Testing",
    subtitle: "Testing Before Construction",
    items: ["Soil Test", "Water Test", "Sieve Test", "Raw Material Test (Crushing Test)", "Chemical Test"],
    img: "/phase_2.png",
  },
  {
    phase: "Phase 3: Electrical Systems",
    subtitle: "Advanced Wiring & Connections",
    items: ["EB Line Connection", "Cable Line Setup", "CCTV Wiring", "Pump Motor Connection"],
    img: "/phase_3.png",
  },
  {
    phase: "Phase 4: Plumbing System",
    subtitle: "Water Management Integration",
    items: ["Inlet System Layout", "Outlet System Layout", "Solar Water Heater Setup"],
    img: "/phase_4.png",
  },
  {
    phase: "Phase 5: Construction Core",
    subtitle: "Civil Construction Activities",
    items: ["Material Mixing", "Concrete Curing", "Admixture Usage", "Waterproof Coating", "Pest Control"],
    img: "/phase_5.png",
  },
];

const constructionMethods = [
  {
    id: "01",
    title: "Professional Mix Concrete",
    desc: "We strictly utilize Machine Mix and precise Site Mix Concrete techniques to guarantee maximum compressive strength and longevity.",
    icon: Construction,
  },
  {
    id: "02",
    title: "Footing & Pavement",
    desc: "Rigorous control for footing and precise structural alignment checking before every concrete pour to ensure stability.",
    icon: Layers,
  },
  {
    id: "03",
    title: "Premium Finishing",
    desc: "Tile laying with specialized temporary spacing and proper leveling tools to ensure a flawless and beautiful aesthetic result.",
    icon: Layout,
  },
  {
    id: "04",
    title: "Advanced Waterproofing",
    desc: "Comprehensive waterproofing solutions tailored for toilet areas, overhead tanks, and exterior panel joints.",
    icon: Droplets,
  },
  {
    id: "05",
    title: "Structural Reinforcement",
    desc: "Expert steel reinforcement binding with strictly adhered placement codes for all beams, columns, and slabs.",
    icon: Zap,
  },
  {
    id: "06",
    title: "Dedicated Curing",
    desc: "Adhering to mandatory curing periods for optimal strength development through consistent water curing methods.",
    icon: Waves,
  },
];


export default function LandingPage() {
  return (
    <div 
      className="overflow-hidden font-sans text-[#4a5568] bg-[#c59261] bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/design.png')" }}
    >
      
      {/* ═══════════════════════════════════════════════════
          1. HERO SECTION
          Clean, centered layout inspired by modern SaaS sites
       ═══════════════════════════════════════════════════ */}
      <section id="home" className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 overflow-hidden  ">
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          
          {/* Hero headline — elegant serif-weight, deep charcoal */}
          <h1 className="text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[5rem] font-bold text-[#1a1a2e] tracking-[-0.02em] leading-[1.08] mb-6 max-w-4xl">
            Building the future,
            <br className="hidden sm:block" />
            <span className="text-[#9b2c2c]">one foundation</span> at a time.
          </h1>

          <p className="text-base sm:text-lg text-[#6b7280] font-normal max-w-lg mx-auto mb-14 leading-[1.7]">
            Premium residential & commercial construction in Tamil Nadu — where architectural vision meets uncompromising structural integrity.
          </p>

          {/* Overlapping Fan of Images */}
          <div className="relative w-full max-w-4xl mx-auto h-[220px] sm:h-[320px] mb-14 flex justify-center items-center">
            
            {/* Floating Tags */}
            <div className="absolute top-2 left-[8%] sm:left-[14%] bg-[#1a1a2e] text-white px-4 py-2 rounded-full font-medium text-xs sm:text-sm -rotate-12 z-40 shadow-md hidden sm:block tracking-wide">
              #architecture
            </div>
            <div className="absolute top-0 right-[8%] sm:right-[14%] bg-[#b7791f] text-white px-4 py-2 rounded-full font-medium text-xs sm:text-sm rotate-[10deg] z-40 shadow-md hidden sm:block tracking-wide">
              #premium
            </div>

            {/* Far Left */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-[200%] sm:-translate-x-[230%] -rotate-[15deg] w-[110px] sm:w-[200px] aspect-[4/5] rounded-2xl overflow-hidden shadow-lg z-10 transition-transform duration-500 hover:-translate-y-8 hover:z-50 hover:rotate-0 border border-white/60">
              <img src="/hero_carousel_1.png" className="w-full h-full object-cover" alt="Construction site" />
            </div>
            {/* Mid Left */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-[120%] sm:-translate-x-[130%] -rotate-[8deg] w-[120px] sm:w-[220px] aspect-[4/5] rounded-2xl overflow-hidden shadow-xl z-20 transition-transform duration-500 hover:-translate-y-8 hover:z-50 hover:rotate-0 border border-white/60">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Luxury villa" />
            </div>
            {/* Center — largest, deepest shadow */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[140px] sm:w-[260px] aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(26,26,46,0.18)] z-30 transition-transform duration-500 hover:-translate-y-8 hover:scale-[1.03] border-2 border-white">
              <img src="/hero_carousel_2.png" className="w-full h-full object-cover" alt="Architect reviewing plans" />
            </div>
            {/* Mid Right */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[20%] sm:translate-x-[30%] rotate-[8deg] w-[120px] sm:w-[220px] aspect-[4/5] rounded-2xl overflow-hidden shadow-xl z-20 transition-transform duration-500 hover:-translate-y-8 hover:z-50 hover:rotate-0 border border-white/60">
              <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Modern apartments" />
            </div>
            {/* Far Right */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[100%] sm:translate-x-[130%] rotate-[15deg] w-[110px] sm:w-[200px] aspect-[4/5] rounded-2xl overflow-hidden shadow-lg z-10 transition-transform duration-500 hover:-translate-y-8 hover:z-50 hover:rotate-0 border border-white/60">
              <img src="/hero_carousel_3.png" className="w-full h-full object-cover" alt="Modern building" />
            </div>
          </div>



        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. ABOUT SECTION
       ═══════════════════════════════════════════════════ */}
      <section id="about" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-5">
                <img src="/about_sitework.png" alt="Site Work" className="rounded-2xl object-cover h-64 w-full shadow-md" />
                <img src="/about_planning.png" alt="Planning" className="rounded-2xl object-cover h-64 w-full shadow-md mt-12" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a2e] p-8 rounded-full shadow-2xl border-[6px] border-white flex flex-col items-center justify-center w-44 h-44">
                <span className="text-5xl font-extrabold text-[#b7791f]">4+</span>
                <span className="text-xs font-semibold text-white/80 uppercase tracking-[0.15em] mt-1 text-center">Years Exp.</span>
              </div>
            </div>
            
            <div>
              <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#b7791f] mb-4">
                About SS Construction
              </span>
              <h2 className="text-3xl lg:text-[2.75rem] font-bold text-[#1a1a2e] leading-[1.15] mb-6">
                A Legacy of Structural
                <br /> Excellence & Trust.
              </h2>
              <p className="text-base text-[#6b7280] leading-[1.75] mb-8">
                Founded by <strong className="text-[#1a1a2e] font-semibold">Sankar</strong>, SS Construction has grown rapidly over the last 4 years by strictly adhering to core engineering principles and ethical construction practices. We don&apos;t just build structures; we shape the environments that inspire and elevate lives.
              </p>
              
              <div className="space-y-3.5">
                {[
                  "100% Client Satisfaction Guarantee",
                  "Expert Team of Engineers & Architects",
                  "Premium Material Sourcing",
                  "On-Time Project Delivery"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#b7791f] shrink-0" />
                    <span className="text-[#1a1a2e] font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. SERVICES SECTION
       ═══════════════════════════════════════════════════ */}
      <section id="services" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#b7791f] mb-3">What we offer</span>
            <h2 className="text-3xl lg:text-[2.75rem] font-bold text-[#1a1a2e] tracking-tight">
              Comprehensive Services
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-[2rem] p-4 flex flex-col hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-xl border border-[#e8e4de]"
              >
                {/* Rounded Image Inside */}
                <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-6">
                  <img 
                    src={service.img} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#1a1a2e]/0 group-hover:bg-[#1a1a2e]/5 transition-colors duration-500" />
                </div>

                {/* Content Below */}
                <div className="flex flex-col px-3 pb-4">
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-3 tracking-tight group-hover:text-[#b7791f] transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-[#6b7280] text-[15px] leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════
          5. WORKFLOW SECTION (dark)
       ═══════════════════════════════════════════════════ */}
      <section id="workflow" className="py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#b7791f] mb-3">Process</span>
            <h2 className="text-3xl lg:text-[2.75rem] font-bold text-[#1a1a2e] tracking-tight">
              Our 5-Phase Workflow
            </h2>
            <p className="mt-5 text-base text-[#6b7280] leading-[1.7] max-w-2xl mx-auto">
              A methodical, transparent, and rigorous approach ensures every project is delivered on time with zero quality compromise.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {constructionPhases.map((phase, i) => (
              <div key={i} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-[#e8e4de] flex flex-col sm:flex-row transition-all duration-500 hover:-translate-y-1.5">
                {/* Left Image */}
                <div className="w-full sm:w-[45%] relative min-h-[220px] sm:min-h-full overflow-hidden">
                  <img 
                    src={phase.img} 
                    alt={phase.phase} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#1a1a2e]/5 group-hover:bg-transparent transition-colors duration-500" />
                  
                  {/* Phase Number Badge */}
                  <div className="absolute top-5 left-5 bg-[#1a1a2e]/90 backdrop-blur-sm border border-white/10 text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-lg">
                    0{i + 1}
                  </div>
                </div>

                {/* Right Content */}
                <div className="w-full sm:w-[55%] p-7 sm:p-8 flex flex-col justify-center">
                  <h3 className="font-bold text-2xl text-[#1a1a2e] tracking-tight leading-tight group-hover:text-[#b7791f] transition-colors">{phase.phase}</h3>
                  <p className="text-[0.65rem] font-bold text-[#b7791f] uppercase tracking-[0.15em] mt-2 mb-6">{phase.subtitle}</p>
                  
                  <ul className="space-y-3.5">
                    {phase.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[#4a5568]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#b7791f] mt-1.5 shrink-0" />
                        <span className="font-medium leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. CONSTRUCTION METHODS SECTION
       ═══════════════════════════════════════════════════ */}
      <section id="methods" className="relative py-16 lg:py-20 overflow-hidden">
        {/* Abstract Architectural Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/methods_bg.png" 
            alt="Advanced Construction Methods" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-1 relative lg:sticky lg:top-28 self-start z-20 bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border border-white/50">
              <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#b7791f] mb-3">Methodology</span>
              <h2 className="text-3xl lg:text-[2.75rem] font-bold text-[#1a1a2e] leading-[1.15]">
                Advanced Construction Methods.
              </h2>
              <p className="mt-5 text-base text-[#6b7280] leading-[1.7]">
                We employ modern techniques and standardized processes that guarantee structural safety, durability, and a premium finish that lasts generations.
              </p>
            </div>
            
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
              {constructionMethods.map((method) => (
                <div key={method.id} className="bg-[#fcfbfe] p-7 rounded-2xl border border-[#e8e4de] shadow-sm hover:shadow-lg hover:border-[#b7791f]/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-[#1a1a2e] rounded-xl flex items-center justify-center">
                      <method.icon className="w-6 h-6 text-[#b7791f]" />
                    </div>
                    <span className="text-4xl font-black text-[#f0ede8]">{method.id}</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#1a1a2e] mb-2 tracking-tight">{method.title}</h4>
                  <p className="text-[#6b7280] leading-[1.7] text-sm">
                    {method.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          7. CONTACT SECTION
       ═══════════════════════════════════════════════════ */}
      <section id="contact" className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-[4rem] font-bold text-[#1a1a2e] tracking-tight mb-5 uppercase">
            Get In Touch
          </h2>
          <p className="text-base text-[#6b7280] max-w-3xl mx-auto mb-16 leading-[1.7]">
            Reach out to us directly through any of the channels below. We are ready to answer your questions and start planning your next construction journey.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 text-left">
            {[
              { icon: Mail, label: "Email", value: "ssconstructionerode01@gmail.com" },
              { icon: MapPin, label: "Address", value: "Sadayappa Complex, First Floor, Shop No.3, Kollampalayam Bypass, Erode." },
              { icon: Phone, label: "Call", value: "+91 94869 87424" },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#e8e4de] p-6 flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                <div className="w-14 h-14 bg-[#b7791f] flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col pt-0.5 min-w-0 flex-1">
                  <h4 className="font-bold text-[#1a1a2e] text-lg mb-1">{item.label}</h4>
                  <p className="text-[#6b7280] text-[13px] sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
