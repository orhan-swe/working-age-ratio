import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://working-age-ratio.vercel.app'),
  title: "Global Working-Age to Elderly Ratio (1950-2100) | Demographic Data",
  description: "Compare demographic support ratios across 100+ countries. Interactive charts showing working-age population (15-64) per elderly person (65+) from 1950-2100. UN World Population Prospects 2024 data.",
  keywords: ["demographic data", "population aging", "support ratio", "dependency ratio", "elderly population", "working age population", "UN population prospects"],
  authors: [{ name: "Working Age Ratio" }],
  openGraph: {
    title: "Global Working-Age to Elderly Ratio",
    description: "Compare demographic support ratios across 100+ countries from 1950-2100",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Working-Age to Elderly Ratio",
    description: "Compare demographic support ratios across 100+ countries from 1950-2100",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
