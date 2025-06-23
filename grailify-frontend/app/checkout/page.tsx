"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderSuccessModal from '@/components/modals/OrderSuccessModal'; 

type CartItem = { id: number; inventoryId: number; name: string; brand: string; size: string; price: number; imageUrl: string; };
type Address = { id: number; fullName: string; addressLine1: string; };
type PaymentMethod = { id: number; cardType: string; lastFourDigits: string; };
type ProfileData = { addresses: Address[]; paymentMethods: PaymentMethod[]; };

export default function CheckoutPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccessInfo, setOrderSuccessInfo] = useState<{ orderId: number | string } | null>(null);

    useEffect(() => {
        const storedCart = localStorage.getItem('grailifyCart');
        setCartItems(storedCart ? JSON.parse(storedCart) : []);

        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Could not load user data.');
                const data = await response.json();
                setProfileData(data);
                if (data.addresses && data.addresses.length > 0) {
                    setSelectedAddressId(data.addresses[0].id.toString());
                }
                if (data.paymentMethods && data.paymentMethods.length > 0) {
                    setSelectedPaymentId(data.paymentMethods[0].id.toString());
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const shipping = 15.00;
    const taxes = subtotal * 0.08;
    const total = subtotal + shipping + taxes;

    const handlePlaceOrder = async () => {
        if (!selectedAddressId || !selectedPaymentId) {
            setError('Please select a shipping address and payment method.');
            return;
        }
        setIsPlacingOrder(true);
        setError('');
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    cartItems: cartItems,
                    totalAmount: total,
                    shippingAddressId: parseInt(selectedAddressId),
                    paymentMethodId: parseInt(selectedPaymentId),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to place order.');
            }

            localStorage.removeItem('grailifyCart');
            setOrderSuccessInfo({ orderId: data.orderId });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-20">Loading Checkout...</div>;
    }

    return (
        <>
            {orderSuccessInfo && (
                <OrderSuccessModal 
                    orderId={orderSuccessInfo.orderId}
                    onClose={() => router.push('/')} 
                />
            )}
            <div className="bg-white">
                <div className="container mx-auto px-4 py-12 lg:py-24">
                    <h1 className="text-4xl font-bold text-center text-black tracking-tight mb-12">Checkout</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="border border-neutral-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                                {profileData && profileData.addresses && profileData.addresses.length > 0 ? (
                                    <select value={selectedAddressId} onChange={e => setSelectedAddressId(e.target.value)} className="w-full p-3 border rounded-md bg-white">
                                        {profileData.addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.fullName} - {addr.addressLine1}
                                            </option>
                                        ))}
                                    </select>
                                ) : <p>No addresses found. <Link href="/account/addresses" className="text-blue-600">Add one</Link>.</p>}
                            </div>

                            <div className="border border-neutral-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                                {profileData && profileData.paymentMethods && profileData.paymentMethods.length > 0 ? (
                                    <select value={selectedPaymentId} onChange={e => setSelectedPaymentId(e.target.value)} className="w-full p-3 border rounded-md bg-white">
                                        {profileData.paymentMethods.map(pm => (
                                            <option key={pm.id} value={pm.id}>
                                                {pm.cardType} ending in {pm.lastFourDigits}
                                            </option>
                                        ))}
                                    </select>
                                ) : <p>No payment methods found. <Link href="/account/payment" className="text-blue-600">Add one</Link>.</p>}
                            </div>
                        </div>

                        <div className="border border-neutral-200 rounded-lg p-6 h-fit">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.inventoryId} className="flex justify-between text-sm">
                                        <span>{item.name}</span>
                                        <span>${item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-neutral-600"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
                                <div className="flex justify-between text-neutral-600"><span>Taxes</span><span>${taxes.toFixed(2)}</span></div>
                                <div className="border-t border-neutral-200 my-4"></div>
                                <div className="flex justify-between font-bold text-black text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                            </div>
                            <div className="mt-6">
                                {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}
                                <button onClick={handlePlaceOrder} disabled={isPlacingOrder || cartItems.length === 0} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:bg-neutral-400">
                                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}