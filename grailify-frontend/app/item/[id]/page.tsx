"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo, useRef } from 'react';

// Interfaces (no changes)
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
    release_date: string;
    imageUrl: string;
    created_at: string;
    priceHistory: PriceHistoryEntry[];
}

const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5"></path>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const TimeframeSelector = ({ onSelect, selected }: { onSelect: (tf: string) => void, selected: string }) => {
    const timeframes = ["7D", "1M", "3M", "6M", "1Y", "All"];
    return (
        <div className="flex justify-center space-x-2 bg-neutral-100 p-1 rounded-lg">
            {timeframes.map(tf => (
                <button key={tf} onClick={() => onSelect(tf)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selected === tf ? 'bg-white text-black shadow-sm' : 'bg-transparent text-neutral-600 hover:text-black'}`}>
                    {tf}
                </button>
            ))}
        </div>
    )
}
const StatCard = ({ title, value, change, icon, iconBg }: { title: string, value: string, change?: string, icon: React.ReactNode, iconBg: string }) => (
    <div className="bg-white p-4 rounded-lg flex items-center border border-neutral-200">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-neutral-600">{title}</p>
            <div className="flex items-baseline space-x-2">
                 <p className="text-lg font-bold text-black">{value}</p>
                 {change && <p className="text-xs font-semibold text-green-600">{change}</p>}
            </div>
        </div>
    </div>
)

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

        setTooltip({
            x: invertedPoint.x,
            y: interpolatedY,
            date: interpolatedDate.toISOString(),
            price: interpolatedPrice
        });
    };

    return (
        <div className="w-full bg-white rounded-lg p-4 relative" onMouseLeave={() => setTooltip(null)}>
            <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64" onMouseMove={handleMouseMove}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {yLabels.map((label, i) => (
                    <g key={i}>
                         <line x1="0" y1={toSvgY(label)} x2={chartWidth} y2={toSvgY(label)} stroke="#e5e7eb" strokeWidth="0.5" />
                         <text x="-10" y={toSvgY(label)} dy="3" textAnchor="end" fill="#9ca3af" fontSize="10">${label.toFixed(0)}</text>
                    </g>
                ))}
                <path d={`M ${path}`} fill="none" stroke="#10B981" strokeWidth="1.5" />
                <path d={areaPath} fill="url(#areaGradient)" />
                {tooltip && (
                    <g>
                        <line x1={tooltip.x} y1="0" x2={tooltip.x} y2={chartHeight} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 2" />
                        <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#10B981" stroke="white" strokeWidth="2" />
                        <g transform={`translate(${tooltip.x > chartWidth / 2 ? tooltip.x - 130 : tooltip.x + 8}, 8)`}>
                            <rect x="0" y="0" width="120" height="40" rx="4" fill="white" stroke="#e5e7eb" />
                            <text x="10" y="18" fontSize="10" fill="#374151">
                                {new Date(tooltip.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </text>
                             <text x="10" y="32" fontSize="10" fontWeight="bold" fill="#1f2937">
                                ${tooltip.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </text>
                        </g>
                    </g>
                )}
            </svg>
        </div>
    );
};

export default function ItemPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params; 

    const [item, setItem] = useState<ItemDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('All');
    const [filteredPriceHistory, setFilteredPriceHistory] = useState<PriceHistoryEntry[]>([]);

    useEffect(() => {
        if (!id) return;

        const fetchItemData = async () => {
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
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

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
        
        const data = item.priceHistory.filter(d => new Date(d.recorded_at) >= startDate);
        setFilteredPriceHistory(data);
    }, [timeframe, item]);

    const formattedReleaseDate = useMemo(() => {
        if (!item?.release_date || item.release_date.startsWith('0001-01-01')) return 'N/A';
        return new Date(item.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }, [item]);
    
    const lastSale = useMemo(() => {
        if (!filteredPriceHistory || filteredPriceHistory.length === 0) return null;
        return filteredPriceHistory[filteredPriceHistory.length - 1].price;
    }, [filteredPriceHistory]);

    const tradeCount = useMemo(() => {
        return item?.priceHistory?.length || 0;
    }, [item]);


    if (isLoading) return <div className="text-center py-20">Loading item...</div>;
    if (error) return <div className="text-center text-red-500 py-20">Error: {error}</div>;
    if (!item) return <div className="text-center py-20">Item could not be found.</div>;

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <button onClick={() => router.back()} className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-black mb-6">
                    <BackIcon className="h-4 w-4" />
                    <span>Back to results</span>
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
                            <p className="text-sm text-neutral-600">Current Price</p>
                            <p className="text-2xl font-bold text-black">${item.price.toFixed(2)}</p>
                        </div>

                         <div className="mt-4 p-4 border border-neutral-200 rounded-lg">
                            <p className="text-sm text-neutral-600">Release Date</p>
                            <p className="text-lg font-semibold text-black">{formattedReleaseDate}</p>
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
                       <StatCard title="Retail Price" value={`$${item.price.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z" /></svg>} iconBg="bg-yellow-100" />
                       <StatCard title="Volatility" value="--" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>} iconBg="bg-red-100" />
                       <StatCard title="Trades" value={tradeCount.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} iconBg="bg-green-100" />
                    </div>
                </div>
            </div>
        </div>
    );
}