import React from 'react';

export default function PressPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Press & Media</h1>
                    <p className="mt-4 text-xl text-neutral-600">Information and resources for members of the media.</p>
                </header>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold text-black tracking-tight">Media Inquiries</h2>
                    <p className="mt-4 text-lg text-neutral-700 leading-relaxed">
                        For all press inquiries, interviews, or other media-related requests, please contact our communications team. We'd be happy to provide you with more information about our company, our mission, and our impact on the industry.
                    </p>
                    <div className="mt-8">
                        <a href="mailto:press@grailify.com" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">
                            Contact press@grailify.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}