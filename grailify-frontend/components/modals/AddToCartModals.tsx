"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CheckIcon = () => (
    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

interface CartItemInfo {
    name: string;
    brand: string;
    size: string;
    price: number | null;
    imageUrl: string;
}

interface Props {
    item: CartItemInfo;
    onClose: () => void;
}

export default function AddToCartModal({ item, onClose }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); 
    };

    return (
        <div 
            onClick={handleClose}
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'}`}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                            <CheckIcon />
                            <h2 className="text-xl font-semibold text-gray-800">Added to Cart</h2>
                        </div>
                        <button onClick={handleClose} className="p-1 rounded-full hover:bg-neutral-100">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <div className="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">{item.brand}</p>
                            <h3 className="font-medium text-black">{item.name}</h3>
                            <p className="text-sm text-neutral-600 mt-1">Size: {item.size}</p>
                            <p className="text-lg font-bold text-black mt-2">${item.price ? item.price.toFixed(2) : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/cart" className="w-full bg-black text-white py-3 rounded-lg font-semibold text-center hover:bg-neutral-800 transition-colors">
                            View Cart
                        </Link>
                        <button 
                            onClick={handleClose} 
                            className="w-full bg-white text-black border border-neutral-300 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}