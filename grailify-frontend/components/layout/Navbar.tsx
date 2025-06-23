"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
}

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    const updateCart = () => {
        const storedCart = localStorage.getItem('grailifyCart');
        setCartItems(storedCart ? JSON.parse(storedCart) : []);
    };
    updateCart();

    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    router.push('/');
  };

  const closeSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-black tracking-tighter">Grailify</Link>
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink href="/browse/sneakers">Sneakers</NavLink>
              <NavLink href="/browse/apparel">Apparel</NavLink>
              <NavLink href="/browse/electronics">Electronics</NavLink>
              <NavLink href="/browse/accessories">Accessories</NavLink>
            </nav>
          </div>

          <div ref={searchContainerRef} className="flex-1 max-w-md mx-8 hidden lg:block relative">
             <div className="relative">
                <input type="search" placeholder="Search for your Grail..." className="w-full h-10 pl-10 pr-4 rounded-full border border-neutral-300 bg-neutral-100/80 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-neutral-500" /></div>
             </div>
             <AnimatePresence>
             {isSearchFocused && results.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
                    <ul className="divide-y divide-neutral-100">
                        {results.map((item) => (
                        <li key={item.id}>
                            <Link href={`/item/${item.id}`} onClick={closeSearch} className="flex items-center p-3 hover:bg-neutral-50">
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-contain rounded-md bg-neutral-100" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-black">{item.name}</p>
                                    <p className="text-xs text-neutral-500">{item.brand}</p>
                                </div>
                            </Link>
                        </li>
                        ))}
                    </ul>
                </motion.div>
             )}
             </AnimatePresence>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <NavLink href="/account">My Account</NavLink>
                <button onClick={handleLogout} className="hidden sm:block text-sm font-medium text-neutral-600 hover:text-black transition-colors">Log Out</button>
              </>
            ) : (
              <>
                <NavLink href="/login">Log In</NavLink>
                <Link href="/signup" className="hidden sm:block text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">Sign Up</Link>
              </>
            )}
            <Link href="/sell" className="text-sm font-medium border border-neutral-300 px-4 py-2 rounded-full hover:bg-neutral-100 transition-colors">Sell</Link>
            
            <div className="relative">
                <button onClick={() => setIsCartOpen(!isCartOpen)} className="p-2 rounded-full hover:bg-neutral-100 relative">
                    <CartIcon className="h-6 w-6 text-black"/>
                    {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {cartItems.length}
                        </span>
                    )}
                </button>
                 <AnimatePresence>
                    {isCartOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden">
                            <div className="p-4">
                                <h3 className="font-semibold text-lg">Your Cart</h3>
                            </div>
                            {cartItems.length > 0 ? (
                                <>
                                <div className="max-h-64 overflow-y-auto p-4 border-t border-b">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex items-center py-2">
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain rounded-md bg-neutral-100"/>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-sm text-neutral-500">${item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4">
                                    <Link href="/cart" onClick={() => setIsCartOpen(false)} className="w-full text-center bg-black text-white py-2 rounded-lg font-semibold block hover:bg-neutral-800">
                                        View Cart & Checkout
                                    </Link>
                                </div>
                                </>
                            ) : (
                                <p className="p-4 text-center text-neutral-500">Your cart is empty.</p>
                            )}
                        </motion.div>
                    )}
                 </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <motion.div whileHover={{ y: -2 }}>
      <Link href={href} className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
        {children}
      </Link>
  </motion.div>
);