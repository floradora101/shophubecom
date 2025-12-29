// Root layout defining shared metadata and structure.
import type { Metadata } from "next";
import { Geist_Mono, DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

// Tech-focused font stack - clean, modern, professional

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// DM Sans - modern display font for tech stores
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Inter - primary body font for optimal readability
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Optimize loading
});

export const metadata: Metadata = {
  title: "ShopHub - E-Commerce Platform",
  description: "ShopHub - Your trusted online shopping destination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="[scrollbar-gutter:stable]">
      <body
        className={`${geistMono.variable} ${dmSans.variable} ${inter.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
