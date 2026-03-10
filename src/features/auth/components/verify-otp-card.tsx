"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useVerifyOtp } from "../api/use-verify-otp";

const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
})

export const VerifyOtpCard = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");

    const { mutate, isPending } = useVerifyOtp();
    const [resendDisabled, setResendDisabled] = useState(false);

    const form = useForm<z.infer<typeof verifyOtpSchema>>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            email: email || "",
            otp: ""
        },
    });

    const onSubmit = (values: z.infer<typeof verifyOtpSchema>) => {
        mutate({ json: values })
    }

    if (!email) {
        return (
            <Card className="w-ful h-full md:w-[487px] border-none shadow-none">
                <CardHeader className="flex items-center justify-center text-center p-7">
                    <CardTitle className="text-2xl">
                        Verify Email
                    </CardTitle>
                    <CardDescription>
                        No email provided. Please register first.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-7 flex items-center justify-center">
                    <Link href="/sign-up">
                        <Button variant="outline">Go to Sign Up</Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-ful h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Verify Your Email
                </CardTitle>
                <CardDescription>
                    We sent an OTP to <span className="font-semibold">{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            placeholder="Enter 6-digit OTP"
                                            className="text-center text-2xl tracking-widest"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button className="w-full" disabled={isPending} size="lg">
                            {isPending ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <div className="text-center text-sm text-muted-foreground">
                    Didn't receive the OTP?
                </div>
                <Button
                    variant="secondary"
                    className="w-full"
                    disabled={resendDisabled}
                    onClick={() => {
                        setResendDisabled(true)
                        setTimeout(() => setResendDisabled(false), 60000)
                    }}
                >
                    {resendDisabled ? "Resend in 60s" : "Resend OTP"}
                </Button>
            </CardContent>
            <CardContent className="p-7 flex items-center justify-center">
                <p>
                    Wrong email?
                    <Link href="/sign-up">
                        <span className="text-blue-700">&nbsp;Sign Up again</span>
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
};
