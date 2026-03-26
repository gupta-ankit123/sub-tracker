"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound } from "lucide-react"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import Link from "next/link"
import { forgotPasswordSchema } from "../schemas"
import { useForgotPassword } from "../api/use-forgot-password"

export const ForgotPasswordCard = () => {
    const { mutate, isPending } = useForgotPassword()
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
        mutate({ json: values })
    }

    return (
        <>
            {/* Brand Logo */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-[#1b1f2b] rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#46f1c5]/10 group-hover:bg-[#46f1c5]/20 transition-colors" />
                    <KeyRound className="w-8 h-8 text-[#46f1c5] relative z-10" />
                </div>
                <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-extrabold tracking-tight text-[#dfe2f2]">
                    Forgot Password?
                </h1>
                <p className="text-[#bacac2] mt-2 text-center">
                    Enter your email and we&apos;ll send you a reset code
                </p>
            </div>

            {/* Glassmorphic Card */}
            <div className="bg-[rgba(49,52,65,0.4)] backdrop-blur-xl rounded-xl p-8 border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[#bacac2] px-1">
                                            Email
                                        </label>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="email"
                                                placeholder="name@company.com"
                                                className="w-full bg-[#0a0e19] border-none text-[#dfe2f2] rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#46f1c5]/40 placeholder:text-[#bacac2]/30 transition-all outline-none"
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
                            {isPending ? "Sending..." : "Send Reset Code"}
                        </button>
                    </form>
                </Form>
            </div>

            {/* Footer Link */}
            <p className="mt-8 text-center text-[#bacac2] font-medium text-sm">
                Remember your password?{" "}
                <Link
                    href="/sign-in"
                    className="text-[#46f1c5] font-bold hover:underline underline-offset-4 ml-1 transition-all"
                >
                    Sign In
                </Link>
            </p>
        </>
    )
}
