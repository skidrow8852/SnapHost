import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "SnapHost - Clone and Deploy Your Projects with Ease",
  description: "SnapHost allows you to clone your GitHub repository and deploy it with minimal setup. Support for static websites and React projects. Effortless hosting and deployment.",
  icons: [
    { rel: "icon", href: "/favicon.ico", url : "https://example.com/icon.png" },
   
  ],
  openGraph: {
    title: "SnapHost - Clone and Deploy Your Projects with Ease",
    description: "Clone your GitHub repository and deploy static websites or React projects effortlessly with SnapHost. Minimal setup, fast deployment.",
    url: "https://www.snaphost.com",
    siteName: "SnapHost",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SnapHost - Effortless GitHub Repo Cloning and Deployment"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@SnapHost",
    title: "SnapHost - Clone and Deploy Your Projects with Ease",
    description: "Effortlessly clone and deploy your GitHub projects. Fast and reliable hosting for static websites and React apps.",
    images: "/og-image.png"
  },
  robots: "index, follow",
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
