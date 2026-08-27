import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, DM_Sans } from "next/font/google";
import QueryProvider from "./QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zestbook.org.ng"),
  title: {
    default: "Zest — Booking & Intake Forms for Nigerian Service Businesses",
    template: "%s | Zest",
  },
  description:
    "Free scheduling platform for coaches, tutors, therapists, and consultants in Nigeria. Shareable booking links, custom intake forms, WhatsApp confirmations. Start free.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Zest",
    title: "Zest — Booking & Intake Forms for Nigerian Service Businesses",
    description:
      "Free scheduling platform for coaches, tutors, therapists, and consultants in Nigeria. Shareable booking links, custom intake forms, WhatsApp confirmations.",
    url: "https://zestbook.org.ng",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zest — Booking & Intake Forms for Nigerian Service Businesses",
    description:
      "Free scheduling platform for coaches, tutors, therapists, and consultants in Nigeria.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${dmSans.variable} antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}