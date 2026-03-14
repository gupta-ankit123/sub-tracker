"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SUBSCRIPTION_CATEGORIES } from "../schemas"
import { useCreateSubscription } from "../api/use-create-subscription"
import { useUpdateSubscription } from "../api/use-update-subscription"
import { useCreateUtilityBill } from "../api/use-utility-bills"
import { Zap, CreditCard } from "lucide-react"

interface Subscription {
    id: string
    name: string
    amount: string | number
    currency: string
    billingCycle: string
    category: string
    status: string
    nextBillingDate: string
    logoUrl: string | null
    websiteUrl: string | null
    description: string | null
    autoRenew: boolean
    notes: string | null
    reminderDays: number
    usageFrequency?: string
}

interface SubscriptionFormDialogProps {
    children?: React.ReactNode
    subscription?: Subscription
    onSuccess?: () => void
}

type FormType = "subscription" | "utility"

export function SubscriptionFormDialog({ children, subscription, onSuccess }: SubscriptionFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [formType, setFormType] = useState<FormType>("subscription")
    const createMutation = useCreateSubscription()
    const createUtilityMutation = useCreateUtilityBill()
    const updateMutation = useUpdateSubscription()

    const isEdit = !!subscription

    const form = useForm({
        defaultValues: {
            name: subscription?.name || "",
            description: subscription?.description || "",
            category: subscription?.category || "",
            logoUrl: subscription?.logoUrl || "",
            websiteUrl: subscription?.websiteUrl || "",
            amount: Number(subscription?.amount) || 0,
            currency: subscription?.currency || "INR",
            billingCycle: (subscription?.billingCycle) || "MONTHLY",
            firstBillingDate: subscription?.nextBillingDate 
                ? new Date(subscription.nextBillingDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            autoRenew: subscription?.autoRenew ?? true,
            notes: subscription?.notes || "",
            reminderDays: subscription?.reminderDays ?? 3,
            usageFrequency: subscription?.usageFrequency || "MONTHLY"
        },
    })

    const { formState, watch } = form
    const formValues = watch()
    const isFormValid = formValues.name && formValues.category && formValues.amount > 0

    const onSubmit = (values: any) => {
        const payload = {
            ...values,
            amount: Number(values.amount),
            reminderDays: Number(values.reminderDays),
        }

        if (isEdit && subscription) {
            updateMutation.mutate(
                { json: payload, param: { id: subscription.id } },
                { onSuccess: () => setOpen(false) }
            )
        } else {
            createMutation.mutate(
                { json: payload },
                {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    },
                }
            )
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Add Subscription</Button>}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                {!isEdit && (
                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setFormType("subscription")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border ${
                                formType === "subscription" 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-background hover:bg-accent"
                            }`}
                        >
                            <CreditCard className="h-4 w-4" />
                            Subscription
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormType("utility")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border ${
                                formType === "utility" 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-background hover:bg-accent"
                            }`}
                        >
                            <Zap className="h-4 w-4" />
                            Utility Bill
                        </button>
                    </div>
                )}
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Subscription" : formType === "utility" ? "Add Utility Bill" : "Add New Subscription"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit 
                            ? "Update your subscription details below." 
                            : formType === "utility"
                                ? "Add a utility bill to track your variable expenses."
                                : "Add a new subscription to track your recurring payments."}
                    </DialogDescription>
                </DialogHeader>
                {formType === "utility" && !isEdit ? (
                    <UtilityBillForm 
                        onSuccess={() => {
                            setOpen(false)
                            onSuccess?.()
                        }} 
                        onCancel={() => setOpen(false)}
                    />
                ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Netflix, Spotify..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
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
                                            {SUBSCRIPTION_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="INR">INR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="billingCycle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billing Cycle</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                            <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                                            <SelectItem value="ANNUAL">Annual</SelectItem>
                                            <SelectItem value="ONE_TIME">One Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="usageFrequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>How often do you use this?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="RARELY">Rarely</SelectItem>
                                            <SelectItem value="NEVER">Never</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="firstBillingDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Billing Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="logoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo URL (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="websiteUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website URL (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief description..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Additional notes..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || !isFormValid}>
                                {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}

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

function UtilityBillForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Electricity",
        billingDay: "1",
        amount: 0,
        notes: "",
    })
    const createMutation = useCreateUtilityBill()

    const handleSubmit = async () => {
        const billingDay = parseInt(formData.billingDay)
        if (isNaN(billingDay) || billingDay < 1 || billingDay > 31) {
            toast.error("Billing day must be between 1 and 31")
            return
        }
        try {
            await createMutation.mutateAsync({
                name: formData.name,
                category: formData.category,
                billingDay,
                amount: formData.amount > 0 ? formData.amount : undefined,
                notes: formData.notes || undefined,
            })
            toast.success("Utility bill added successfully!")
            onSuccess()
        } catch (error) {
            toast.error("Failed to add utility bill")
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Name</label>
                <Input 
                    placeholder="e.g., Home Electricity"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {UTILITY_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="text-sm font-medium">Billing Day (1-31)</label>
                <Input 
                    type="number"
                    min={1}
                    max={31}
                    value={formData.billingDay}
                    onChange={(e) => setFormData({ ...formData, billingDay: e.target.value })}
                    className="mt-1"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Initial Amount (Optional)</label>
                <Input 
                    type="number"
                    placeholder="0.00"
                    value={formData.amount || ""}
                    onChange={(e) => {
                        const val = e.target.value
                        setFormData({ ...formData, amount: val === "" ? 0 : parseFloat(val) || 0 })
                    }}
                    className="mt-1"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Input 
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1"
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name || createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Create"}
                </Button>
            </DialogFooter>
        </div>
    )
}
