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
      <section className="bg-primary py-20 lg:py-28 relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-primary-foreground/5 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-sm font-bold text-primary-foreground/80 tracking-widest uppercase">
            Our Services
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-bold text-primary-foreground tracking-tighter text-balance">
            Comprehensive Construction Solutions
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/90 max-w-2xl mx-auto text-balance">
            End‑to‑end construction services tailored to deliver excellence in
            every project we undertake.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {services.map((service, idx) => (
              <Card
                key={service.title}
                className="border border-border shadow-sm rounded-2xl hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden bg-card"
              >
                <CardContent className="p-0">
                  <div
                    className={`grid md:grid-cols-2 ${
                      idx % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="p-8 lg:p-12">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <service.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {service.desc}
                      </p>
                      <ul className="space-y-3">
                        {service.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-3 text-sm text-foreground font-medium"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-muted flex items-center justify-center min-h-[300px]">
                      <service.icon className="w-32 h-32 text-border" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-muted/30 border-t">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight text-balance">
            Ready to Start Your Project?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-balance">
            Get in touch with our team for a free consultation and detailed
            estimate.
          </p>
          <Link href="/contact" className="mt-10 inline-block">
            <Button
              size="lg"
              className="rounded-full h-14 px-8 text-base shadow-lg hover:shadow-xl transition-all"
            >
              Get a Free Quote <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
