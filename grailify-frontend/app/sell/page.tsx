"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Item {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
}

interface CategoryWithItems {
    id: number;
    name: string;
    slug: string;
    items: Item[];
}

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SellItemCard = ({ item }: { item: Item }) => (
    <Link href={`/sell/${item.id}`} className="group block text-center">
        <motion.div 
            className="bg-white border border-neutral-200/80 rounded-xl p-4 transition-all duration-300 group-hover:shadow-xl group-hover:border-neutral-300"
            whileHover={{ y: -5 }}
        >
            <img src={item.imageUrl} alt={item.name} className="w-full h-auto object-contain aspect-square"/>
        </motion.div>
        <div className="mt-3 px-1 flex flex-col items-center justify-start min-h-[4.5rem]">
            <p className="text-sm font-semibold text-black leading-snug line-clamp-2">{item.name}</p>
            <p className="text-xs text-neutral-500 mt-1">{item.brand}</p>
        </div>
    </Link>
);

export default function StartSellingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Item[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [categorizedItems, setCategorizedItems] = useState<CategoryWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<{[key: number]: boolean}>({});
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSellPageData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/sell-page-items`);
                if (!response.ok) throw new Error("Failed to fetch page data");
                const data = await response.json();
                setCategorizedItems(data || []);
            } catch (error) {
                console.error("Failed to fetch sell page items:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSellPageData();
    }, []);

    useEffect(() => {
        if (debouncedSearchQuery) {
            const fetchResults = async () => {
                const response = await fetch(`http://localhost:8080/api/search?q=${debouncedSearchQuery}`);
                const data: Item[] | null = await response.json();
                setSearchResults(data || []);
            };
            fetchResults();
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const toggleCategory = (categoryId: number) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    const showDropdown = isFocused && searchQuery.length > 0;
    const showBrowseContent = searchQuery.length === 0;

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">What are you selling?</h1>
                    <p className="mt-4 text-xl text-neutral-600">
                        Search our catalog to find your item and start a new listing.
                    </p>
                    <div ref={searchContainerRef} className="mt-8 max-w-lg mx-auto relative">
                        <div className="relative flex items-center">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                                <SearchIcon className="h-6 w-6 text-neutral-500" />
                            </div>
                            <input
                                type="search"
                                placeholder="e.g. Jordan 1 Retro High OG"
                                className="w-full h-14 pl-14 pr-4 text-base md:text-lg rounded-full border-2 border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                            />
                        </div>
                        <AnimatePresence>
                        {showDropdown && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-20 text-left"
                            >
                                {searchResults.length > 0 ? (
                                    <ul className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                                        {searchResults.map((item) => (
                                            <li key={item.id}>
                                                <Link href={`/sell/${item.id}`} className="flex items-center p-3 hover:bg-neutral-50">
                                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-contain rounded-md bg-neutral-100 flex-shrink-0" />
                                                    <div className="ml-4">
                                                        <p className="text-sm font-medium text-black">{item.name}</p>
                                                        <p className="text-xs text-neutral-500">{item.brand}</p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="p-4 text-center text-sm text-neutral-500">No results found.</p>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-20">
                    <AnimatePresence mode="wait">
                        {showBrowseContent ? (
                            <motion.div 
                                key="browse"
                                className="space-y-12"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {isLoading ? (
                                    <p className="text-center">Loading popular items...</p>
                                ) : (
                                    categorizedItems.map(category => (
                                        <div key={category.id}>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-2xl font-bold text-black tracking-tight">{`Trending in ${category.name}`}</h3>
                                                {category.items.length > 5 && (
                                                    <button onClick={() => toggleCategory(category.id)} className="text-sm font-semibold text-black hover:underline">
                                                        {expandedCategories[category.id] ? 'Show Less' : 'Show More'}
                                                    </button>
                                                )}
                                            </div>
                                            <motion.div 
                                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                                                animate={{ height: 'auto' }}
                                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                            >
                                                {(expandedCategories[category.id] ? category.items : category.items.slice(0, 5)).map(item => (
                                                    <SellItemCard key={item.id} item={item} />
                                                ))}
                                            </motion.div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="search"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <h3 className="text-2xl font-bold text-black tracking-tight mb-6">Search Results</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {searchResults.length > 0 ? (
                                    searchResults.map(item => <SellItemCard key={item.id} item={item} />)
                                ) : (
                                    <p className="col-span-full text-center text-neutral-500">Searching...</p>
                                )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}