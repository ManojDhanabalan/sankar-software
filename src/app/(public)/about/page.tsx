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
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold text-blue-400 tracking-wider uppercase">
            About SS Construction
          </span>
          <h1 className="mt-3 text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Our Story, Your Future
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            Over a decade of building excellence, trust, and lasting
            relationships with our valued clients.
          </p>
        </div>
      </section>

      {/* Company Details */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Who We Are
              </h2>
              <p className="mt-6 text-slate-600 leading-relaxed">
                SS Construction was founded with a simple mission: to build
                structures that stand the test of time. Starting as a small team
                of dedicated builders, we have grown into a full‑service
                construction company serving clients across Tamil Nadu.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Our expertise spans residential homes, commercial complexes,
                industrial structures, and renovation projects. We take pride in
                our attention to detail, adherence to safety standards, and
                commitment to delivering projects on time and within budget.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                With a workforce of over 500 skilled professionals including
                masons, engineers, architects, and project managers, we have the
                capacity to handle projects of any scale.
              </p>
            </div>

            <div className="space-y-6">
              {/* Mission */}
              <Card className="border-0 shadow-sm rounded-2xl bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To deliver exceptional construction services that exceed
                    client expectations while maintaining the highest standards
                    of safety, quality, and environmental responsibility.
                  </p>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card className="border-0 shadow-sm rounded-2xl bg-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Our Vision
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To be the most trusted and innovative construction company
                    in South India, setting new benchmarks for quality and
                    customer satisfaction in the industry.
                  </p>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="border-0 shadow-sm rounded-2xl bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Our Experience
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
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
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
              Our Values
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
              What Drives Us
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card
                key={v.title}
                className="border-0 shadow-sm rounded-2xl bg-white text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-600">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
