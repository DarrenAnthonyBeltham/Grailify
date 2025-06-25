import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/layout/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grailify - The Marketplace for Real Grails",
  description: "Buy and sell the most coveted sneakers, apparel, and accessories from top brands like Nike, Adidas, and Supreme.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-neutral-800`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}