"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceHistoryEntry { 
    price: number; 
    recorded_at: string; 
}

interface ItemData {
    item: {
        id: number;
        name: string;
        brand: string;
        description: string;
        imageUrl: string;
        category_id: number;
    };
    priceHistory: PriceHistoryEntry[];
}
interface SizeOption { label: string; value: string; }

const getSizeOptions = (categoryId: number): SizeOption[] => {
    switch (categoryId) {
        case 1: return Array.from({ length: 8 }, (_, i) => ({ label: `US ${7 + i}`, value: `US ${7 + i}` }));
        case 2: return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => ({ label: s, value: s }));
        case 4: return Array.from({ length: 9 }, (_, i) => ({ label: `${38 + i}mm`, value: `${38 + i}mm` }));
        default: return [];
    }
};

const PriceChart = ({ data }: { data: { date: string, price: number }[] }) => {
    const chartData = useMemo(() => data.map(d => ({ ...d, date: new Date(d.date) })).sort((a, b) => a.date.getTime() - b.date.getTime()), [data]);
    if (chartData.length < 2) {
        return <div className="flex items-center justify-center h-40 bg-neutral-100 rounded-md text-neutral-500">Not enough sales data for a chart.</div>;
    }
    const yMin = Math.min(...chartData.map(d => d.price)) * 0.95;
    const yMax = Math.max(...chartData.map(d => d.price)) * 1.05;
    const xMin = chartData[0].date.getTime();
    const xMax = chartData[chartData.length - 1].date.getTime();

    const toSvgX = (date: Date) => ((date.getTime() - xMin) / (xMax - xMin)) * 500;
    const toSvgY = (price: number) => 100 - ((price - yMin) / (yMax - yMin)) * 100;
    const path = chartData.map(d => `${toSvgX(d.date)},${toSvgY(d.price)}`).join(" L ");
    
    return (<div className="w-full bg-neutral-50/70 rounded-lg p-4"><svg viewBox="0 0 500 100" className="w-full h-40"><path d={`M ${path}`} fill="none" stroke="#10B981" strokeWidth="2" /></svg></div>);
};

const SuccessModal = ({ orderId, onClose }: { orderId: string, onClose: () => void }) => (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-center p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
               <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">Listing Created!</h2>
            <p className="mt-2 text-neutral-600">Your item is now live on the marketplace.</p>
            <button onClick={onClose} className="mt-6 w-full bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-neutral-800">Done</button>
        </motion.div>
    </motion.div>
);

export default function CreateListingPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [itemData, setItemData] = useState<ItemData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [listingSuccess, setListingSuccess] = useState(false);
    
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [stock, setStock] = useState('1');
    const [askPrice, setAskPrice] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchItemData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/item?id=${id}`);
                if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    router.push('/login?sessionExpired=true');
                }
                throw new Error('Failed to create listing.');
            }
                if (!response.ok) throw new Error('Item not found');
                const data = await response.json();
                setItemData(data);
                
                const sizes = getSizeOptions(data.item.category_id);
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
        if (!itemData?.priceHistory || itemData.priceHistory.length === 0) return null;
        return itemData.priceHistory[itemData.priceHistory.length - 1].price;
    }, [itemData]);
    
    const chartCompatiblePriceHistory = useMemo(() => {
        if (!itemData?.priceHistory) return [];
        return itemData.priceHistory.map(entry => ({
            date: entry.recorded_at,
            price: entry.price,
        }));
    }, [itemData]);

    const sizeOptions = itemData ? getSizeOptions(itemData.item.category_id) : [];

    const handleListForSale = async () => {
        if (!selectedSize && sizeOptions.length > 0) {
            alert('Please select a size.'); return;
        }
        if (!askPrice || parseFloat(askPrice) <= 0) {
            alert('Please enter a valid asking price.'); return;
        }
        if (!stock || parseInt(stock) <= 0) {
            alert('Please enter a valid stock quantity.'); return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    itemId: itemData?.item.id,
                    size: selectedSize,
                    price: parseFloat(askPrice),
                    stock: parseInt(stock)
                }),
            });
            if (!response.ok) throw new Error('Failed to create listing.');
            setListingSuccess(true);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (isLoading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    if (!itemData) return <div className="text-center py-20">Item not found.</div>;

    const { item } = itemData;

    return (
        <>
        <div className="bg-neutral-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                 <button onClick={() => router.back()} className="text-sm text-neutral-600 hover:text-black mb-4 inline-flex items-center">
                    &larr; <span className="ml-1">Back to Search</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    <div className="p-8 bg-white rounded-xl border border-neutral-200 shadow-sm">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-auto object-contain aspect-square"/>
                        <div className="mt-6 pt-6 border-t">
                            <h2 className="text-lg font-bold">About this item</h2>
                            <p className="mt-2 text-neutral-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-black">{item.name}</h1>
                        <p className="text-lg text-neutral-500">{item.brand}</p>
                        
                        {sizeOptions.length > 0 && (
                             <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {sizeOptions.map(size => (
                                        <button key={size.value} onClick={() => setSelectedSize(size.value)}
                                            className={`py-3 rounded-lg text-center font-semibold border text-sm transition-colors ${selectedSize === size.value ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}`}>
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-2 gap-6">
                             <div>
                                <h3 className="text-lg font-semibold mb-3">Your Ask Price</h3>
                                <div className="relative"><span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg text-neutral-500">$</span>
                                    <input type="number" placeholder="0.00" value={askPrice} onChange={(e) => setAskPrice(e.target.value)}
                                    className="w-full h-14 pl-8 pr-4 text-lg rounded-lg border-2 border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"/>
                                </div>
                             </div>
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                                <input type="number" placeholder="1" value={stock} onChange={(e) => setStock(e.target.value)}
                                className="w-full h-14 px-4 text-lg rounded-lg border-2 border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"/>
                             </div>
                        </div>
                        
                         <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-3">Market Data</h3>
                            <PriceChart data={chartCompatiblePriceHistory} />
                            {lastSale && (<p className="text-sm text-neutral-600 mt-2">Last Sale: <span className="font-bold text-green-600">${lastSale.toFixed(2)}</span></p>)}
                        </div>

                        <div className="mt-8">
                            <motion.button onClick={handleListForSale} className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors" whileTap={{ scale: 0.98 }}>
                                List for Sale
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <AnimatePresence>
            {listingSuccess && (
                <SuccessModal 
                    orderId={item.id.toString()}
                    onClose={() => setListingSuccess(false)}
                />
            )}
        </AnimatePresence>
        </>
    );
}
