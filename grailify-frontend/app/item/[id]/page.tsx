"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';

// Interfaces
interface InventoryInfo {
    inventoryId: number;
    size: string;
    price: number;
    stock: number;
}
interface PriceHistoryEntry {
    id: number;
    item_id: number;
    price: number;
    type: string;
    recorded_at: string;
}
interface ItemDetail {
    id: number;
    name: string;
    description: string;
    brand: string;
    price: number;
    retailPrice: number; 
    itemsSold: number;
    category_id: number;
    release_date: string;
    imageUrl: string;
    created_at: string;
    inventory: InventoryInfo[];
    priceHistory: PriceHistoryEntry[];
}

const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const PriceChart = ({ data }: { data: { date: string, price: number }[] }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; price: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const chartData = useMemo(() => data.map(d => ({ ...d, date: new Date(d.date) })).sort((a, b) => a.date.getTime() - b.date.getTime()), [data]);
    const yMin = useMemo(() => chartData.length > 1 ? Math.min(...chartData.map(d => d.price)) * 0.95 : 0, [chartData]);
    const yMax = useMemo(() => chartData.length > 1 ? Math.max(...chartData.map(d => d.price)) * 1.05 : 100, [chartData]);
    const xMin = useMemo(() => chartData.length > 1 ? chartData[0].date.getTime() : 0, [chartData]);
    const xMax = useMemo(() => chartData.length > 1 ? chartData[chartData.length - 1].date.getTime() : 0, [chartData]);
    const yLabels = useMemo(() => {
        if (yMax === 0) return [];
        const labels = [];
        for(let i = 0; i < 5; i++) {
            labels.push(yMin + (i * (yMax - yMin) / 4));
        }
        return labels;
    }, [yMin, yMax]);

    if (chartData.length < 2) {
        return <div className="flex items-center justify-center h-64 text-neutral-500">Not enough data for this period.</div>;
    }

    const chartHeight = 150;
    const chartWidth = 600;
    const toSvgX = (date: Date) => ((date.getTime() - xMin) / (xMax - xMin)) * chartWidth;
    const toSvgY = (price: number) => chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight;
    const path = chartData.map(d => `${toSvgX(d.date)},${toSvgY(d.price)}`).join(" L ");
    const areaPath = `${path} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || xMax === xMin) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = event.clientX;
        const invertedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
        const index = chartData.findIndex(d => toSvgX(d.date) > invertedPoint.x);
        if (index === -1 || index === 0) return;
        const p1 = chartData[index - 1];
        const p2 = chartData[index];
        const x1 = toSvgX(p1.date);
        const y1 = toSvgY(p1.price);
        const x2 = toSvgX(p2.date);
        const y2 = toSvgY(p2.price);
        const weight = (invertedPoint.x - x1) / (x2 - x1);
        const interpolatedY = y1 + weight * (y2 - y1);
        const interpolatedPrice = yMin + ((chartHeight - interpolatedY) / chartHeight) * (yMax - yMin);
        const interpolatedTime = p1.date.getTime() + weight * (p2.date.getTime() - p1.date.getTime());
        const interpolatedDate = new Date(interpolatedTime);
        setTooltip({x: invertedPoint.x, y: interpolatedY, date: interpolatedDate.toISOString(), price: interpolatedPrice});
    };

    return (
        <div className="w-full bg-white rounded-lg p-4 relative" onMouseLeave={() => setTooltip(null)}>
            <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64" onMouseMove={handleMouseMove}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" /><stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {yLabels.map((label, i) => (<g key={i}><line x1="0" y1={toSvgY(label)} x2={chartWidth} y2={toSvgY(label)} stroke="#e5e7eb" strokeWidth="0.5" /><text x="-10" y={toSvgY(label)} dy="3" textAnchor="end" fill="#9ca3af" fontSize="10">${label.toFixed(0)}</text></g>))}
                <path d={`M ${path}`} fill="none" stroke="#10B981" strokeWidth="1.5" /><path d={areaPath} fill="url(#areaGradient)" />
                {tooltip && (<g><line x1={tooltip.x} y1="0" x2={tooltip.x} y2={chartHeight} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 2" /><circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#10B981" stroke="white" strokeWidth="2" /><g transform={`translate(${tooltip.x > chartWidth / 2 ? tooltip.x - 130 : tooltip.x + 8}, 8)`}><rect x="0" y="0" width="120" height="40" rx="4" fill="white" stroke="#e5e7eb" /><text x="10" y="18" fontSize="10" fill="#374151">{new Date(tooltip.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</text><text x="10" y="32" fontSize="10" fontWeight="bold" fill="#1f2937">${tooltip.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</text></g></g>)}
            </svg>
        </div>
    );
};
const TimeframeSelector = ({ onSelect, selected }: { onSelect: (tf: string) => void, selected: string }) => {
    const timeframes = ["7D", "1M", "3M", "6M", "1Y", "All"];
    return (<div className="flex justify-center space-x-2 bg-neutral-100 p-1 rounded-lg">{timeframes.map(tf => (<button key={tf} onClick={() => onSelect(tf)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selected === tf ? 'bg-white text-black shadow-sm' : 'bg-transparent text-neutral-600 hover:text-black'}`}>{tf}</button>))}</div>)
}
const StatCard = ({ title, value, change, icon, iconBg }: { title: string, value: string, change?: string, icon: React.ReactNode, iconBg: string }) => (<div className="bg-white p-4 rounded-lg flex items-center border border-neutral-200"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div><div className="ml-4"><p className="text-sm text-neutral-600">{title}</p><div className="flex items-baseline space-x-2"><p className="text-lg font-bold text-black">{value}</p>{change && <p className="text-xs font-semibold text-green-600">{change}</p>}</div></div></div>)


