import React from 'react';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default function StartSellingPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-2xl">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">What are you selling?</h1>
                    <p className="mt-4 text-xl text-neutral-600">
                        Search for your item in our catalog to get started. You can search by brand, name, SKU, or keyword.
                    </p>
                    <div className="mt-8 max-w-lg mx-auto">
                         <div className="relative">
                           <input
                            type="search"
                            placeholder="e.g. Jordan 1 Retro High OG"
                            className="w-full h-14 pl-14 pr-4 text-lg rounded-full border-2 border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                           />
                           <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <SearchIcon className="h-6 w-6 text-neutral-500" />
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}