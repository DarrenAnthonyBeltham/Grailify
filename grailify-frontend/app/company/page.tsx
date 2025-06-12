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

export default function CompanyPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">About Grailify</h1>
                    <p className="mt-4 text-xl text-neutral-600">Connecting a global community through a shared passion for authentic goods.</p>
                </header>

                <InfoSection title="Our Mission">
                    <p>
                        Grailify was founded with a clear mission: to create the world's most trusted and transparent marketplace for the items we love most. We believe that everyone deserves access to authentic, high-demand goods, and we've built a platform that puts trust and quality at the forefront of every transaction.
                    </p>
                </InfoSection>

                <InfoSection title="Our Story">
                    <p>
                       From a small team of dedicated collectors, Grailify has grown into a global destination for sneakers, apparel, electronics, and more. We saw a need for a marketplace that not only connected buyers and sellers but also guaranteed the authenticity of every single product. Our rigorous, expert-led verification process is the cornerstone of our platform and our promise to you.
                    </p>
                </InfoSection>

                <InfoSection title="Join Our Community">
                    <p>
                       Whether you're looking for your ultimate grail, selling a prized piece from your collection, or simply exploring the latest trends, you're part of the Grailify community. We're dedicated to providing an unparalleled experience built on passion, expertise, and trust.
                    </p>
                    <div className="mt-8">
                        <Link href="/careers" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">
                            Explore Careers at Grailify
                        </Link>
                    </div>
                </InfoSection>
            </div>
        </div>
    );
}
