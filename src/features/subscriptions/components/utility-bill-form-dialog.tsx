"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateUtilityBill } from "../api/use-utility-bills"

const UTILITY_CATEGORIES = [
    { value: "Electricity", label: "Electricity ⚡", icon: "⚡" },
    { value: "Water", label: "Water 💧", icon: "💧" },
    { value: "Gas", label: "Gas 🔥", icon: "🔥" },
    { value: "Internet", label: "Internet 📡", icon: "📡" },
    { value: "Mobile Postpaid", label: "Mobile Postpaid 📱", icon: "📱" },
    { value: "Mobile Prepaid", label: "Mobile Prepaid 📲", icon: "📲" },
    { value: "Society Maintenance", label: "Society Maintenance 🏢", icon: "🏢" },
    { value: "Other", label: "Other", icon: "📋" },
] as const

const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    category: z.enum(UTILITY_CATEGORIES.map(c => c.value) as [string, ...string[]]),
    description: z.string().optional(),
    billingDay: z.number().int().min(1).max(31),
    amount: z.number().positive().optional(),
    currency: z.string(),
    notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface UtilityBillFormDialogProps {
    children?: React.ReactNode
    onSuccess?: () => void
}

export function UtilityBillFormDialog({ children, onSuccess }: UtilityBillFormDialogProps) {
    const [open, setOpen] = useState(false)
    const createMutation = useCreateUtilityBill()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "Electricity",
            description: "",
            billingDay: 1,
            amount: 0,
            currency: "INR",
            notes: "",
        },
    })

    const onSubmit = async (values: FormValues) => {
        try {
            const amount = values.amount || 0
            const payload = {
                ...values,
                amount: amount > 0 ? amount : undefined,
            }
            await createMutation.mutateAsync(payload)
            toast.success("Utility bill added successfully!")
            setOpen(false)
            form.reset({
                name: "",
                category: "Electricity",
                description: "",
                billingDay: 1,
                amount: 0,
                currency: "INR",
                notes: "",
            })
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to add utility bill")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Add Utility Bill</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Utility Bill</DialogTitle>
                    <DialogDescription>
                        Track your variable expenses like electricity, water, gas, etc.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Home Electricity" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {UTILITY_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="billingDay"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billing Day (1-31)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            min={1} 
                                            max={31}
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Initial Amount (Optional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="0.00"
                                            {...field}
                                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Any additional notes..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Adding..." : "Add Utility Bill"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
