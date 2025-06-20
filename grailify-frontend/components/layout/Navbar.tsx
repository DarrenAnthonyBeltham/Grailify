"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
    {children}
  </Link>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery) {
      const fetchResults = async () => {
        const response = await fetch(`http://localhost:8080/api/search?q=${debouncedSearchQuery}`);
        const data: SearchResult[] = await response.json();
        setResults(data);
      };
      fetchResults();
    } else {
      setResults([]);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const closeSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsSearchFocused(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-black tracking-tighter">
              Grailify
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink href="/browse/sneakers">Sneakers</NavLink>
              <NavLink href="/browse/apparel">Apparel</NavLink>
              <NavLink href="/browse/electronics">Electronics</NavLink>
              <NavLink href="/browse/accessories">Accessories</NavLink>
            </nav>
          </div>

          <div ref={searchContainerRef} className="flex-1 max-w-md mx-8 hidden lg:block relative">
            <div className="relative">
               <input
                type="search"
                placeholder="Search for your Grail..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-neutral-300 bg-neutral-100/80 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
               />
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <SearchIcon className="h-5 w-5 text-neutral-500" />
               </div>
            </div>

            {isSearchFocused && results.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
                <ul className="divide-y divide-neutral-100">
                  {results.map((item) => (
                    <li key={item.id}>
                      <Link 
                        href={`/item/${item.id}`} 
                        onClick={closeSearch}
                        className="flex items-center p-3 hover:bg-neutral-50"
                      >
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-contain rounded-md bg-neutral-100" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-black">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.brand}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <NavLink href="/account">My Account</NavLink>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block text-sm font-medium text-neutral-600 hover:text-black transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-medium text-neutral-600 hover:text-black transition-colors">Log In</Link>
                <Link href="/signup" className="hidden sm:block text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">Sign Up</Link>
              </>
            )}
             <Link href="/sell" className="text-sm font-medium border border-neutral-300 px-4 py-2 rounded-full hover:bg-neutral-100 transition-colors">Sell</Link>
          </div>
        </div>
      </div>
    </header>
  );
}