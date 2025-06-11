"use client";

import React, { useState } from 'react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
    {children}
  </a>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-2xl font-bold text-black tracking-tighter">
              Grailify
            </a>
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink href="/browse/sneakers">Sneakers</NavLink>
              <NavLink href="/browse/apparel">Apparel</NavLink>
              <NavLink href="/browse/electronics">Electronics</NavLink>
              <NavLink href="/browse/accessories">Accessories</NavLink>
            </nav>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
               <input
                type="search"
                placeholder="Search for your Grail..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-neutral-300 bg-neutral-100/80 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
               />
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <SearchIcon className="h-5 w-5 text-neutral-500" />
               </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a href="/login" className="hidden sm:block text-sm font-medium text-neutral-600 hover:text-black transition-colors">Log In</a>
            <a href="/signup" className="hidden sm:block text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">Sign Up</a>
            <a href="/sell" className="text-sm font-medium border border-neutral-300 px-4 py-2 rounded-full hover:bg-neutral-100 transition-colors">Sell</a>
          </div>
        </div>
      </div>
    </header>
  );
}