"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useMemo, useRef, useEffect } from 'react';

const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5"></path>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const PriceChart = ({ data }: { data: { date: string, price: number }[] }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; price: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    
    const yMin = useMemo(() => data.length > 1 ? Math.min(...data.map(d => d.price)) * 0.95 : 0, [data]);
    const yMax = useMemo(() => data.length > 1 ? Math.max(...data.map(d => d.price)) * 1.05 : 0, [data]);
    const xMin = useMemo(() => data.length > 1 ? new Date(data[0].date).getTime() : 0, [data]);
    const xMax = useMemo(() => data.length > 1 ? new Date(data[data.length - 1].date).getTime() : 0, [data]);
    
    const yLabels = useMemo(() => {
        if (data.length < 2) return [];
        const labels = [];
        for(let i = 0; i < 5; i++) {
            labels.push(yMin + (i * (yMax - yMin) / 4));
        }
        return labels;
    }, [yMin, yMax, data.length]);

    if (data.length < 2) {
        return <div className="flex items-center justify-center h-64 text-neutral-500">Not enough data for this period.</div>;
    }

    const chartHeight = 150;
    const chartWidth = 600;

    const toSvgX = (date: string) => ((new Date(date).getTime() - xMin) / (xMax - xMin)) * chartWidth;
    const toSvgY = (price: number) => chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight;

    const path = data.map(d => `${toSvgX(d.date)},${toSvgY(d.price)}`).join(" L ");
    const areaPath = `${path} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = event.clientX;
        const invertedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        
        const closestDataPoint = data.reduce((prev, curr) => 
            Math.abs(toSvgX(curr.date) - invertedPoint.x) < Math.abs(toSvgX(prev.date) - invertedPoint.x) ? curr : prev
        );

        setTooltip({
            x: toSvgX(closestDataPoint.date),
            y: toSvgY(closestDataPoint.price),
            date: closestDataPoint.date,
            price: closestDataPoint.price
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
                        <g transform={`translate(${tooltip.x > chartWidth / 2 ? tooltip.x - 130 : tooltip.x + 8}, ${tooltip.y - 25})`}>
                            <rect x="0" y="0" width="120" height="40" rx="4" fill="white" stroke="#e5e7eb" />
                            <text x="10" y="18" fontSize="10" fill="#374151">
                                {new Date(tooltip.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </text>
                             <text x="10" y="32" fontSize="10" fontWeight="bold" fill="#1f2937">
                                ${tooltip.price.toLocaleString()}
                            </text>
                        </g>
                    </g>
                )}
            </svg>
        </div>
    );
};

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
    <div className="bg-neutral-50 p-4 rounded-lg flex items-center">
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

export default function ItemPage() {
    const router = useRouter();
    const params = useParams();
    const [condition, setCondition] = useState<'new' | 'used'>('new');
    const [timeframe, setTimeframe] = useState('All');
    
    const itemData = useMemo(() => ({
        name: "Jordan 1 Retro High OG",
        brand: "Nike",
        description: "A timeless classic, the Air Jordan 1 High represents the pinnacle of sneaker culture. This edition features premium materials and an iconic colorway that's versatile for any collection.",
        imageUrl: "https://placehold.co/800x800/f0f0f0/333?text=Sneaker",
        prices: {
            new: { lowestAsk: 250, highestBid: 230, lastSale: 245 },
            used: { lowestAsk: 180, highestBid: 165, lastSale: 175 }
        },
        priceHistory: [
            { date: "2023-07-01", price: 210 }, { date: "2023-08-15", price: 215 },
            { date: "2023-09-20", price: 225 }, { date: "2023-10-10", price: 220 },
            { date: "2023-11-05", price: 230 }, { date: "2023-12-20", price: 235 },
            { date: "2024-01-15", price: 220 }, { date: "2024-01-30", price: 225 },
            { date: "2024-02-10", price: 240 }, { date: "2024-02-25", price: 235 },
            { date: "2024-03-05", price: 230 }, { date: "2024-03-20", price: 250 },
            { date: "2024-04-10", price: 260 }, { date: "2024-04-28", price: 275 },
            { date: "2024-05-15", price: 280 }, { date: "2024-05-30", price: 265 },
            { date: "2024-06-01", price: 250 }, { date: "2024-06-05", price: 255 },
            { date: "2024-06-10", price: 252 }, { date: "2024-06-12", price: 258 },
        ]
    }), []);
    
    const [filteredData, setFilteredData] = useState(itemData.priceHistory);

    useEffect(() => {
        const now = new Date();
        let startDate = new Date();
        let data = itemData.priceHistory;

        switch (timeframe) {
            case '7D':
                startDate.setDate(now.getDate() - 7);
                break;
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3M':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6M':
                 startDate.setMonth(now.getMonth() - 6);
                break;
            case '1Y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'All':
            default:
                setFilteredData(itemData.priceHistory);
                return;
        }
        
        data = itemData.priceHistory.filter(d => new Date(d.date) >= startDate);
        setFilteredData(data);
    }, [timeframe, itemData.priceHistory]);

    const currentPrices = itemData.prices[condition];

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <button onClick={() => router.back()} className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-black mb-6">
                    <BackIcon className="h-4 w-4" />
                    <span>Back to results</span>
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="w-full">
                        <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                             <img src={itemData.imageUrl} alt={itemData.name} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-black tracking-tight">{itemData.name}</h1>
                        <p className="text-lg text-neutral-600 mt-2">{itemData.brand}</p>
                        
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-neutral-700">Condition</h3>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <button onClick={() => setCondition('new')} className={`px-4 py-3 rounded-lg text-center font-semibold border ${condition === 'new' ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}`}>
                                    New
                                </button>
                                <button onClick={() => setCondition('used')} className={`px-4 py-3 rounded-lg text-center font-semibold border ${condition === 'used' ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}`}>
                                    Used
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="p-4 border border-neutral-200 rounded-lg">
                                <p className="text-sm text-neutral-600">Lowest Ask</p>
                                <p className="text-2xl font-bold text-black">${currentPrices.lowestAsk}</p>
                            </div>
                            <div className="p-4 border border-neutral-200 rounded-lg">
                                <p className="text-sm text-neutral-600">Highest Bid</p>
                                <p className="text-2xl font-bold text-black">${currentPrices.highestBid}</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                           <button className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-neutral-800">
                                Buy or Bid
                           </button>
                           <button className="w-full bg-white text-black border border-neutral-300 py-4 rounded-lg font-semibold hover:bg-neutral-100">
                                Sell or Ask
                           </button>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold">Description</h3>
                            <p className="mt-2 text-neutral-700 leading-relaxed">{itemData.description}</p>
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
                        <PriceChart data={filteredData} />
                    </div>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                       <StatCard title="Last Sale" value={`$${currentPrices.lastSale}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} iconBg="bg-blue-100" />
                       <StatCard title="Price Premium" value="+15%" change="over retail" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M5 3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z" /></svg>} iconBg="bg-yellow-100" />
                       <StatCard title="Lowest Ask" value={`$${currentPrices.lowestAsk}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>} iconBg="bg-red-100" />
                       <StatCard title="Highest Bid" value={`$${currentPrices.highestBid}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} iconBg="bg-green-100" />
                    </div>
                </div>
            </div>
        </div>
    );
}
