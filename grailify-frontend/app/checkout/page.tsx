"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        // --- Authentication Check ---
        const token = localStorage.getItem('authToken');
        if (!token) {
            // If no token, redirect to login page after a short delay
            setTimeout(() => {
                router.push('/login');
            }, 2000); // 2-second delay to show the message
        } else {
            setIsLoggedIn(true);
        }
    }, [router]);

    // Show a loading or redirection message until the check is complete
    if (isLoggedIn === null || !isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <h2 className="text-2xl font-semibold text-black">Redirecting...</h2>
                <p className="mt-2 text-neutral-600">You must be logged in to access the checkout page.</p>
            </div>
        );
    }

    // --- Main Checkout Page Content ---
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12 lg:py-24">
                <h1 className="text-4xl font-bold text-center text-black tracking-tight mb-12">Checkout</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                    
                    {/* Left Column: Shipping and Payment */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address */}
                        <div className="border border-neutral-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="First Name" className="w-full p-3 border rounded-md" />
                                <input type="text" placeholder="Last Name" className="w-full p-3 border rounded-md" />
                                <input type="text" placeholder="Address" className="sm:col-span-2 w-full p-3 border rounded-md" />
                                <input type="text" placeholder="City" className="w-full p-3 border rounded-md" />
                                <input type="text" placeholder="State / Province" className="w-full p-3 border rounded-md" />
                                <input type="text" placeholder="ZIP / Postal Code" className="w-full p-3 border rounded-md" />
                                <input type="text" placeholder="Country" className="w-full p-3 border rounded-md" />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="border border-neutral-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="space-y-4">
                                <input type="text" placeholder="Card Number" className="w-full p-3 border rounded-md" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="MM / YY" className="w-full p-3 border rounded-md" />
                                    <input type="text" placeholder="CVC" className="w-full p-3 border rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="border border-neutral-200 rounded-lg p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between text-neutral-600">
                                <span>Subtotal</span>
                                <span>$1,000.00</span>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                                <span>Shipping</span>
                                <span>$15.00</span>
                            </div>
                             <div className="flex justify-between text-neutral-600">
                                <span>Taxes</span>
                                <span>$85.00</span>
                            </div>
                            <div className="border-t border-neutral-200 my-4"></div>
                             <div className="flex justify-between font-bold text-black text-lg">
                                <span>Total</span>
                                <span>$1,100.00</span>
                            </div>
                        </div>
                        <div className="mt-6">
                             <input type="text" placeholder="Coupon Code" className="w-full p-3 border rounded-md mb-4" />
                             <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors">
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}