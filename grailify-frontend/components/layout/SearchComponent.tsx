"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

export default function SearchComponent({ className = '' }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedSearchQuery) {
      const fetchResults = async () => {
        const response = await fetch(`http://localhost:8080/api/search?q=${debouncedSearchQuery}`);
        const data = await response.json();
        setResults(data || []);
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

  const closeSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsSearchFocused(false);
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
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
      <AnimatePresence>
        {isSearchFocused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
          >
            <ul className="divide-y divide-neutral-100">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/item/${item.id}`}
                    onClick={closeSearch}
                    className="flex items-center p-3 hover:bg-neutral-50 space-x-4 text-start"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-12 h-12 object-contain rounded-md bg-neutral-100 flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
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
  );
}