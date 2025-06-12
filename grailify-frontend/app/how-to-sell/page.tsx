import React from 'react';
import Link from 'next/link';

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-3xl font-bold text-black tracking-tight mb-4">{title}</h2>
        <div className="text-lg text-neutral-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function HowToSellPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">How to Sell</h1>
                    <p className="mt-4 text-xl text-neutral-600">Turn your grails into cash with our simple and secure selling process.</p>
                </header>

                <InfoSection title="1. List Your Item">
                    <p>
                        First, find your item in our extensive catalog. Once you've found it, you decide the condition ("New" or "Used") and set your Ask price. This is the price you want to sell your item for. Listing is always free.
                    </p>
                </InfoSection>

                <InfoSection title="2. A Sale Occurs">
                    <p>
                       When a buyer's Bid meets your Ask price, a sale is automatically created. You can also accept an existing Bid on your item at any time to sell instantly. We'll notify you immediately via email and in your account dashboard.
                    </p>
                </InfoSection>

                <InfoSection title="3. Ship to Us">
                    <p>
                        Once your item sells, we'll provide you with a prepaid, pre-addressed shipping label. Simply pack your item securely in a shipping box, attach the label, and drop it off with the designated courier within 2 business days.
                    </p>
                </InfoSection>

                 <InfoSection title="4. Get Paid">
                    <p>
                       Your item will be sent directly to our verification center. After our experts confirm its authenticity and condition, we'll release your payment. Payouts are made directly to your linked bank account or PayPal. It's that easy.
                    </p>
                     <div className="mt-8">
                        <Link href="/sell" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">
                            Start Selling Now
                        </Link>
                    </div>
                </InfoSection>
            </div>
        </div>
    );
}