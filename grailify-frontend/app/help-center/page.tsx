import React from 'react';
import Link from 'next/link';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HelpTopicCard = ({ title, description, href }: { title: string; description: string; href: string; }) => (
    <Link href={href} className="block p-6 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-200">
        <h3 className="font-bold text-xl text-black">{title}</h3>
        <p className="mt-2 text-neutral-600">{description}</p>
    </Link>
)

export default function HelpCenterPage() {
    return (
        <div className="bg-white">
            <header className="bg-neutral-50 border-b border-neutral-200">
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Help Center</h1>
                    <p className="mt-4 text-xl text-neutral-600">How can we help you today?</p>
                    <div className="mt-8 max-w-2xl mx-auto">
                         <div className="relative">
                           <input
                            type="search"
                            placeholder="Search for answers..."
                            className="w-full h-14 pl-14 pr-4 text-lg rounded-full border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                           />
                           <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <SearchIcon className="h-6 w-6 text-neutral-500" />
                           </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mx-auto px-4 py-16 md:py-24">
                <h2 className="text-3xl font-bold text-center text-black tracking-tight mb-12">Browse Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <HelpTopicCard title="Buying on Grailify" description="Learn about placing bids, making purchases, and our verification process." href="/how-it-works" />
                    <HelpTopicCard title="Selling on Grailify" description="Get details on listing items, seller fees, and shipping." href="/how-to-sell" />
                    <HelpTopicCard title="Account Management" description="Update your profile, password, and payment methods." href="/account" />
                    <HelpTopicCard title="Shipping & Tracking" description="Find information on tracking your order and our shipping policies." href="#" />
                    <HelpTopicCard title="Returns & Refunds" description="Read our policies on returns and what to do if you have an issue." href="/buyer-protection" />
                    <HelpTopicCard title="Trust & Safety" description="Learn about our authenticity guarantee and how we protect our users." href="/authenticity-guarantee" />
                </div>
            </div>
        </div>
    );
}