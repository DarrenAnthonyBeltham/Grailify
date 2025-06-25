"use client"; 

import { usePathname } from 'next/navigation';
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeaderFooter = !['/login', '/signup'].includes(pathname);

  return (
    <>
      {showHeaderFooter && <Navbar />}
      <main>{children}</main>
      {showHeaderFooter && <Footer />}
    </>
  );
}