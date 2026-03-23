"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    const pathname = usePathname();
    const isSignIn = pathname === "/sign-in"

    return (
        <main className="min-h-screen bg-[#0B0F1A] relative overflow-hidden">
            {/* Animated gradient mesh background orbs */}
            <div
                className="absolute w-[700px] h-[700px] rounded-full bg-[#00D4AA]/[0.05] blur-[150px] pointer-events-none"
                style={{
                    top: "-10%",
                    right: "-5%",
                    animation: "orbDrift1 25s ease-in-out infinite",
                }}
            />
            <div
                className="absolute w-[600px] h-[600px] rounded-full bg-[#3B82F6]/[0.05] blur-[140px] pointer-events-none"
                style={{
                    bottom: "-15%",
                    left: "-8%",
                    animation: "orbDrift2 22s ease-in-out infinite",
                }}
            />
            <div
                className="absolute w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/[0.04] blur-[130px] pointer-events-none"
                style={{
                    top: "30%",
                    left: "40%",
                    animation: "orbDrift3 28s ease-in-out infinite",
                }}
            />

            {/* Subtle grid pattern overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Grain texture overlay */}
            <div className="grain absolute inset-0 pointer-events-none" />

            {/* Orb animation keyframes */}
            <style jsx>{`
                @keyframes orbDrift1 {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(-40px, 60px) scale(1.05);
                    }
                    50% {
                        transform: translate(30px, -40px) scale(0.95);
                    }
                    75% {
                        transform: translate(-20px, -30px) scale(1.02);
                    }
                }
                @keyframes orbDrift2 {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(50px, -30px) scale(1.03);
                    }
                    50% {
                        transform: translate(-40px, 50px) scale(0.97);
                    }
                    75% {
                        transform: translate(30px, 20px) scale(1.04);
                    }
                }
                @keyframes orbDrift3 {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(-60px, -40px) scale(1.06);
                    }
                    50% {
                        transform: translate(50px, 30px) scale(0.94);
                    }
                    75% {
                        transform: translate(20px, -50px) scale(1.01);
                    }
                }
            `}</style>

            <div className="relative min-h-screen flex flex-col p-4 sm:p-6">
                {/* Sticky glassmorphic navbar */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                    className="sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]"
                >
                    <Link href="/">
                        <Image
                            src="/logo.svg"
                            alt="SubTracker"
                            width={140}
                            height={40}
                            className="brightness-0 invert opacity-90"
                        />
                    </Link>
                    <Button
                        asChild
                        variant="outline"
                        className="border-white/[0.1] bg-white/[0.04] text-[#C0CAD8] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] backdrop-blur-sm transition-all duration-300"
                    >
                        <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                            {isSignIn ? "Sign Up" : "Login"}
                        </Link>
                    </Button>
                </motion.nav>

                {/* Centered children with entrance animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.25 }}
                    className="flex flex-1 flex-col items-center justify-center"
                >
                    {children}
                </motion.div>
            </div>
        </main>
    );
}

export default AuthLayout;
