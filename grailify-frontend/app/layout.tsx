"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showHeaderFooter = !['/login', '/signup'].includes(pathname);

  return (
    <html lang="en">
      <head>
        <title>Grailify - The Marketplace for Real Grails</title>
        <meta name="description" content="Buy and sell the most coveted sneakers, apparel, and accessories." />
      </head>
      <body className={`${inter.className} bg-white text-neutral-800`}>
        {showHeaderFooter && <Navbar />}
        <main>{children}</main>
        {showHeaderFooter && <Footer />}
      </body>
    </html>
  );
}