import React from 'react';

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-12">
        <h2 className="text-3xl font-bold text-black tracking-tight mb-4">{title}</h2>
        <div className="text-lg text-neutral-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function AuthenticityGuaranteePage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Authenticity Guarantee</h1>
                    <p className="mt-4 text-xl text-neutral-600">Verified by experts. Guaranteed for you.</p>
                </header>

                <InfoSection title="Our Commitment">
                    <p>
                        Grailify was founded on the principle of trust. We understand that in the world of high-demand goods, authenticity is everything. That's why we have invested in a world-class verification process to ensure every item on our platform is legitimate.
                    </p>
                </InfoSection>

                <InfoSection title="The Verification Process">
                    <p>
                        Before any item is shipped to a buyer, it first arrives at one of our dedicated verification centers. Here, our team of category-specific authenticators performs a multi-point inspection. This includes, but is not limited to:
                         <ul className="list-disc list-inside mt-4 space-y-2">
                            <li>Construction & Stitching Analysis</li>
                            <li>Material & Texture Evaluation</li>
                            <li>SKU & Sizing Label Verification</li>
                            <li>Packaging & Accessory Inspection</li>
                            <li>UV Light Scans & Blacklight Tests</li>
                        </ul>
                    </p>
                     <p>
                        Only after an item successfully passes this exhaustive process do we attach our Grailify verification tag and ship it to the buyer. This tag is a symbol of our guarantee.
                    </p>
                </InfoSection>
                 <InfoSection title="Our Promise">
                    <p>
                       We stand behind our process with a full money-back guarantee. In the extremely unlikely event that you receive an item that you believe is not authentic, we will work with you to secure a full refund, including all shipping and handling costs.
                    </p>
                </InfoSection>
            </div>
        </div>
    );
}