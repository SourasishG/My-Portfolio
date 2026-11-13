import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { CanvasPortal } from "@/components/canvas/CanvasPortal";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { PersistentFrame } from "@/components/layout/PersistentFrame";
import { Preloader } from "@/components/layout/Preloader";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { SITE_IDENTITY, SOCIAL_LINKS } from "@/content/links";
import "@/styles/globals.scss";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(rawSiteUrl),
  title: {
    default: "Sourasish Ghosh — Full-Stack Developer | SIGNAL",
    template: "%s | Sourasish Ghosh — SIGNAL",
  },
  description:
    "Personal portfolio of Sourasish Ghosh, Full-Stack Developer and B.Tech Computer Science & Engineering undergraduate in Kolkata, India. Featuring MUZO, Office Aid, AWS DevOps training, and interactive WebGL experiences.",
  authors: [{ name: SITE_IDENTITY.fullName }],
  creator: SITE_IDENTITY.fullName,
  keywords: [
    "Sourasish Ghosh",
    "Full-Stack Developer",
    "Kolkata",
    "React",
    "Node.js",
    "Express",
    "PostgreSQL",
    "MongoDB",
    "MUZO",
    "Office Aid",
    "Portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SIGNAL — Sourasish Ghosh",
    title: "Sourasish Ghosh — Full-Stack Developer",
    description:
      "I design, develop, and build digital experiences. Explore MUZO, Office Aid, full-stack architecture, and WebGL craft.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sourasish Ghosh — Full-Stack Developer",
    description:
      "I design, develop, and build digital experiences. Portfolio of Sourasish Ghosh (Kolkata, India).",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_IDENTITY.fullName,
  jobTitle: SITE_IDENTITY.title,
  email: `mailto:${SITE_IDENTITY.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Sister Nivedita University",
  },
  sameAs: SOCIAL_LINKS.map((link) => link.href),
  knowsAbout: [
    "JavaScript",
    "Python",
    "React.js",
    "Node.js",
    "Express.js",
    "REST APIs",
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "AWS EC2",
    "AWS S3",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <SmoothScrollProvider>
          <PersistentFrame />
          <CanvasPortal />
          <Preloader />
          <Navigation />
          {children}
          <Footer />
          <CustomCursor />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
