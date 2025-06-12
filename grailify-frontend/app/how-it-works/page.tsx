import React from 'react';

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-3xl font-bold text-black tracking-tight mb-4">{title}</h2>
        <div className="text-lg text-neutral-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function HowItWorksPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">How It Works</h1>
                    <p className="mt-4 text-xl text-neutral-600">A seamless, secure process for buying and selling authentic grails.</p>
                </header>

                <InfoSection title="1. For Buyers">
                    <p>
                        Discover thousands of curated items from top brands. When you're ready to purchase, simply place a bid or buy instantly at the lowest Ask price. All items are shipped to Grailify first for a rigorous authenticity and quality check by our in-house experts.
                    </p>
                    <p>
                        Once your item is verified, we'll ship it directly to you with our Grailify tag of authenticity. You can shop with complete confidence, knowing every piece is 100% authentic.
                    </p>
                </InfoSection>

                <InfoSection title="2. For Sellers">
                    <p>
                        Selling your grails has never been easier. List your item on our marketplace by setting an Ask price—the price you're willing to sell for. When a buyer's bid matches your Ask, the sale is automatically executed.
                    </p>
                    <p>
                        You'll receive a prepaid shipping label to send your item to our verification center. After our experts confirm its authenticity and condition, we release your payment. It's a secure and hassle-free way to get the best price for your items.
                    </p>
                </InfoSection>

                <InfoSection title="3. Our Verification Process">
                    <p>
                        Authenticity is the cornerstone of Grailify. Our dedicated team of specialists meticulously inspects every item. We check stitching, materials, serial numbers, packaging, and every other detail to ensure it meets our high standards before it's sent to the buyer.
                    </p>
                </InfoSection>
            </div>
        </div>
    );
}