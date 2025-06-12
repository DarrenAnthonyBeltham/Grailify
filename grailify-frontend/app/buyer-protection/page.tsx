import React from 'react';

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-3xl font-bold text-black tracking-tight mb-4">{title}</h2>
        <div className="text-lg text-neutral-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function BuyerProtectionPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Buyer Protection Policy</h1>
                    <p className="mt-4 text-xl text-neutral-600">Your purchase is protected, from click to delivery.</p>
                </header>

                <InfoSection title="Comprehensive Coverage">
                    <p>
                        The Grailify Buyer Protection policy ensures you are covered in the rare event that your order does not meet our standards. We guarantee that you will receive the item you ordered, in the condition described, and that it is 100% authentic.
                    </p>
                </InfoSection>

                <InfoSection title="What We Cover">
                    <p>
                        You are fully protected if your item is:
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li>Determined to be a replica or not authentic.</li>
                            <li>The wrong item or size.</li>
                            <li>Not in the condition it was described (e.g., listed as "New" but shows signs of wear).</li>
                            <li>Lost or damaged in transit from Grailify to you.</li>
                        </ul>
                    </p>
                </InfoSection>

                <InfoSection title="Resolution Process">
                    <p>
                        If you believe your order has an issue, please contact our support team within 3 days of receiving it. Provide your order number and photos of the issue. Our team will investigate promptly.
                    </p>
                     <p>
                        If we determine that your claim is valid, we will work with you to arrange a return and issue a full refund to your original payment method. Our goal is to make every transaction safe and satisfactory.
                    </p>
                </InfoSection>
            </div>
        </div>
    );
}