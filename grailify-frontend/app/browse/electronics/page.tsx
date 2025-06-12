"use client";

import { useParams } from 'next/navigation';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

const ProductCard = ({ name, brand, price, imageUrl }: { name: string; brand: string; price: number; imageUrl: string }) => (
  <a href="#" className="group">
    <div className="aspect-square w-full bg-neutral-100 rounded-lg overflow-hidden">
      <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="mt-4">
      <p className="text-sm text-neutral-500">{brand}</p>
      <h3 className="mt-1 text-base font-medium text-black">{name}</h3>
      <p className="mt-2 text-lg font-semibold text-black">${price}</p>
      <p className="text-sm text-neutral-500">Lowest Ask</p>
    </div>
  </a>
);

export default function CategoryPage() {
    const params = useParams();
    const category = Array.isArray(params.category) ? params.category[0] : params.category;
    
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const min = 0;
    const max = 5000;
    const range = useRef<HTMLDivElement>(null);

    const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max]);

    useEffect(() => {
        if (range.current) {
            const minPercent = getPercent(minPrice);
            const maxPercent = getPercent(maxPrice);
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minPrice, maxPrice, getPercent]);

    const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';

    const allProducts = useMemo(() => [
        { name: `${categoryName} Model 1`, brand: "Brand A", price: 250, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+1` },
        { name: `${categoryName} Model 2`, brand: "Brand B", price: 320, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+2` },
        { name: `${categoryName} Model 3`, brand: "Brand A", price: 180, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+3` },
        { name: `${categoryName} Model 4`, brand: "Brand C", price: 1500, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+4` },
        { name: `${categoryName} Model 5`, brand: "Brand B", price: 400, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+5` },
        { name: `${categoryName} Model 6`, brand: "Brand D", price: 2200, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+6` },
        { name: `${categoryName} Model 7`, brand: "Brand C", price: 80, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+7` },
        { name: `${categoryName} Model 8`, brand: "Brand D", price: 4500, imageUrl: `https://placehold.co/600x600/f0f0f0/333?text=${categoryName}+8` },
    ], [categoryName]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const priceCondition = product.price >= minPrice && product.price <= maxPrice;
            const brandCondition = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
            return priceCondition && brandCondition;
        });
    }, [minPrice, maxPrice, selectedBrands, allProducts]);

    const handleBrandChange = (brand: string) => {
        setSelectedBrands(prev => 
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const uniqueBrands = useMemo(() => [...new Set(allProducts.map(p => p.brand))], [allProducts]);

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <header className="pb-8 border-b border-neutral-200">
                    <h1 className="text-4xl font-bold text-black tracking-tight">{categoryName}</h1>
                    <p className="mt-2 text-lg text-neutral-600">Browse the latest drops and classic styles.</p>
                </header>

                <div className="flex pt-8">
                    <aside className="w-64 pr-8 hidden lg:block">
                        <h2 className="text-lg font-semibold mb-4">Filters</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium mb-2">Brands</h3>
                                <div className="space-y-2">
                                    {uniqueBrands.map(brand => (
                                        <label key={brand} className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                checked={selectedBrands.includes(brand)}
                                                onChange={() => handleBrandChange(brand)}
                                            />
                                            <span className="ml-2 text-sm text-neutral-700">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-4">Price Range</h3>
                                <div className="relative h-10 flex items-center pt-4">
                                    <input
                                        type="range"
                                        min={min}
                                        max={max}
                                        value={minPrice}
                                        onChange={(event) => {
                                            const value = Math.min(Number(event.target.value), maxPrice - 100);
                                            setMinPrice(value);
                                        }}
                                        className="thumb absolute w-full h-2 bg-transparent appearance-none z-20"
                                    />
                                    <input
                                        type="range"
                                        min={min}
                                        max={max}
                                        value={maxPrice}
                                        onChange={(event) => {
                                            const value = Math.max(Number(event.target.value), minPrice + 100);
                                            setMaxPrice(value);
                                        }}
                                        className="thumb absolute w-full h-2 bg-transparent appearance-none z-20"
                                    />
                                    <div className="relative w-full z-10">
                                        <div className="absolute w-full rounded h-2 bg-neutral-200"></div>
                                        <div ref={range} className="absolute h-2 rounded bg-black"></div>
                                        <div className="absolute text-sm text-neutral-600 -bottom-7" style={{ left: `${getPercent(minPrice)}%`, transform: 'translateX(-50%)' }}>${minPrice}</div>
                                        <div className="absolute text-sm text-neutral-600 -bottom-7" style={{ left: `${getPercent(maxPrice)}%`, transform: 'translateX(-50%)' }}>
                                            {maxPrice === max ? `$${maxPrice.toLocaleString()}+` : `$${maxPrice.toLocaleString()}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                            {filteredProducts.map(product => <ProductCard key={product.name} {...product} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}