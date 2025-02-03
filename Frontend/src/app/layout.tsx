import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Midas | Next-Gen DeFi Agent",
  description:
    "Midas is a cutting-edge AI agent that does all the complex DeFi actions for you, as easily as sending a message.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        href: "/favicon.ico",
      },
    ],
  },
  openGraph: {
    title: "Midas | Next-Gen DeFi Agent",
    description:
      "Midas is a cutting-edge AI agent that does all the complex DeFi actions for you, as easily as sending a message.",
    url: "https://midas.yieldhive.xyz",
    siteName: "Midas Protocol",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Midas Protocol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midas | Next-Gen DeFi Agent",
    description:
      "Midas is a cutting-edge AI agent that does all the complex DeFi actions for you, as easily as sending a message.",
    images: ["/og-image.png"],
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
        className={`${inter.variable} antialiased font-sans bg-black text-white`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
