import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";
import FloatingActions from "@/components/public/floating-actions";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "SS Construction",
  "description": "SS Construction is a trusted construction company in Erode offering residential buildings, commercial construction, structural design, plumbing, electrical systems, and site management.",
  "url": "https://www.ssconstructionerode.in",
  "telephone": "+91-94869-87424",
  "email": "ssconstructionerode01@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Sadayappa Complex, First Floor, Shop No.3, Kollampalayam Bypass",
    "addressLocality": "Erode",
    "addressRegion": "Tamil Nadu",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "11.3214",
    "longitude": "77.7351"
  },
  "openingHours": "Mo-Sa 09:00-19:00",
  "priceRange": "₹₹",
  "image": "https://www.ssconstructionerode.in/og-image.jpg",
  "sameAs": [],
  "areaServed": {
    "@type": "City",
    "name": "Erode"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Construction Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Residential Construction" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Commercial Construction" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Structural Design" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Plumbing Systems" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Electrical Systems" } }
    ]
  }
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingActions />
    </>
  );
}
