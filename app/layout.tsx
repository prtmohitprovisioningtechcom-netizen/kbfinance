import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import AppChrome from "@/components/layout/AppChrome";
import { getSiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "K B Financial Services | Financial Solutions in Varanasi",
  description: "K B Financial Services provides customer-focused financial assistance and guidance in Varanasi, Uttar Pradesh. Explore financial solutions, loan assistance and enquiry services.",
  keywords: [
    "financial services",
    "loans",
    "Varanasi",
    "financial assistance",
    "K B Financial Services",
    "financial guidance",
    "business loans",
    "personal loans"
  ],
  openGraph: {
    title: "K B Financial Services | Financial Solutions in Varanasi",
    description: "K B Financial Services provides customer-focused financial assistance and guidance in Varanasi, Uttar Pradesh.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://kbfinance.in.net",
    siteName: "K B Financial Services",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] overflow-x-hidden w-full font-sans antialiased">
        <Providers>
          <AppChrome content={content}>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
