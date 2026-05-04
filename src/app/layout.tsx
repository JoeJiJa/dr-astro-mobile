import type { Metadata, Viewport } from "next";
import "./globals.css";

const geistSans = { variable: '--font-geist-sans' };
const geistMono = { variable: '--font-geist-mono' };

export const metadata: Metadata = {
  title: "Dr. Astro | Free Medical Books, Notes & Exam Prep (MBBS/NEET PG)",
  description: "Advanced AI-powered resource for medical students. Access 500+ free medical textbooks, anatomy guides, clinical cases, and NEET PG exam prep materials. Indexing all medical knowledge for MBBS students.",
  keywords: [
    "Dr. Astro", "DrAstro", "Astro Medical", "Free Medical Books PDF", 
    "MBBS Study Material", "NEET PG Prep", "Anatomy AI", 
    "Clinical Cases Medical", "Medical Student Platform", 
    "Medical Study AI", "MBBS Notes Free"
  ],
  authors: [{ name: "Dr. Astro Team" }],
  creator: "Dr. Astro",
  manifest: '/manifest.json',
  metadataBase: new URL('https://dr-astro.pages.dev'),
  alternates: {
    canonical: 'https://dr-astro.pages.dev',
  },
  openGraph: {
    title: "Dr. Astro - Advanced Medical Study AI",
    description: "The ultimate AI-powered platform for medical students. Access vast libraries of Anatomy, Textbooks, and Clinical manuals.",
    url: 'https://dr-astro.pages.dev',
    siteName: 'Dr. Astro',
    images: [
      {
        url: 'https://dr-astro.pages.dev/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Dr. Astro Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dr. Astro - Medical Study AI",
    description: "The ultimate AI-powered platform for medical students.",
    images: ['https://dr-astro.pages.dev/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'd7WAX_X_aXbc37-R5yDKi0_vOT72fN7d5bvPPFB45wo',
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Dr. Astro",
              "url": "https://dr-astro.pages.dev",
              "description": "Advanced medical study aid powered by AI for MBBS students.",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Sora:wght@100..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
