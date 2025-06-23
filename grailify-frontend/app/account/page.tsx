"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AddressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PaymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

type User = { id: number; username: string; email: string; };
type Address = { id: number; type: 'shipping' | 'billing'; addressLine1: string; city: string; postalCode: string; country: string; isDefault: boolean; };
type PaymentMethod = { id: number; cardType: string; lastFourDigits: string; expiryMonth: string; expiryYear: string; isDefault: boolean; };
type OrderItem = { itemName: string; itemImageUrl: string; };
type Order = { id: number; createdAt: string; totalAmount: number; status: string; items: OrderItem[] };
type ProfileData = { user: User; addresses: Address[]; paymentMethods: PaymentMethod[]; orderHistory: Order[]; };

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/login');
                return;
            }
            
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8080/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('authToken');
                        router.push('/login');
                    }
                    throw new Error('Failed to fetch profile data.');
                }
                const data = await response.json();
                setProfileData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);
    
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        router.push('/');
    };

    const renderContent = () => {
        if (isLoading) return <div className="text-center text-neutral-500">Loading your profile...</div>;
        if (error) return <div className="text-center text-red-500">{error}</div>;
        if (!profileData) return null;

        switch (activeTab) {
            case 'profile': 
                return <ProfileContent user={profileData.user} />;
            case 'addresses': 
                return <AddressContent addresses={profileData.addresses || []} />;
            case 'payment': 
                return <PaymentContent paymentMethods={profileData.paymentMethods || []} />;
            case 'history': 
                return <HistoryContent orders={profileData.orderHistory || []} />;
            default: 
                return null;
        }
    };

    return (
        <div className="bg-neutral-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-black tracking-tight">My Account</h1>
                    <p className="mt-1 text-lg text-neutral-600">Manage your profile, orders, and settings.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1">
                        <nav className="space-y-1 bg-white p-2 rounded-xl shadow-sm border border-neutral-200/50">
                            <TabButton icon={<UserIcon />} label="Profile" name="profile" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton icon={<AddressIcon />} label="Addresses" name="addresses" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton icon={<PaymentIcon />} label="Payment" name="payment" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton icon={<HistoryIcon />} label="Order History" name="history" activeTab={activeTab} onClick={setActiveTab} />
                            <div className="pt-2 mt-2 border-t border-neutral-200">
                                <TabButton icon={<LogoutIcon />} label="Log Out" name="logout" activeTab={activeTab} onClick={handleLogout} />
                            </div>
                        </nav>
                    </aside>
                    <main className="lg:col-span-3">
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-neutral-200/50">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

const TabButton = ({ icon, label, name, activeTab, onClick }: { icon: React.ReactNode, label: string, name: string, activeTab: string, onClick: (name: string) => void }) => (
    <button
        onClick={() => onClick(name)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${
            activeTab === name
                ? 'bg-black text-white shadow-inner'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const SectionHeader = ({ title, actionLabel, onAction }: { title: string, actionLabel?: React.ReactNode, onAction?: () => void }) => (
    <div className="pb-4 border-b border-neutral-200 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-black">{title}</h2>
        {actionLabel && (
             typeof actionLabel === 'string' ? 
             <button onClick={onAction} className="text-sm font-semibold text-black hover:underline">{actionLabel}</button> : 
             actionLabel
        )}
    </div>
);

const ProfileContent = ({ user }: { user: User }) => (
    <div>
        <SectionHeader title="My Profile" actionLabel="Edit Profile" />
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-neutral-600">Username</label>
                <p className="mt-1 text-base text-black">{user.username}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-600">Email Address</label>
                <p className="mt-1 text-base text-black">{user.email}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-600">Password</label>
                <button className="mt-1 text-sm font-semibold text-black hover:underline">Change Password</button>
            </div>
        </div>
    </div>
);

const AddressContent = ({ addresses }: { addresses: Address[] }) => (
    <div>
        <SectionHeader 
            title="My Addresses" 
            actionLabel={
                <Link href="/account/addresses" className="text-sm font-semibold text-black hover:underline">+ Manage Addresses</Link>
            } 
        />
        {addresses.length > 0 ? (
            <div className="space-y-4">
                {addresses.slice(0, 1).map(addr => (
                    <div key={addr.id} className="p-4 border border-neutral-200 rounded-lg">
                        <p className="font-semibold text-black">{addr.type === 'shipping' ? 'Default Shipping' : 'Default Billing'}</p>
                        <p className="text-neutral-600 mt-1">{addr.addressLine1}</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-6">
                <p className="text-neutral-500 mb-4">You haven't added any addresses yet.</p>
                <Link href="/account/addresses">
                    <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold text-sm">Add Address</button>
                </Link>
            </div>
        )}
    </div>
);

const PaymentContent = ({ paymentMethods }: { paymentMethods: PaymentMethod[] }) => (
    <div>
        <SectionHeader 
            title="Payment Methods" 
            actionLabel={
                <Link href="/account/payment" className="text-sm font-semibold text-black hover:underline">+ Manage Payment</Link>
            }
        />
         {paymentMethods.length > 0 ? (
            <div className="space-y-4">
                {paymentMethods.slice(0, 1).map(pm => (
                    <div key={pm.id} className="p-4 border border-neutral-200 rounded-lg">
                        <p className="font-semibold text-black">{pm.cardType} ending in {pm.lastFourDigits}</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-6">
                <p className="text-neutral-500 mb-4">You haven't added any payment methods yet.</p>
                <Link href="/account/payment">
                    <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold text-sm">Add Payment</button>
                </Link>
            </div>
        )}
    </div>
);

const HistoryContent = ({ orders }: { orders: Order[] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 8;
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div>
            <SectionHeader title="Order History" />
            {orders.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {currentOrders.map(order => (
                            <div key={order.id} className="p-4 border border-neutral-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-black">Order #{order.id}</p>
                                        <p className="text-sm text-neutral-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-black">${order.totalAmount.toFixed(2)}</p>
                                        <p className="text-sm text-green-600 font-medium">{order.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm">
                                Previous
                            </button>
                            <span className="text-sm text-neutral-600">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm">
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-10">
                    <p className="text-neutral-500">You have no order history.</p>
                </div>
            )}
        </div>
    );
};
