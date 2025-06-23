"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SuccessIcon = () => (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

interface Props {
    orderId: number | string;
    onClose: () => void;
}

export default function OrderSuccessModal({ orderId, onClose }: Props) {
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
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'bg-opacity-60' : 'bg-opacity-0'}`}>
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md text-center p-6 sm:p-8"
            >
                <SuccessIcon />
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">Order Placed!</h2>
                <p className="mt-2 text-neutral-600">
                    Thank you for your purchase. Your order #{orderId} has been successfully placed.
                </p>
                <div className="mt-8 space-y-3">
                    <Link href="/account" className="block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors">
                        View Order History
                    </Link>
                    <button 
                        onClick={handleClose} 
                        className="w-full bg-white text-black border border-neutral-300 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </motion.div>
        </div>
    );
}