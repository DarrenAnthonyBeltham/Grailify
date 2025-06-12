import React from 'react';

const LegalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-black mb-4">{title}</h2>
        <div className="text-neutral-700 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-black tracking-tighter">Privacy Policy</h1>
                    <p className="mt-4 text-xl text-neutral-600">Last Updated: June 12, 2025</p>
                </header>

                 <div className="text-lg">
                     <p className="mb-8">
                        This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from Grailify (the "Site").
                    </p>

                    <LegalSection title="1. Personal Information We Collect">
                        <p>
                           When you use our Services, we automatically collect certain information about your device, including information about your web browser, IP address, and time zone. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view. We refer to this automatically-collected information as “Device Information.”
                        </p>
                        <p>
                           Additionally when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number. We refer to this information as “Order Information.”
                        </p>
                    </LegalSection>

                    <LegalSection title="2. How We Use Your Personal Information">
                        <p>
                            We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
                        </p>
                         <p>
                            We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site.
                        </p>
                    </LegalSection>

                    <LegalSection title="3. Sharing Your Personal Information">
                        <p>
                           We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use third-party payment processors to handle transactions. We also use Google Analytics to help us understand how our customers use the Site.
                        </p>
                    </LegalSection>
                    
                    <LegalSection title="4. Your Rights">
                        <p>
                           If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
                        </p>
                    </LegalSection>
                </div>
            </div>
        </div>
    );
}