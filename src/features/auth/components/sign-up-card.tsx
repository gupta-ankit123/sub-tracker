"use client"
import { z } from "zod"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";

export const SignUpCard = () => {

    const { mutate, isPending } = useRegister();
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        },
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        mutate({ json: values })
    }

    return (
        <motion.div
            className="w-full max-w-[440px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="gradient-border rounded-2xl p-[1px]">
                <div className="glass-card rounded-2xl p-8 sm:p-10">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-6 h-6 text-[#00D4AA]" />
                        </div>
                        <h1 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] text-white text-center">
                            Create Account
                        </h1>
                        <p className="text-sm text-[#7A8BA8] text-center mt-1">
                            Start tracking your subscriptions for free
                        </p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-sm font-medium text-[#C0CAD8] mb-1.5 block">
                                            Full Name
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="Enter your name"
                                                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-[#4A5568] focus:border-[#00D4AA]/50 focus:ring-[#00D4AA]/20 rounded-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-sm font-medium text-[#C0CAD8] mb-1.5 block">
                                            Email
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Enter email address"
                                                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-[#4A5568] focus:border-[#00D4AA]/50 focus:ring-[#00D4AA]/20 rounded-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <label className="text-sm font-medium text-[#C0CAD8] mb-1.5 block">
                                            Password
                                        </label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter your password"
                                                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-[#4A5568] focus:border-[#00D4AA]/50 focus:ring-[#00D4AA]/20 rounded-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button variant="primary" className="w-full h-12 text-base font-semibold rounded-lg" disabled={isPending} size="lg">
                                Create Account
                            </Button>
                        </form>
                    </Form>

                    {/* Terms */}
                    <p className="text-xs text-[#4A5568] text-center mt-3">
                        By signing up, you agree to our{" "}
                        <Link href="/privacy" className="text-[#00D4AA] hover:underline">Privacy Policy</Link>
                        {" "}and{" "}
                        <Link href="/terms" className="text-[#00D4AA] hover:underline">Terms of Service</Link>
                    </p>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.06]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#111827] px-3 text-[#4A5568]">or continue with</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            disabled={isPending}
                            variant="outline"
                            className="h-12 rounded-lg"
                        >
                            <FcGoogle className="mr-2 size-5" />
                            Google
                        </Button>

                        <Button
                            disabled={isPending}
                            variant="outline"
                            className="h-12 rounded-lg"
                        >
                            <FaGithub className="mr-2 size-5" />
                            GitHub
                        </Button>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-[#7A8BA8] mt-6">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-[#00D4AA] hover:text-[#00BF99] font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
