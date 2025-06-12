import React from 'react';

const LegalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-black mb-4">{title}</h2>
        <div className="text-neutral-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function TermsOfServicePage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Terms of Service</h1>
                    <p className="mt-4 text-xl text-neutral-600">Last Updated: June 12, 2025</p>
                </header>

                <div className="text-lg">
                    <p className="mb-8">
                        Welcome to Grailify. These Terms of Service ("Terms") govern your use of the Grailify website, mobile applications, and services (collectively, the "Services"). Please read these Terms carefully. By using our Services, you agree to be bound by these Terms.
                    </p>

                    <LegalSection title="1. Your Account">
                        <p>
                            You must be at least 18 years old to use our Services. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
                        </p>
                    </LegalSection>

                    <LegalSection title="2. Buying and Selling">
                        <p>
                            Grailify provides a marketplace for buyers and sellers of sneakers, apparel, and other goods. When you place a bid or make a purchase, you are committing to buy the item. When you list an item for sale, you are committing to sell and ship that item upon a successful transaction. All items sold must be sent to Grailify for our mandatory verification process.
                        </p>
                    </LegalSection>
                    
                    <LegalSection title="3. Prohibited Conduct">
                        <p>
                            You agree not to engage in any of the following prohibited activities: using the service for any illegal purpose, attempting to sell counterfeit items, creating multiple accounts to manipulate market prices, or interfering with the proper working of the Services.
                        </p>
                    </LegalSection>

                    <LegalSection title="4. Disclaimers and Limitation of Liability">
                        <p>
                            The Services are provided on an "as is" and "as available" basis. Grailify makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties. In no event shall Grailify be liable for any damages arising out of the use or inability to use the materials on Grailify's website.
                        </p>
                    </LegalSection>

                     <LegalSection title="5. Changes to Terms">
                        <p>
                           We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </LegalSection>
                </div>
            </div>
        </div>
    );
}