import {
  Building2,
  Target,
  Eye,
  Award,
  Users,
  Clock,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: ShieldCheck,
    title: "Quality First",
    desc: "We never compromise on the quality of materials or workmanship.",
  },
  {
    icon: Clock,
    title: "On‑Time Delivery",
    desc: "We understand the value of time and ensure timely project completion.",
  },
  {
    icon: Users,
    title: "Client Focus",
    desc: "Our clients are at the heart of everything we do. Your satisfaction is our priority.",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    desc: "We leverage modern construction technology to deliver better results.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-primary py-20 lg:py-28 relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-primary-foreground/5 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-sm font-bold text-primary-foreground/80 tracking-widest uppercase">
            About SS Construction
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-bold text-primary-foreground tracking-tighter text-balance">
            Our Story, Your Future
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/90 max-w-2xl mx-auto text-balance">
            Over a decade of building excellence, trust, and lasting
            relationships with our valued clients.
          </p>
        </div>
      </section>

      {/* Company Details */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                Who We Are
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-balance">
                SS Construction was founded with a simple mission: to build
                structures that stand the test of time. Starting as a small team
                of dedicated builders, we have grown into a full‑service
                construction company serving clients across Tamil Nadu.
              </p>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-balance">
                Our expertise spans residential homes, commercial complexes,
                industrial structures, and renovation projects. We take pride in
                our attention to detail, adherence to safety standards, and
                commitment to delivering projects on time and within budget.
              </p>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-balance">
                With a workforce of over 500 skilled professionals including
                masons, engineers, architects, and project managers, we have the
                capacity to handle projects of any scale.
              </p>
            </div>

            <div className="space-y-6">
              {/* Mission */}
              <Card className="border border-border shadow-sm rounded-xl bg-card hover:shadow-md transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To deliver exceptional construction services that exceed
                    client expectations while maintaining the highest standards
                    of safety, quality, and environmental responsibility.
                  </p>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card className="border border-border shadow-sm rounded-xl bg-card hover:shadow-md transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      Our Vision
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the most trusted and innovative construction company
                    in South India, setting new benchmarks for quality and
                    customer satisfaction in the industry.
                  </p>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="border border-border shadow-sm rounded-xl bg-card hover:shadow-md transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border border-border">
                      <Award className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      Our Experience
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    With 12+ years of experience and 150+ successful projects,
                    we bring deep industry knowledge and proven expertise to
                    every construction project we undertake.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-primary tracking-widest uppercase">
              Our Values
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              What Drives Us
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card
                key={v.title}
                className="border border-border shadow-sm rounded-2xl bg-card text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <v.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                    {v.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
