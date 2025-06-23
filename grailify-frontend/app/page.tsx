"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
                <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
        <div className="aspect-[4/3] w-full bg-neutral-100 rounded-lg overflow-hidden">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-white text-2xl font-bold tracking-tight">{name}</h3>
        </div>
    </Link>
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

    return (
        <div>
            <section className="text-center py-20 md:py-32 bg-white">
                <div className="container mx-auto px-4">
                    {isLoggedIn ? (
                        <>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter">Welcome Back to Grailify</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">You're ready to buy and sell. What will you find today?</p>
                            <div className="mt-8 flex justify-center space-x-4">
                                <a href="/browse/allgrails" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">Browse Grails</a>
                                <a href="/sell" className="bg-white text-black border border-neutral-300 px-8 py-3 rounded-full font-medium hover:bg-neutral-100 transition-colors">Start Selling</a>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter">The Marketplace for Real Grails</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Buy and sell the most coveted, authentic sneakers, apparel, electronics, and more.</p>
                            <div className="mt-8 flex justify-center space-x-4">
                                <a href="/browse/allgrails" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">Browse All</a>
                                <a href="/signup" className="bg-white text-black border border-neutral-300 px-8 py-3 rounded-full font-medium hover:bg-neutral-100 transition-colors">Sign Up to Sell</a>
                            </div>
                        </>
                    )}
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
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            <p className="col-span-full text-center text-neutral-500">Loading categories...</p>
                        ) : (
                            categories.map(category => (
                                <CategoryCard 
                                    key={category.id}
                                    name={category.name}
                                    href={`/browse/${category.slug}`}
                                    imageUrl={`https://placehold.co/800x600/e0e0e0/333?text=${category.name}`}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}