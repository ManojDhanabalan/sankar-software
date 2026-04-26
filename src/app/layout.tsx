import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ssconstructionerode.in"),
  title: {
    default: "SS Construction | Best Construction Company in Erode",
    template: "%s | SS Construction",
  },
  description:
    "SS Construction is a trusted construction company in Erode offering residential buildings, commercial construction, structural design, plumbing, electrical systems, and site management. Quality work with 4+ years of experience.",
  keywords: [
    "SS Construction",
    "construction company Erode",
    "building contractors Erode",
    "residential construction Erode",
    "commercial construction Tamil Nadu",
    "structural design Erode",
    "plumbing installation Erode",
    "electrical systems construction",
    "site management Erode",
    "best construction company Erode",
    "Kollampalayam construction",
    "Sankar construction",
  ],
  authors: [{ name: "SS Construction", url: "https://www.ssconstruction.in" }],
  creator: "SS Construction",
  publisher: "SS Construction",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.ssconstructionerode.in",
    siteName: "SS Construction",
    title: "SS Construction | Best Construction Company in Erode",
    description:
      "Trusted construction company in Erode with 4+ years of experience. Specializing in residential, commercial buildings, plumbing, electrical, and structural work.",
    images: [
      {
        url: "https://www.ssconstructionerode.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SS Construction - Building Excellence in Erode",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SS Construction | Best Construction Company in Erode",
    description:
      "Trusted construction company in Erode with 4+ years of experience in residential, commercial, and structural construction.",
    images: ["https://www.ssconstructionerode.in/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
    shortcut: "/favicon.jpg",
  },
  category: "construction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${geistMono.variable} antialiased font-sans flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
