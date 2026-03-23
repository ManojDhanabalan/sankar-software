"use client";

import Link from "next/link";
import {
  Building2,
  HardHat,
  ShieldCheck,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Building2,
    title: "Residential Construction",
    desc: "Custom homes built with precision and care, from foundation to finishing touches.",
  },
  {
    icon: HardHat,
    title: "Commercial Construction",
    desc: "Modern commercial spaces designed for efficiency and professional aesthetics.",
  },
  {
    icon: TrendingUp,
    title: "Renovation",
    desc: "Transform your existing space with our expert renovation and remodeling services.",
  },
  {
    icon: ShieldCheck,
    title: "Structural Work",
    desc: "Robust structural engineering ensuring safety and longevity of every structure.",
  },
  {
    icon: Users,
    title: "Labour Contract",
    desc: "Skilled workforce management with experienced masons, helpers, and specialists.",
  },
  {
    icon: Clock,
    title: "Material Supply",
    desc: "Quality construction materials sourced from trusted suppliers at competitive rates.",
  },
];

const stats = [
  { value: "150+", label: "Projects Completed" },
  { value: "50+", label: "Active Sites" },
  { value: "500+", label: "Workers Employed" },
  { value: "12+", label: "Years Experience" },
];

const projects = [
  {
    title: "Sunrise Apartments",
    location: "Chennai",
    status: "Completed",
    type: "Residential",
  },
  {
    title: "Tech Park Phase II",
    location: "Coimbatore",
    status: "Active",
    type: "Commercial",
  },
  {
    title: "Green Valley Villas",
    location: "Madurai",
    status: "Active",
    type: "Residential",
  },
];

const whyChooseUs = [
  "Experienced team with 12+ years in construction",
  "On-time project delivery guarantee",
  "Quality materials from certified suppliers",
  "Transparent pricing with detailed estimates",
  "Modern construction technology & methods",
  "Dedicated site supervisors for each project",
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU2IDAgMyAxLjM0NCAzIDN2MjRjMCAxLjY1Ni0xLjM0NCAzLTMgM0gxMmMtMS42NTYgMC0zLTEuMzQ0LTMtM1YyMWMwLTEuNjU2IDEuMzQ0LTMgMy0zaDI0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm mb-6">
              <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
              Trusted Construction Partner Since 2012
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Building Strong
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Foundations for
              </span>
              the Future
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
              SS Construction delivers world‑class residential and commercial
              construction services with unmatched quality, precision, and
              commitment to excellence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 rounded-2xl h-12 px-8 text-base"
                >
                  Get a Free Quote
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white rounded-2xl h-12 px-8 text-base"
                >
                  View Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative bg-white/5 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 lg:py-28 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
                About Us
              </span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Building Excellence Since 2012
              </h2>
              <p className="mt-6 text-slate-600 leading-relaxed">
                SS Construction is a premier construction company with over a
                decade of experience in building residential and commercial
                structures. Our commitment to quality, safety, and customer
                satisfaction has made us one of the most trusted names in the
                construction industry.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                We bring together a team of experienced engineers, architects,
                and skilled workers who work collaboratively to deliver projects
                on time and within budget, exceeding expectations at every step.
              </p>
              <Link href="/about">
                <Button
                  variant="link"
                  className="mt-4 text-blue-600 hover:text-blue-700 p-0 font-semibold"
                >
                  Learn more about us <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-3xl p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      150+
                    </div>
                    <div className="text-sm text-slate-500">
                      Projects Delivered
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      500+
                    </div>
                    <div className="text-sm text-slate-500">
                      Skilled Workers
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      99%
                    </div>
                    <div className="text-sm text-slate-500">
                      On-Time Delivery
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      4.9
                    </div>
                    <div className="text-sm text-slate-500">
                      Client Rating
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-28 bg-slate-50" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
              Our Services
            </span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Comprehensive Construction Solutions
            </h2>
            <p className="mt-4 text-slate-600">
              From foundation to finishing, we offer a full range of
              construction services tailored to your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.title}
                className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                    <service.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 lg:py-28 bg-white" id="projects">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
              Our Projects
            </span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Featured Work
            </h2>
            <p className="mt-4 text-slate-600">
              Showcasing our portfolio of successfully delivered construction
              projects.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.title}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        project.status === "Completed"
                          ? "bg-green-500/90 text-white"
                          : "bg-blue-500/90 text-white"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {project.type}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {project.location}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/projects">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-300 hover:bg-slate-50"
              >
                View All Projects <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-blue-200 tracking-wider uppercase">
                Why Choose Us
              </span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Your Trusted Construction Partner
              </h2>
              <p className="mt-4 text-blue-100 leading-relaxed">
                We combine years of experience with modern technology to deliver
                construction projects that exceed expectations.
              </p>
            </div>
            <div className="space-y-4">
              {whyChooseUs.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-300 mt-0.5 shrink-0" />
                  <span className="text-white text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 lg:py-28 bg-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Ready to Build Your Dream?
            </h2>
            <p className="mt-4 text-slate-300 max-w-xl mx-auto">
              Contact us today for a free consultation and estimate. Let&apos;s
              turn your vision into reality.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl shadow-blue-600/25 rounded-2xl h-12 px-8"
                >
                  Contact Us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="tel:+919876543210">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-2xl h-12 px-8"
                >
                  <Phone className="mr-2 w-4 h-4" /> Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
