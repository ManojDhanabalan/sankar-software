import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projects = [
  { title: "Sunrise Apartments", location: "Chennai", status: "Completed", type: "Residential", desc: "48-unit luxury apartment complex with modern amenities and landscaped gardens." },
  { title: "Tech Park Phase II", location: "Coimbatore", status: "Active", type: "Commercial", desc: "State-of-the-art IT park with sustainable design and smart building systems." },
  { title: "Green Valley Villas", location: "Madurai", status: "Active", type: "Residential", desc: "Premium villa community with 24 individually designed homes." },
  { title: "Metro Mall", location: "Salem", status: "Completed", type: "Commercial", desc: "Multi-level shopping center with 200+ retail spaces and food court." },
  { title: "Heritage Homes", location: "Trichy", status: "Completed", type: "Residential", desc: "Traditional-meets-modern housing project with 36 homes." },
  { title: "Coastal Resort", location: "Pondicherry", status: "Planned", type: "Hospitality", desc: "Eco-friendly beach resort with 80 rooms and conference facilities." },
  { title: "Industrial Complex", location: "Hosur", status: "Active", type: "Industrial", desc: "Large-scale industrial warehouse and office complex." },
  { title: "City Center Renovation", location: "Erode", status: "Completed", type: "Renovation", desc: "Complete renovation of a 30-year-old commercial building." },
  { title: "Garden View Towers", location: "Thanjavur", status: "Planned", type: "Residential", desc: "Twin-tower residential project with 120 premium apartments." },
];

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700 border-green-200",
  Active: "bg-blue-100 text-blue-700 border-blue-200",
  Planned: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function ProjectsPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold text-blue-400 tracking-wider uppercase">
            Our Projects
          </span>
          <h1 className="mt-3 text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Our Portfolio
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            A showcase of our finest work across residential, commercial, and
            industrial construction.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.title}
                className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <Badge
                      variant="outline"
                      className={`${statusColors[project.status]} text-xs`}
                    >
                      {project.status}
                    </Badge>
                    <span className="text-xs text-white/80 font-medium">
                      {project.type}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {project.location}
                  </p>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {project.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
