import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/app/providers";
import { AppShell } from "@/components/layout/app-shell";

import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://giveth.io"),
  title: {
    default: "Giveth QF",
    template: "%s | Giveth QF",
  },
  description:
    "The next generation Giveth Quadratic Funding app built with Next.js 16, Radix UI, React Query, and Thirdweb.",
  openGraph: {
    title: "Giveth QF",
    description:
      "Donate to community-led impact projects via Quadratic Funding rounds.",
    url: "https://giveth.io",
    siteName: "Giveth",
    images: [
      {
        url: "https://giveth.io/assets/social/share.png",
        width: 1200,
        height: 630,
        alt: "Giveth Quadratic Funding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@giveth",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
