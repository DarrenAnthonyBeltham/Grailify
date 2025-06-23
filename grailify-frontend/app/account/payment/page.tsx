"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type PaymentMethod = {
    id: number;
    cardType: string;
    lastFourDigits: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
};

const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function PaymentMethodsPage() {
    const router = useRouter();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchPaymentMethods = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            setPaymentMethods(data.paymentMethods || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const handlePaymentAdded = () => {
        fetchPaymentMethods();
        setShowModal(false);
    };

    const handleDelete = async (paymentId: number) => {
        if (window.confirm('Are you sure you want to delete this payment method?')) {
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch(`http://localhost:8080/api/payment-methods/${paymentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to delete payment method.');
                setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentId));
            } catch (error) {
                console.error(error);
                alert('Could not delete payment method.');
            }
        }
    };

    return (
        <>
            <div className="bg-neutral-50 min-h-screen">
                <div className="container mx-auto px-4 py-12">
                    <header className="mb-8">
                        <button onClick={() => router.back()} className="text-sm text-neutral-600 hover:text-black mb-4 inline-flex items-center">
                           &larr; <span className="ml-1">Back to Account</span>
                        </button>
                        <h1 className="text-4xl font-bold text-black tracking-tight">My Payment Methods</h1>
                        <p className="mt-1 text-lg text-neutral-600">Manage your saved cards.</p>
                    </header>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => setShowModal(true)} className="flex items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-neutral-800 transition-colors shadow-sm">
                            <AddIcon/> Add New Card
                        </button>
                    </div>
                    {isLoading ? <p>Loading payment methods...</p> : paymentMethods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {paymentMethods.map(pm => (
                                <PaymentCard key={pm.id} paymentMethod={pm} onDelete={() => handleDelete(pm.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                            <p className="text-neutral-500">You haven't added any payment methods yet.</p>
                        </div>
                    )}
                </div>
            </div>
            {showModal && <PaymentFormModal onClose={() => setShowModal(false)} onPaymentAdded={handlePaymentAdded} />}
        </>
    );
}

const PaymentCard = ({ paymentMethod, onDelete }: { paymentMethod: PaymentMethod, onDelete: () => void }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200/80">
        <div className="flex justify-between items-start">
            <p className="font-semibold text-lg text-black">{paymentMethod.cardType} ending in {paymentMethod.lastFourDigits}</p>
            {paymentMethod.isDefault && <span className="text-xs font-bold text-green-700 bg-green-100 py-1 px-2 rounded-full">Default</span>}
        </div>
        <p className="text-neutral-600 mt-2">Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}</p>
        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center space-x-4">
            <button className="text-sm font-semibold text-black hover:underline disabled:text-neutral-400 disabled:no-underline" disabled>Edit</button>
            <button onClick={onDelete} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
        </div>
    </div>
);

const PaymentFormModal = ({ onClose, onPaymentAdded }: { onClose: () => void, onPaymentAdded: () => void }) => {
    const [formData, setFormData] = useState({ cardType: 'Visa', lastFourDigits: '', expiryMonth: '', expiryYear: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://localhost:8080/api/payment-methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to save payment method.');
            onPaymentAdded();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Add New Card</h2><button onClick={onClose}><CloseIcon /></button></div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" onChange={e => setFormData({...formData, lastFourDigits: e.target.value.slice(-4)})} placeholder="Card Number" required maxLength={19} className="w-full px-3 py-2 border rounded-md" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" onChange={e => setFormData({...formData, expiryMonth: e.target.value})} placeholder="MM" required maxLength={2} className="w-full px-3 py-2 border rounded-md" />
                            <input type="text" onChange={e => setFormData({...formData, expiryYear: e.target.value})} placeholder="YYYY" required maxLength={4} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <select onChange={e => setFormData({...formData, cardType: e.target.value})} className="w-full px-3 py-2 border rounded-md bg-white"><option>Visa</option><option>MasterCard</option></select>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-black text-white">{isLoading ? 'Saving...' : 'Save Card'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};