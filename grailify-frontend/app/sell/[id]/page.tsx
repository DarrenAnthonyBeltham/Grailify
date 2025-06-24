"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PriceHistoryEntry { price: number; recorded_at: string; }
interface ItemForSale {
    id: number;
    name: string;
    brand: string;
    description: string;
    imageUrl: string;
    category_id: number;
    priceHistory: PriceHistoryEntry[];
}
interface SizeOption {
    label: string;
    value: string;
}

const getSizeOptions = (categoryId: number): SizeOption[] => {
    switch (categoryId) {
        case 1: 
            return Array.from({ length: 8 }, (_, i) => ({ label: `US ${7 + i}`, value: `US ${7 + i}` }));
        case 2: 
            return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => ({ label: s, value: s }));
        case 4: 
            return Array.from({ length: 9 }, (_, i) => ({ label: `${38 + i}mm`, value: `${38 + i}mm` }));
        default:
            return [];
    }
};

export default function CreateListingPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [item, setItem] = useState<ItemForSale | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [askPrice, setAskPrice] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchItemData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/item?id=${id}`);
                if (!response.ok) throw new Error('Item not found');
                const data = await response.json();
                setItem(data);
                
                const sizes = getSizeOptions(data.category_id);
                if (sizes.length > 0) {
                    setSelectedSize(sizes[0].value);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItemData();
    }, [id]);

    const lastSale = useMemo(() => {
        if (!item?.priceHistory || item.priceHistory.length === 0) return null;
        return item.priceHistory[item.priceHistory.length - 1].price;
    }, [item]);

    const sizeOptions = item ? getSizeOptions(item.category_id) : [];

    const handleListForSale = () => {
        if (!selectedSize && sizeOptions.length > 0) {
            alert('Please select a size.');
            return;
        }
        if (!askPrice) {
            alert('Please enter your asking price.');
            return;
        }
        alert(`Listing ${item?.name} - Size: ${selectedSize} for $${askPrice}`);
        router.push(`/item/${id}`);
    };

    if (isLoading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    if (!item) return <div className="text-center py-20">Item not found.</div>;

    return (
        <div className="bg-neutral-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                 <button onClick={() => router.back()} className="text-sm text-neutral-600 hover:text-black mb-4 inline-flex items-center">
                    &larr; <span className="ml-1">Back to Search</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-8 bg-white rounded-lg border border-neutral-200">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-auto object-contain aspect-square"/>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-black">{item.name}</h1>
                        <p className="text-lg text-neutral-500">{item.brand}</p>
                        
                        {sizeOptions.length > 0 && (
                             <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {sizeOptions.map(size => (
                                        <button 
                                            key={size.value} 
                                            onClick={() => setSelectedSize(size.value)}
                                            className={`py-3 rounded-lg text-center font-semibold border text-sm transition-colors ${selectedSize === size.value ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}`}
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                             <h3 className="text-lg font-semibold mb-3">Set Your Price</h3>
                             <div className="relative">
                                 <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg text-neutral-500">$</span>
                                 <input 
                                    type="number"
                                    placeholder="Enter your ask"
                                    value={askPrice}
                                    onChange={(e) => setAskPrice(e.target.value)}
                                    className="w-full h-14 pl-8 pr-4 text-lg rounded-lg border-2 border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                 />
                             </div>
                             {lastSale && (
                                <p className="text-sm text-neutral-600 mt-2">Suggested Price (based on last sale): <span className="font-bold text-green-600">${lastSale.toFixed(2)}</span></p>
                             )}
                        </div>

                        <div className="mt-8">
                            <motion.button 
                                onClick={handleListForSale}
                                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
                                whileTap={{ scale: 0.98 }}
                            >
                                List for Sale
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}