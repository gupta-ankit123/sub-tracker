"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useVerifyOtp } from "../api/use-verify-otp"

const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
})

export const VerifyOtpCard = () => {
    const searchParams = useSearchParams()
    const email = searchParams.get("email")

    const { mutate, isPending } = useVerifyOtp()
    const [countdown, setCountdown] = useState(0)

    const form = useForm<z.infer<typeof verifyOtpSchema>>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            email: email || "",
            otp: ""
        },
    })

    useEffect(() => {
        if (countdown <= 0) return
        const timer = setInterval(() => setCountdown(c => c - 1), 1000)
        return () => clearInterval(timer)
    }, [countdown])

    const onSubmit = (values: z.infer<typeof verifyOtpSchema>) => {
        mutate({ json: values })
    }

    if (!email) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[440px] mx-auto"
            >
                <div className="gradient-border rounded-2xl p-[1px]">
                    <div className="glass-card rounded-2xl p-8 sm:p-10">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-7 w-7 text-[#7A8BA8]" />
                            </div>
                            <h1 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-white">
                                Verify Email
                            </h1>
                            <p className="text-sm text-[#7A8BA8] mt-2 mb-6">
                                No email provided. Please register first.
                            </p>
                            <Link href="/sign-up">
                                <Button variant="primary" className="h-12 px-8 rounded-lg font-semibold">
                                    Go to Sign Up
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[440px] mx-auto"
        >
            <div className="gradient-border rounded-2xl p-[1px]">
                <div className="glass-card rounded-2xl p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-7 w-7 text-[#00D4AA]" />
                        </div>
                        <h1 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-white">
                            Verify Your Email
                        </h1>
                        <p className="text-sm text-[#7A8BA8] mt-1">
                            We sent a 6-digit code to{" "}
                            <span className="text-[#00D4AA] font-medium">{email}</span>
                        </p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="hidden">
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                hidden
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="otp"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="h-14 bg-white/[0.04] border-white/[0.08] text-white text-center text-3xl tracking-[0.5em] font-mono placeholder:text-[#4A5568] placeholder:text-base placeholder:tracking-normal focus-visible:border-[#00D4AA]/50 focus-visible:ring-[#00D4AA]/20 rounded-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                variant="primary"
                                className="w-full h-12 text-base font-semibold rounded-lg"
                                disabled={isPending}
                                size="lg"
                            >
                                {isPending ? "Verifying..." : "Verify Email"}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.06]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#111827] px-3 text-[#4A5568]">didn&apos;t receive it?</span>
                        </div>
                    </div>

                    {/* Resend */}
                    <Button
                        variant="outline"
                        className="w-full h-11 rounded-lg"
                        disabled={countdown > 0}
                        onClick={() => {
                            setCountdown(60)
                        }}
                    >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </Button>

                    {/* Footer */}
                    <p className="text-center text-sm text-[#7A8BA8] mt-6">
                        Wrong email?{" "}
                        <Link href="/sign-up" className="text-[#00D4AA] hover:text-[#00BF99] font-medium transition-colors">
                            Sign Up again
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
