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
  title: "OutfitAI — Virtual try-on",
  description:
    "Preview clothing on your photo with WaveSpeed FLUX.2 before you order.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://cdn.wavespeed.ai"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col text-zinc-900 antialiased dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
