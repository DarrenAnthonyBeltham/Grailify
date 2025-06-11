const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} className="text-neutral-500 hover:text-black transition-colors">
        {children}
    </a>
);

export default function Footer() {
    return (
        <footer className="bg-white border-t border-neutral-200">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-black tracking-wider">Buy</h3>
                        <div className="flex flex-col space-y-3">
                            <FooterLink href="#">How it Works</FooterLink>
                            <FooterLink href="#">Buyer Protection</FooterLink>
                            <FooterLink href="#">Authenticity Guarantee</FooterLink>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-black tracking-wider">Sell</h3>
                        <div className="flex flex-col space-y-3">
                            <FooterLink href="#">How to Sell</FooterLink>
                            <FooterLink href="#">Seller Fees</FooterLink>
                            <FooterLink href="#">Start Selling</FooterLink>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-black tracking-wider">Support</h3>
                        <div className="flex flex-col space-y-3">
                            <FooterLink href="#">Help Center</FooterLink>
                            <FooterLink href="#">Contact Us</FooterLink>
                            <FooterLink href="#">My Account</FooterLink>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-black tracking-wider">About</h3>
                        <div className="flex flex-col space-y-3">
                            <FooterLink href="#">Company</FooterLink>
                            <FooterLink href="#">Careers</FooterLink>
                            <FooterLink href="#">Press</FooterLink>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-neutral-500">&copy; {new Date().getFullYear()} Grailify. All Rights Reserved.</p>
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        <FooterLink href="#">Terms of Service</FooterLink>
                        <FooterLink href="#">Privacy Policy</FooterLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}