import React from 'react';

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-3xl font-bold text-black tracking-tight mb-4">{title}</h2>
        <div className="text-lg text-neutral-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function SellerFeesPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Seller Fees</h1>
                    <p className="mt-4 text-xl text-neutral-600">Transparent pricing so you always know what you'll earn.</p>
                </header>

                <InfoSection title="Commission Fee">
                    <p>
                        Our standard commission fee is a flat <strong>9.5%</strong> of the final sale price. This fee helps us operate our marketplace, invest in our verification process, and provide top-tier customer support.
                    </p>
                </InfoSection>

                <InfoSection title="Payment Processing Fee">
                    <p>
                       A payment processing fee of <strong>3.0%</strong> is applied to every sale to cover the costs charged by our payment partners for secure transaction handling.
                    </p>
                </InfoSection>

                <InfoSection title="Example Payout">
                    <p>
                        Let's say you sell a pair of sneakers for <strong>300</strong>.
                        <ul className="list-disc list-inside mt-4 space-y-2 text-base">
                            <li>Sale Price: $300.00</li>
                            <li>Commission Fee (9.5%): -$28.50</li>
                            <li>Payment Processing (3.0%): -$9.00</li>
                            <li className="font-bold border-t pt-2 mt-2">Your Total Payout: $262.50</li>
                        </ul>
                    </p>
                     <p className="text-sm text-neutral-500 mt-4">
                        Please note: Shipping your item to our verification center is always free for you. We provide a prepaid label for every sale.
                    </p>
                </InfoSection>
            </div>
        </div>
    );
}
