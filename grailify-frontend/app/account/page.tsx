import React from 'react';
import Link from 'next/link';

const DashboardCard = ({ title, children, href, linkText }: { title: string; children: React.ReactNode; href: string; linkText: string; }) => (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
        <h3 className="font-bold text-xl text-black">{title}</h3>
        <div className="mt-4 text-neutral-600">
            {children}
        </div>
        <div className="mt-6">
            <Link href={href} className="font-semibold text-black hover:underline">
                {linkText} &rarr;
            </Link>
        </div>
    </div>
);

export default function AccountPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-black tracking-tight">My Account</h1>
                    <p className="mt-2 text-lg text-neutral-600">Welcome back, Darren.</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <DashboardCard title="Profile" href="/account/profile" linkText="Edit Profile">
                        <p>Manage your personal information, password, and preferences.</p>
                    </DashboardCard>
                    <DashboardCard title="Buying" href="/account/buying" linkText="View Purchases">
                        <p>Track your current orders and view your complete purchase history.</p>
                    </DashboardCard>
                    <DashboardCard title="Selling" href="/account/selling" linkText="View Listings">
                        <p>Manage your active listings, pending sales, and payout information.</p>
                    </DashboardCard>
                     <DashboardCard title="Addresses" href="/account/addresses" linkText="Manage Addresses">
                        <p>Add or edit your shipping and billing addresses.</p>
                    </DashboardCard>
                     <DashboardCard title="Payment Methods" href="/account/payments" linkText="Manage Payments">
                        <p>Update your credit cards and other payment options.</p>
                    </DashboardCard>
                     <DashboardCard title="Help & Support" href="/help-center" linkText="Visit Help Center">
                        <p>Find answers to your questions or get in touch with our team.</p>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
}
