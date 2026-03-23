"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
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
            otp: "",
        },
    })

    useEffect(() => {
        if (countdown <= 0) return
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
        return () => clearInterval(timer)
    }, [countdown])

    const onSubmit = (values: z.infer<typeof verifyOtpSchema>) => {
        mutate({ json: values })
    }

    if (!email) {
        return (
            <>
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-[#1b1f2b] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                        <Mail className="w-8 h-8 text-[#bacac2]" />
                    </div>
                    <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-extrabold tracking-tight text-[#dfe2f2]">
                        Verify Email
                    </h1>
                    <p className="text-[#bacac2] mt-2 text-center">
                        No email provided. Please register first.
                    </p>
                </div>
                <div className="bg-[rgba(49,52,65,0.4)] backdrop-blur-xl rounded-xl p-8 border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-center">
                    <Link href="/sign-up">
                        <button className="bg-[#00d4aa] text-[#005643] font-[family-name:var(--font-plus-jakarta)] font-bold py-4 px-8 rounded-xl hover:shadow-[0_0_20px_rgba(70,241,197,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200">
                            Go to Sign Up
                        </button>
                    </Link>
                </div>
            </>
        )
    }

    return (
        <>
            {/* Brand Logo */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-[#1b1f2b] rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#46f1c5]/10 group-hover:bg-[#46f1c5]/20 transition-colors" />
                    <Mail className="w-8 h-8 text-[#46f1c5] relative z-10" />
                </div>
                <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-extrabold tracking-tight text-[#dfe2f2]">
                    Verify Your Email
                </h1>
                <p className="text-[#bacac2] mt-2 text-center">
                    We sent a 6-digit code to{" "}
                    <span className="text-[#46f1c5] font-medium">{email}</span>
                </p>
            </div>

            {/* Glassmorphic Card */}
            <div className="bg-[rgba(49,52,65,0.4)] backdrop-blur-xl rounded-xl p-8 border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Hidden email field */}
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="hidden">
                                    <FormControl>
                                        <input {...field} type="email" hidden />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* OTP Input */}
                        <FormField
                            name="otp"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[#bacac2] px-1 text-center">
                                            Verification Code
                                        </label>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="w-full bg-[#0a0e19] border-none text-[#dfe2f2] rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-[#46f1c5]/40 placeholder:text-[#bacac2]/20 placeholder:text-base placeholder:tracking-normal transition-all outline-none"
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#00d4aa] text-[#005643] font-[family-name:var(--font-plus-jakarta)] font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(70,241,197,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Verifying..." : "Verify Email"}
                        </button>
                    </form>
                </Form>

                {/* Divider */}
                <div className="relative py-4 flex items-center my-2">
                    <div className="flex-grow border-t border-white/5" />
                    <span className="flex-shrink mx-4 text-xs font-medium text-[#bacac2]/50 uppercase tracking-widest">
                        didn&apos;t receive it?
                    </span>
                    <div className="flex-grow border-t border-white/5" />
                </div>

                {/* Resend Button */}
                <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={() => setCountdown(60)}
                    className="w-full bg-white/5 hover:bg-white/10 text-[#dfe2f2] py-3 rounded-xl transition-all border border-white/5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </button>
            </div>

            {/* Footer Link */}
            <p className="mt-8 text-center text-[#bacac2] font-medium text-sm">
                Wrong email?{" "}
                <Link
                    href="/sign-up"
                    className="text-[#46f1c5] font-bold hover:underline underline-offset-4 ml-1 transition-all"
                >
                    Sign Up again
                </Link>
            </p>
        </>
    )
}
