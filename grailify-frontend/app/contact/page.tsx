import React from 'react';

export default function ContactPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Contact Us</h1>
                    <p className="mt-4 text-xl text-neutral-600">We're here to help. Reach out to us anytime.</p>
                </header>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 md:p-12">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-medium text-neutral-700">First Name</label>
                                <input type="text" id="first-name" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-sm font-medium text-neutral-700">Last Name</label>
                                <input type="text" id="last-name" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address</label>
                            <input type="email" id="email" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                        </div>
                         <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">Subject</label>
                            <input type="text" id="subject" className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-neutral-700">Message</label>
                            <textarea id="message" rows={5} className="mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"></textarea>
                        </div>
                        <div className="text-right">
                            <button type="submit" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
