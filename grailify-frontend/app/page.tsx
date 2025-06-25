"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SearchComponent from '@/components/layout/SearchComponent';

interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
}

const ProductCard = ({ id, name, brand, price, imageUrl }: Product) => {
    return (
        <Link href={`/item/${id}`} className="group">
            <div className="aspect-square w-full bg-neutral-100 rounded-lg overflow-hidden">
                <motion.img 
                    src={imageUrl} 
                    alt={name} 
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
            </div>
            <div className="mt-4">
                <p className="text-sm text-neutral-500">{brand}</p>
                <h3 className="mt-1 text-base font-medium text-black">{name}</h3>
                <p className="mt-2 text-lg font-semibold text-black">${price.toFixed(2)}</p>
                <p className="text-sm text-neutral-500">Last Sale</p>
            </div>
        </Link>
    );
};

const ProductCardSkeleton = () => (
    <div className="animate-pulse">
        <div className="aspect-square w-full bg-neutral-200 rounded-lg"></div>
        <div className="mt-4 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
        </div>
    </div>
);

const CategoryCard = ({ name, imageUrl, href }: { name: string; imageUrl: string; href: string; }) => (
    <Link href={href} className="group relative block">
        <motion.div 
            className="aspect-[4/3] w-full bg-neutral-100 rounded-lg overflow-hidden relative"
            whileHover="hover"
        >
            <motion.img 
                src={imageUrl} 
                alt={name} 
                className="w-full h-full object-cover"
                variants={{ hover: { scale: 1.05 } }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
             <motion.div 
                className="absolute inset-0 bg-black rounded-lg"
                initial={{ opacity: 0.2 }}
                variants={{ hover: { opacity: 0.4 } }}
                transition={{ duration: 0.3 }}
            />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.h3 
                className="text-white text-2xl font-bold tracking-tight"
                variants={{ hover: { scale: 1.05 } }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                {name}
            </motion.h3>
        </div>
    </Link>
);

const getCategoryImage = (slug: string) => {
    const imageMap: { [key: string]: string } = {
        'sneakers': '/assets/pages/sneakerscollection.webp',
        'apparel': '/assets/pages/apparelscollection.webp',
        'electronics': '/assets/pages/techsystem.jpg',
        'watches': '/assets/pages/watchescollection.webp',
        'accessories': 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1887&auto=format&fit=crop'
    };
    return imageMap[slug] || 'https://placehold.co/800x600/e0e0e0/333?text=Category';
}

const AnimatedButton = ({ href, children, className }: { href: string, children: React.ReactNode, className: string }) => (
    <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
        <Link href={href} className={className}>
            {children}
        </Link>
    </motion.div>
);

export default function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [trendingSneakers, setTrendingSneakers] = useState<Product[]>([]);
    const [trendingApparel, setTrendingApparel] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('authToken'));

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [catResponse, trendingResponse] = await Promise.all([
                    fetch('http://localhost:8080/api/categories'),
                    fetch('http://localhost:8080/api/trending')
                ]);

                if (!catResponse.ok) throw new Error('Failed to fetch categories');
                const catData = await catResponse.json();
                setCategories(catData || []);

                if (!trendingResponse.ok) throw new Error('Failed to fetch trending items');
                const trendingData = await trendingResponse.json();
                setTrendingSneakers(trendingData.trendingSneakers || []);
                setTrendingApparel(trendingData.trendingApparelAccessories || []);

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const renderProductGrid = (products: Product[]) => {
        if (isLoading) {
            return Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />);
        }
        return products.map(product => <ProductCard key={product.id} {...product} />);
    };

    const gridVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div>
            <section className="text-center py-20 md:py-32 bg-white">
                <div className="container mx-auto px-4">
                    {isLoggedIn ? (
                        <>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter">Welcome Back to Grailify</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">You're ready to buy and sell. What will you find today?</p>
                            <div className="mt-8 flex justify-center space-x-4">
                               <AnimatedButton href="/browse/allgrails" className="bg-black text-white px-8 py-3 rounded-full font-medium">Browse Grails</AnimatedButton>
                               <AnimatedButton href="/sell" className="bg-white text-black border border-neutral-300 px-8 py-3 rounded-full font-medium">Start Selling</AnimatedButton>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter">The Marketplace for Real Grails</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Buy and sell the most coveted, authentic sneakers, apparel, electronics, and more.</p>
                            <div className="mt-8 flex justify-center space-x-4">
                                <AnimatedButton href="/browse/allgrails" className="bg-black text-white px-8 py-3 rounded-full font-medium">Browse All</AnimatedButton>
                                <AnimatedButton href="/signup" className="bg-white text-black border border-neutral-300 px-8 py-3 rounded-full font-medium">Sign Up to Sell</AnimatedButton>
                            </div>
                        </>
                    )}

                    <div className="mt-8 lg:hidden">
                        <SearchComponent className="max-w-md mx-auto" />
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-black tracking-tight">Trending Sneakers</h2>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {renderProductGrid(trendingSneakers)}
                    </div>
                </div>
            </section>
            
            <section className="py-16 md:py-24 bg-white border-t border-neutral-200">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-black tracking-tight">Trending Apparel & Accessories</h2>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {renderProductGrid(trendingApparel)}
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-neutral-50/50 border-t border-neutral-200">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-black tracking-tight">Browse by Category</h2>
                    <motion.div 
                        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={gridVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {isLoading ? (
                            <p className="col-span-full text-center text-neutral-500">Loading categories...</p>
                        ) : (
                            categories.map(category => (
                                <motion.div key={category.id} variants={cardVariants}>
                                    <CategoryCard 
                                        name={category.name}
                                        href={`/browse/${category.slug}`}
                                        imageUrl={getCategoryImage(category.slug)}
                                    />
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
}