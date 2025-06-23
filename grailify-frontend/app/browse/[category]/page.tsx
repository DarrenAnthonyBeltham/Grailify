"use client";
import { useParams } from 'next/navigation';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <line x1="18" y1="6" x2="6" y2="18"></line>
         <line x1="6" y1="6" x2="18" y2="18"></line>
     </svg>
)

interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
}

interface PaginatedResponse {
    items: Product[] | null;
    totalPages: number;
    page: number;
}

const ProductCard = ({ id, name, brand, price, imageUrl }: Product) => (
  <Link href={`/item/${id}`} className="group">
    <div className="aspect-square w-full bg-white rounded-lg overflow-hidden border border-neutral-200">
      <img src={imageUrl || 'https://placehold.co/600x600/e0e0e0/333?text=No+Image'} alt={name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="mt-4">
      <p className="text-sm text-neutral-500">{brand}</p>
      <h3 className="mt-1 text-base font-medium text-black">{name}</h3>
      <p className="mt-2 text-lg font-semibold text-black">${price ? price.toFixed(2) : '0.00'}</p>
      <p className="text-sm text-neutral-500">Lowest Ask</p>
    </div>
  </Link>
);

const FilterSidebar = ({ uniqueBrands, selectedBrands, handleBrandChange, minPrice, setMinPrice, maxPrice, setMaxPrice }: any) => {
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

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-medium mb-4">Brands</h3>
                <div className="space-y-2">
                    {uniqueBrands.length > 0 ? uniqueBrands.map((brand: string) => (
                        <label key={brand} className="flex items-center">
                            <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => handleBrandChange(brand)}
                            />
                            <span className="ml-3 text-sm text-neutral-700">{brand}</span>
                        </label>
                    )) : <p className="text-sm text-neutral-500">No brands available</p>}
                </div>
            </div>
            <div>
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="relative flex items-center h-12">
                    <div className="relative w-full">
                        <input
                            type="range" min={min} max={max} value={minPrice}
                            step="10"
                            onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 100))}
                            className="thumb absolute w-full h-2 bg-transparent appearance-none z-20"
                        />
                        <input
                            type="range" min={min} max={max} value={maxPrice}
                            step="10"
                            onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 100))}
                            className="thumb absolute w-full h-2 bg-transparent appearance-none z-20"
                        />
                        <div className="relative z-10 h-2">
                            <div className="absolute w-full rounded-md h-2 bg-neutral-200"></div>
                            <div ref={range} className="absolute h-2 rounded-md bg-black"></div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-neutral-600">${minPrice.toLocaleString('en-US')}</div>
                    <div className="text-sm text-neutral-600">
                      {maxPrice === max ? `$${maxPrice.toLocaleString('en-US')}+` : `$${maxPrice.toLocaleString('en-US')}`}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CategoryPage() {
    const params = useParams();
    const category = typeof params.category === 'string' ? params.category : '';
    const [products, setProducts] = useState<Product[]>([]);
    const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const max = 5000;

    useEffect(() => {
        if (!category) {
            setIsLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams({ category, page: currentPage.toString() });
                const response = await fetch(`http://localhost:8080/api/items?${queryParams.toString()}`);
                
                if (!response.ok) throw new Error('Network response was not ok');
                const data: PaginatedResponse = await response.json();
                
                const safeItems = data.items || [];
                setProducts(safeItems);
                setTotalPages(data.totalPages || 0);

                if (currentPage === 1 && selectedBrands.length === 0 && minPrice === 0 && maxPrice === 5000) {
                     const brands = new Set(safeItems.map(p => p.brand).filter(Boolean));
                     setUniqueBrands(Array.from(brands));
                }

            } catch (err: any) {
                console.error("Failed to fetch products:", err);
                setError(err.message);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchProducts();
    }, [category, currentPage]);

    const handleBrandChange = (brand: string) => {
        setSelectedBrands(prev => 
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const priceCondition = product.price >= minPrice && (maxPrice === max ? true : product.price <= maxPrice);
            const brandCondition = selectedBrands.length === 0 || (typeof product.brand === 'string' && selectedBrands.includes(product.brand));
            return priceCondition && brandCondition;
        });
    }, [minPrice, maxPrice, selectedBrands, products]);

    const categoryName = category ? (category.charAt(0).toUpperCase() + category.slice(1)).replace(/([A-Z])/g, ' $1').trim() : 'Category';

    useEffect(() => {
        if (isFilterOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; }
    }, [isFilterOpen]);

    const PaginationControls = () => (
        <div className="flex items-center justify-center space-x-4 mt-16">
            <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                First
            </button>
            <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-sm text-neutral-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
             <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Last
            </button>
        </div>
    );

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <header className="pb-8 border-b border-neutral-200">
                    <h1 className="text-4xl font-bold text-black tracking-tight">{categoryName}</h1>
                    <p className="mt-2 text-lg text-neutral-600">Browse the latest drops and classic styles.</p>
                </header>

                <div className="flex justify-end my-4 lg:hidden">
                    <button onClick={() => setIsFilterOpen(true)} className="flex items-center space-x-2 border px-4 py-2 rounded-lg">
                        <FilterIcon className="h-5 w-5" />
                        <span>Filters</span>
                    </button>
                </div>

                <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div onClick={() => setIsFilterOpen(false)} className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white p-6 transform transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)}>
                                <CloseIcon className="h-6 w-6" />
                            </button>
                          </div>
                        <FilterSidebar {...{ uniqueBrands, selectedBrands, handleBrandChange, minPrice, setMinPrice, maxPrice, setMaxPrice }} />
                    </div>
                </div>

                <div className="flex pt-2 lg:pt-8">
                    <aside className="w-64 pr-8 hidden lg:block">
                        <h2 className="text-lg font-semibold mb-6">Filters</h2>
                        <FilterSidebar {...{ uniqueBrands, selectedBrands, handleBrandChange, minPrice, setMinPrice, maxPrice, setMaxPrice }} />
                    </aside>

                    <main className="flex-1">
                        {isLoading ? (
                            <div className="text-center text-neutral-500 py-20">Loading products...</div>
                        ) : error ? (
                             <div className="text-center text-red-500 py-20">Error: {error}</div>
                        ) : (
                            <>
                                {filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                                        {filteredProducts.map(product => <ProductCard key={product.id} {...product} />)}
                                    </div>
                                ) : (
                                    <p className="text-center text-neutral-500 py-20">No products found matching your criteria.</p>
                                )}
                                {totalPages > 1 && <PaginationControls />}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}