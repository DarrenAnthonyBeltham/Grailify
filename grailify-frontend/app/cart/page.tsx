"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
    id: number;
    inventoryId: number;
    name: string;
    brand: string;
    size: string;
    price: number;
    imageUrl: string;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        const storedCart = localStorage.getItem('grailifyCart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    const removeFromCart = (inventoryIdToRemove: number) => {
        const updatedCart = cartItems.filter(item => item.inventoryId !== inventoryIdToRemove);
        setCartItems(updatedCart);
        localStorage.setItem('grailifyCart', JSON.stringify(updatedCart));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const shipping = 15.00;
    const taxes = subtotal * 0.08; // 8% tax example
    const total = subtotal + shipping + taxes;

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-center text-black tracking-tight mb-12">Your Cart</h1>
                
                {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-neutral-600 text-lg">Your cart is empty.</p>
                        <Link href="/browse/allgrails" className="mt-4 inline-block text-blue-600 hover:underline">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.inventoryId} className="flex items-center p-4 border border-neutral-200 rounded-lg">
                                    <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-contain bg-neutral-100 rounded-md" />
                                    <div className="ml-4 flex-grow">
                                        <p className="font-semibold text-black">{item.name}</p>
                                        <p className="text-sm text-neutral-500">{item.brand}</p>
                                        <p className="text-sm text-neutral-500">Size: {item.size}</p>
                                        <p className="mt-2 font-bold text-black">${item.price.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.inventoryId)} className="text-sm text-red-600 hover:underline">
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border border-neutral-200 rounded-lg p-6 h-fit">
                             <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-neutral-600"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
                                <div className="flex justify-between text-neutral-600"><span>Taxes</span><span>${taxes.toFixed(2)}</span></div>
                                <div className="border-t border-neutral-200 my-4"></div>
                                <div className="flex justify-between font-bold text-black text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                            </div>
                            <div className="mt-6">
                                <button onClick={() => router.push('/checkout')} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}