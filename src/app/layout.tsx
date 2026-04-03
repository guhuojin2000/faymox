import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faymox - Let's Speed Up the Earth",
  description: "The developer hasn't decided what to build yet, so let's speed up the Earth together. Support the project and watch the Earth spin faster!",
  keywords: ["Faymox", "Earth", "Interactive", "3D", "Creative", "Support"],
  authors: [{ name: "Faymox Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Faymox - Let's Speed Up the Earth",
    description: "The developer hasn't decided what to build yet, so let's speed up the Earth together!",
    url: "https://faymox.com",
    siteName: "Faymox",
    type: "website",
    images: [
      {
        url: "https://faymox.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Faymox - Speed Up the Earth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Faymox - Let's Speed Up the Earth",
    description: "The developer hasn't decided what to build yet, so let's speed up the Earth together!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
