import {
  Building2,
  HardHat,
  Wrench,
  Layers,
  Users,
  Package,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const services = [
  {
    icon: Building2,
    title: "Residential Construction",
    desc: "From custom homes to apartment complexes, we build living spaces that combine comfort, style, and durability. Our residential projects feature modern designs and premium materials.",
    features: [
      "Custom home design",
      "Floor plan optimization",
      "Interior finishing",
      "Landscaping",
    ],
  },
  {
    icon: HardHat,
    title: "Commercial Construction",
    desc: "We create commercial spaces that drive business success. From office buildings to retail centers, our commercial construction services deliver functional and striking environments.",
    features: [
      "Office buildings",
      "Retail spaces",
      "Warehouse & Industrial",
      "Parking structures",
    ],
  },
  {
    icon: Wrench,
    title: "Renovation",
    desc: "Breathe new life into existing structures with our renovation and remodeling services. We transform outdated spaces into modern, functional environments.",
    features: [
      "Full home remodel",
      "Kitchen & bathroom",
      "Structural upgrades",
      "Modern additions",
    ],
  },
  {
    icon: Layers,
    title: "Structural Work",
    desc: "Our structural engineering team ensures every building is safe, stable, and built to last. We handle foundations, framing, and all structural components.",
    features: [
      "Foundation work",
      "Steel & RCC structures",
      "Load-bearing walls",
      "Structural assessment",
    ],
  },
  {
    icon: Users,
    title: "Labour Contract",
    desc: "Access our pool of skilled workers for your projects. Our labour contracting services provide trained masons, helpers, bar benders, and other construction specialists.",
    features: [
      "Skilled masons",
      "Centering specialists",
      "Bar benders",
      "General helpers",
    ],
  },
  {
    icon: Package,
    title: "Material Supply",
    desc: "We source and supply high‑quality construction materials from certified suppliers. Get the best materials at competitive prices with reliable delivery.",
    features: [
      "Cement & steel",
      "Aggregates & sand",
      "Hardware & fitting",
      "Quality certified",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold text-blue-400 tracking-wider uppercase">
            Our Services
          </span>
          <h1 className="mt-3 text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Comprehensive Construction Solutions
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            End‑to‑end construction services tailored to deliver excellence in
            every project we undertake.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {services.map((service, idx) => (
              <Card
                key={service.title}
                className="border-0 shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div
                    className={`grid md:grid-cols-2 ${
                      idx % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="p-8 lg:p-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-5">
                        <service.icon className="w-7 h-7 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {service.desc}
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-2 text-sm text-slate-600"
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center min-h-[260px]">
                      <service.icon className="w-24 h-24 text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-slate-600">
            Get in touch with our team for a free consultation and detailed
            estimate.
          </p>
          <Link href="/contact" className="mt-8 inline-block">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl h-12 px-8"
            >
              Get a Free Quote <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
