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
    DialogFooter,
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
    { value: "Electricity", label: "Electricity ⚡" },
    { value: "Water", label: "Water 💧" },
    { value: "Gas", label: "Gas 🔥" },
    { value: "Internet", label: "Internet 📡" },
    { value: "Mobile Postpaid", label: "Mobile Postpaid 📱" },
    { value: "Mobile Prepaid", label: "Mobile Prepaid 📲" },
    { value: "Society Maintenance", label: "Society Maintenance 🏢" },
    { value: "Other", label: "Other" },
] as const

const utilityBillSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    category: z.enum(UTILITY_CATEGORIES.map(c => c.value) as [string, ...string[]]),
    description: z.string().optional(),
    billingDay: z.string().min(1).max(31),
    amount: z.number().positive().optional(),
    currency: z.string(),
    notes: z.string().optional(),
})

type UtilityBillFormValues = z.infer<typeof utilityBillSchema>

interface UtilityBillFormDialogProps {
    children?: React.ReactNode
    onSuccess?: () => void
}

export function UtilityBillFormDialog({ children, onSuccess }: UtilityBillFormDialogProps) {
    const [open, setOpen] = useState(false)
    const createMutation = useCreateUtilityBill()

    const form = useForm<UtilityBillFormValues>({
        resolver: zodResolver(utilityBillSchema),
        defaultValues: {
            name: "",
            category: "Electricity",
            description: "",
            billingDay: "1",
            amount: 0,
            currency: "INR",
            notes: "",
        },
    })

    const onSubmit = async (values: UtilityBillFormValues) => {
        const billingDay = parseInt(values.billingDay)
        if (isNaN(billingDay) || billingDay < 1 || billingDay > 31) {
            toast.error("Billing day must be between 1 and 31")
            return
        }
        try {
            const amount = values.amount || 0
            const payload = {
                ...values,
                billingDay,
                amount: amount > 0 ? amount : undefined,
                category: values.category as "Electricity" | "Water" | "Gas" | "Internet" | "Mobile Postpaid" | "Society Maintenance" | "Other",
            }
            await createMutation.mutateAsync(payload)
            toast.success("Utility bill added successfully!")
            setOpen(false)
            form.reset({
                name: "",
                category: "Electricity",
                description: "",
                billingDay: "1",
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
                                            type="text" 
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder="1-31"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '')
                                                field.onChange(val)
                                            }}
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Adding..." : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