export default function ItemPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [item, setItem] = useState<ItemDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('All');
    const [filteredPriceHistory, setFilteredPriceHistory] = useState<PriceHistoryEntry[]>([]);
    const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);

    const fetchItemData = async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/api/item?id=${id}`);
            if (!response.ok) {
                throw new Error(`Item not found or network error (${response.status})`);
            }
            const data: ItemDetail = await response.json();
            setItem(data);
            setFilteredPriceHistory(data.priceHistory || []);
            if (data.inventory && data.inventory.length > 0) {
                setSelectedInventoryId(data.inventory[0].inventoryId);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItemData();
    }, [id]);

    useEffect(() => {
        if (!item || !item.priceHistory) {
            setFilteredPriceHistory([]);
            return;
        };
        const now = new Date();
        let startDate = new Date();
        if (timeframe === 'All') {
            setFilteredPriceHistory(item.priceHistory);
            return;
        }
        switch (timeframe) {
            case '7D': startDate.setDate(now.getDate() - 7); break;
            case '1M': startDate.setMonth(now.getMonth() - 1); break;
            case '3M': startDate.setMonth(now.getMonth() - 3); break;
            case '6M': startDate.setMonth(now.getMonth() - 6); break;
            case '1Y': startDate.setFullYear(now.getFullYear() - 1); break;
            default: break;
        }
        const data = item.priceHistory.filter((d: PriceHistoryEntry) => new Date(d.recorded_at) >= startDate);
        setFilteredPriceHistory(data);
    }, [timeframe, item]);

    const formattedReleaseDate = useMemo(() => {
        if (!item?.release_date || item.release_date.startsWith('0001-01-01')) return 'N/A';
        return new Date(item.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }, [item]);

    const lastSale = useMemo(() => {
        if (!item?.priceHistory || item.priceHistory.length === 0) return null;
        const sortedHistory = [...item.priceHistory].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
        if (sortedHistory.length > 0) {
            return sortedHistory[0].price;
        }
        return null;
    }, [item]);

    const displayedPrice = item?.price;

    const pricePremium = useMemo(() => {
        if (lastSale === null || !item?.retailPrice || item.retailPrice === 0) return null;
        const premium = ((lastSale - item.retailPrice) / item.retailPrice) * 100;
        return `${premium > 0 ? '+' : ''}${premium.toFixed(0)}%`;
    }, [lastSale, item]);


    const handleAddToCart = () => {
        if (!item) return;

        const selectedInventoryItem = item.inventory?.find(inv => inv.inventoryId === selectedInventoryId);

        if (item.inventory && item.inventory.length > 0 && !selectedInventoryItem) {
            alert('Please select a size first.');
            return;
        }

        const cartItem = {
            id: item.id,
            inventoryId: selectedInventoryItem ? selectedInventoryItem.inventoryId : item.id,
            name: item.name,
            brand: item.brand,
            size: selectedInventoryItem ? selectedInventoryItem.size : 'One Size',
            price: selectedInventoryItem ? selectedInventoryItem.price : displayedPrice,
            imageUrl: item.imageUrl
        };

        const existingCart = JSON.parse(localStorage.getItem('grailifyCart') || '[]');
        existingCart.push(cartItem);
        localStorage.setItem('grailifyCart', JSON.stringify(existingCart));
        alert(`${item.name} (${cartItem.size}) has been added to your cart.`);
        router.push('/cart');
    };

    if (isLoading) return <div className="text-center py-20">Loading item...</div>;
    if (error) return <div className="text-center text-red-500 py-20">Error: {error}</div>;
    if (!item) return <div className="text-center py-20">Item could not be found.</div>;

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <button onClick={() => router.back()} className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-black mb-6">
                    <BackIcon className="h-4 w-4" /><span>Back to results</span>
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="w-full">
                        <div className="aspect-square bg-white rounded-lg overflow-hidden border border-neutral-200">
                             <img src={item.imageUrl || 'https://placehold.co/800x800/e0e0e0/333?text=No+Image'} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-black tracking-tight">{item.name}</h1>
                        <p className="text-lg text-neutral-600 mt-2">{item.brand}</p>

                        <div className="mt-8 p-4 border border-neutral-200 rounded-lg">
                            <p className="text-sm text-neutral-600">Last Sale</p>
                            <p className="text-2xl font-bold text-black">${displayedPrice ? displayedPrice.toFixed(2) : 'N/A'}</p>
                        </div>

                        {(item.category_id === 1 || item.category_id === 2) && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-neutral-700 mb-2">Select Size</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {item.inventory.map(inv => (
                                        <button
                                            key={inv.inventoryId}
                                            onClick={() => setSelectedInventoryId(inv.inventoryId)}
                                            className={`px-4 py-3 rounded-lg text-center font-semibold border text-sm transition-colors ${selectedInventoryId === inv.inventoryId ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}`}
                                        >
                                            {inv.size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 p-4 border border-neutral-200 rounded-lg">
                            <p className="text-sm text-neutral-600">Release Date</p>
                            <p className="text-lg font-semibold text-black">{formattedReleaseDate}</p>
                        </div>

                        <div className="mt-6 grid grid-cols-1">
                           <button onClick={handleAddToCart} className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-neutral-800">
                                Add to Cart
                           </button>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold">Description</h3>
                            <p className="mt-2 text-neutral-700 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-neutral-50 rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <h2 className="text-2xl font-bold text-center sm:text-left">Price History</h2>
                        <div className="mt-4 sm:mt-0">
                           <TimeframeSelector onSelect={setTimeframe} selected={timeframe} />
                        </div>
                    </div>
                     <div className="mt-6">
                         <PriceChart data={filteredPriceHistory.map(p => ({ date: p.recorded_at, price: p.price }))} />
                    </div>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                       <StatCard title="Last Sale" value={lastSale ? `$${lastSale.toFixed(2)}` : 'N/A'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} iconBg="bg-blue-100" />
                       <StatCard title="Retail Price" value={item.retailPrice ? `$${item.retailPrice.toFixed(2)}` : 'N/A'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} iconBg="bg-purple-100" />
                       <StatCard title="Total Sold" value={item.itemsSold?.toLocaleString() ?? '0'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} iconBg="bg-green-100" />
                       <StatCard title="Price Premium" value={pricePremium ?? '--'} change="vs Retail" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} iconBg="bg-yellow-100" />
                    </div>
                </div>
            </div>
        </div>
    );
}