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

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  Completed: "default",
  Active: "secondary",
  Planned: "outline",
};

export default function ProjectsPage() {
  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-primary py-20 lg:py-28 relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-primary-foreground/5 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-sm font-bold text-primary-foreground/80 tracking-widest uppercase">
            Our Projects
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-bold text-primary-foreground tracking-tighter text-balance">
            Our Portfolio
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/90 max-w-2xl mx-auto text-balance">
            A showcase of our finest work across residential, commercial, and
            industrial construction.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.title}
                className="group border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden hover:-translate-y-1 bg-card"
              >
                <div className="h-56 bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <Badge
                      variant={statusVariants[project.status]}
                      className="text-xs"
                    >
                      {project.status}
                    </Badge>
                    <span className="text-xs text-primary-foreground/90 font-medium tracking-wide">
                      {project.type}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-primary" /> {project.location}
                  </p>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
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
