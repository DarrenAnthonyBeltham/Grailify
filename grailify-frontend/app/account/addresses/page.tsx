"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Address = {
    id: number;
    type: 'shipping' | 'billing';
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvinceRegion: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
    isDefault: boolean;
};

const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function AddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = async () => {
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
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            setAddresses(data.addresses || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleOpenForm = (address: Address | null = null) => {
        setEditingAddress(address);
        setShowFormModal(true);
    };

    const handleCloseForm = () => {
        setEditingAddress(null);
        setShowFormModal(false);
    };

    const handleAddressSaved = () => {
        fetchAddresses();
        handleCloseForm();
    };

    const handleDelete = async (addressId: number) => {
        const isConfirmed = window.confirm('Are you sure you want to delete this address? This action cannot be undone.');
        if (isConfirmed) {
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch(`http://localhost:8080/api/addresses/${addressId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to delete address.');
                setAddresses(prev => prev.filter(addr => addr.id !== addressId));
            } catch (error) {
                console.error(error);
                alert('Could not delete address.');
            }
        }
    };

    return (
        <>
            <div className="bg-neutral-50 min-h-screen">
                <div className="container mx-auto px-4 py-12">
                    <header className="mb-8">
                        <button onClick={() => router.back()} className="text-sm font-medium text-neutral-600 hover:text-black mb-4 inline-flex items-center">
                            &larr; <span className="ml-1">Back to Account</span>
                        </button>
                        <h1 className="text-4xl font-bold text-black tracking-tight">My Addresses</h1>
                        <p className="mt-1 text-lg text-neutral-600">Manage your shipping and billing addresses.</p>
                    </header>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => handleOpenForm()} className="flex items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-neutral-800 transition-colors shadow-sm">
                            <AddIcon/>
                            Add New Address
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-16"><p>Loading addresses...</p></div>
                    ) : addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addresses.map(addr => (
                                <AddressCard key={addr.id} address={addr} onEdit={() => handleOpenForm(addr)} onDelete={() => handleDelete(addr.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                            <p className="text-neutral-500">You haven't added any addresses yet.</p>
                        </div>
                    )}
                </div>
            </div>
            {showFormModal && <AddressFormModal address={editingAddress} onClose={handleCloseForm} onAddressSaved={handleAddressSaved} />}
        </>
    );
}

const AddressCard = ({ address, onEdit, onDelete }: { address: Address, onEdit: () => void, onDelete: () => void }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200/80 transition-all duration-300 ease-in-out hover:shadow-md hover:border-neutral-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg text-black">{address.fullName}</p>
                {address.isDefault && <span className="text-xs font-bold text-green-700 bg-green-100 py-1 px-2 rounded-full mt-1 inline-block">Default</span>}
            </div>
            <span className="text-sm font-medium text-neutral-600 capitalize">{address.type}</span>
        </div>
        <div className="mt-4 text-neutral-700 space-y-1">
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.stateProvinceRegion} {address.postalCode}</p>
            <p>{address.country}</p>
            {address.phoneNumber && <p>Phone: {address.phoneNumber}</p>}
        </div>
        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center space-x-4">
            <button onClick={onEdit} className="text-sm font-semibold text-black hover:underline">Edit</button>
            <button onClick={onDelete} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
        </div>
    </div>
);

const AddressFormModal = ({ address, onClose, onAddressSaved }: { address: Address | null, onClose: () => void, onAddressSaved: () => void }) => {
    const [formData, setFormData] = useState({
        type: address?.type || 'shipping',
        fullName: address?.fullName || '',
        addressLine1: address?.addressLine1 || '',
        addressLine2: address?.addressLine2 || '',
        city: address?.city || '',
        stateProvinceRegion: address?.stateProvinceRegion || '',
        postalCode: address?.postalCode || '',
        country: address?.country || '',
        phoneNumber: address?.phoneNumber || '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('authToken');
        const isEditing = !!address;
        const url = isEditing ? `http://localhost:8080/api/addresses/${address.id}` : 'http://localhost:8080/api/addresses';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to save address.');
            onAddressSaved();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'bg-opacity-60' : 'bg-opacity-0'}`}>
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">{address ? 'Edit Address' : 'Add a New Address'}</h2>
                        <button onClick={handleClose} className="p-1 rounded-full hover:bg-neutral-100"><CloseIcon /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-black">
                                <option value="shipping">Shipping</option>
                                <option value="billing">Billing</option>
                            </select>
                        </div>
                        <input type="text" name="addressLine1" placeholder="Address Line 1" value={formData.addressLine1} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                         <input type="text" name="addressLine2" placeholder="Address Line 2 (Optional)" value={formData.addressLine2} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                            <input type="text" name="stateProvinceRegion" placeholder="State / Province" value={formData.stateProvinceRegion} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                        </div>
                         <input type="text" name="phoneNumber" placeholder="Phone Number (Optional)" value={formData.phoneNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black" />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border hover:bg-neutral-100">Cancel</button>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-400">
                                {isLoading ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};