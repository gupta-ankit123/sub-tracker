import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LandingNavbar() {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between h-16">
                    <Link href="/">
                        <Image src="/logo.svg" alt="SubTracker" width={152} height={42} priority />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
                        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How It Works</a>
                        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">Pricing</a>
                        <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition">FAQ</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" asChild>
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/sign-up">Get Started</Link>
                        </Button>
                    </div>
                </nav>
            </div>
        </header>
    )
}
