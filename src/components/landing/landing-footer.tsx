import Link from "next/link"
import Image from "next/image"

export function LandingFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Link href="/">
                            <Image src="/logo.svg" alt="SubTracker" width={140} height={40} className="brightness-0 invert" />
                        </Link>
                        <p className="mt-3 text-sm text-gray-400">
                            Track subscriptions, manage bills, and save money. Built for India.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-white transition">Features</a></li>
                            <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                            <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                            <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Account</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/sign-in" className="hover:text-white transition">Sign In</Link></li>
                            <li><Link href="/sign-up" className="hover:text-white transition">Sign Up</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><span className="text-gray-500">Privacy Policy</span></li>
                            <li><span className="text-gray-500">Terms of Service</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SubTracker. All rights reserved.</p>
                    <p className="text-sm text-gray-500">Made with ❤️ in India</p>
                </div>
            </div>
        </footer>
    )
}
