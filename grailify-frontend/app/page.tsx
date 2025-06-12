"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ProductCard = ({ name, brand, price, imageUrl }: { name: string; brand: string; price: number; imageUrl: string }) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    return (
        <Link href={`/item/${slug}`} className="group">
            <div className="aspect-square w-full bg-neutral-100 rounded-lg overflow-hidden">
                <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="mt-4">
                <p className="text-sm text-neutral-500">{brand}</p>
                <h3 className="mt-1 text-base font-medium text-black">{name}</h3>
                <p className="mt-2 text-lg font-semibold text-black">${price}</p>
                <p className="text-sm text-neutral-500">Lowest Ask</p>
            </div>
        </Link>
    );
};

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

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };
    checkAuth();
  }, []);

  const trendingProducts = [
    { name: "Jordan 1 Retro High OG", brand: "Nike", price: 250, imageUrl: "https://placehold.co/600x600/f0f0f0/333?text=Sneaker+1" },
    { name: "Yeezy Boost 350 V2", brand: "Adidas", price: 320, imageUrl: "https://placehold.co/600x600/f0f0f0/333?text=Sneaker+2" },
    { name: "New Balance 550", brand: "New Balance", price: 180, imageUrl: "https://placehold.co/600x600/f0f0f0/333?text=Sneaker+3" },
    { name: "Classic Leather", brand: "Reebok", price: 150, imageUrl: "https://placehold.co/600x600/f0f0f0/333?text=Sneaker+4" },
  ];

  return (
    <div>
      <section className="text-center py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          {isLoggedIn ? (
            <>
              <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter">Welcome Back to Grailify</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">You're ready to buy and sell. What will you find today?</p>
              <div className="mt-8 flex justify-center space-x-4">
                <a href="/browse" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">Browse Grails</a>
                <a href="/sell" className="bg-white text-black border border-neutral-300 px-8 py-3 rounded-full font-medium hover:bg-neutral-100 transition-colors">Start Selling</a>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter">The Marketplace for Real Grails</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Buy and sell the most coveted, authentic sneakers, apparel, electronics, and more.</p>
              <div className="mt-8 flex justify-center space-x-4">
                <a href="/browse/morecategories" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">Browse All</a>
                <a href="/signup" className="bg-white text-black border border-neutral-300 px-8 py-3 rounded-full font-medium hover:bg-neutral-100 transition-colors">Sign Up to Sell</a>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-black tracking-tight">Trending Now</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {trendingProducts.map(product => <ProductCard key={product.name} {...product} />)}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-neutral-50/50 border-t border-neutral-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-black tracking-tight">Browse by Category</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <CategoryCard name="Sneakers" href="/browse/sneakers" imageUrl="https://placehold.co/800x600/e0e0e0/333?text=Sneakers" />
            <CategoryCard name="Apparel" href="/browse/apparel" imageUrl="https://placehold.co/800x600/e0e0e0/333?text=Apparel" />
            <CategoryCard name="Electronics" href="/browse/electronics" imageUrl="https://placehold.co/800x600/e0e0e0/333?text=Electronics" />
            <CategoryCard name="Watches" href="/browse/watches" imageUrl="https://placehold.co/800x600/e0e0e0/333?text=Watches" />
            <CategoryCard name="Accessories" href="/browse/accessories" imageUrl="https://placehold.co/800x600/e0e0e0/333?text=Accessories" />
            <CategoryCard name="More Categories" href="/browse/morecategories" imageUrl="https://placehold.co/800x600/e0e0e0/333?text=More Categories" />
          </div>
        </div>
      </section>
    </div>
  );
}
