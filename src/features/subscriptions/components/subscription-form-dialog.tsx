"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Image from "next/image"

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
import { POPULAR_SUBSCRIPTIONS, type PopularSubscription } from "../data/popular-subscriptions"
import { useCreateSubscription } from "../api/use-create-subscription"
import { useUpdateSubscription } from "../api/use-update-subscription"
import { useCreateUtilityBill } from "../api/use-utility-bills"
import { Zap, CreditCard, PenLine, ChevronLeft, Check } from "lucide-react"

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
type Step = "type" | "category" | "pick" | "details"

export function SubscriptionFormDialog({ children, subscription, onSuccess }: SubscriptionFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [formType, setFormType] = useState<FormType>("subscription")
    const [step, setStep] = useState<Step>("type")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedPopular, setSelectedPopular] = useState<PopularSubscription | null>(null)
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

    const { watch } = form
    const formValues = watch()
    const isFormValid = formValues.name && formValues.category && formValues.amount > 0

    const handleOpenChange = useCallback((isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            if (!isEdit) {
                setStep("type")
                setSelectedCategory("")
                setSelectedPopular(null)
                form.reset()
            }
        } else if (isEdit) {
            setStep("details")
            setSelectedCategory(subscription?.category || "")
        }
    }, [isEdit, subscription, form])

    const handleCategorySelect = useCallback((category: string) => {
        setSelectedCategory(category)
        form.setValue("category", category)
        const popularList = POPULAR_SUBSCRIPTIONS[category]
        if (popularList && popularList.length > 0) {
            setStep("pick")
        } else {
            setStep("details")
        }
    }, [form])

    const handlePopularSelect = useCallback((sub: PopularSubscription) => {
        setSelectedPopular(sub)
        form.setValue("name", sub.name)
        form.setValue("logoUrl", sub.logoUrl)
        form.setValue("websiteUrl", sub.websiteUrl)
        if (sub.defaultAmount > 0) {
            form.setValue("amount", sub.defaultAmount)
        }
        form.setValue("billingCycle", sub.defaultCycle)
        setStep("details")
    }, [form])

    const handleCustomEntry = useCallback(() => {
        setSelectedPopular(null)
        form.setValue("name", "")
        form.setValue("logoUrl", "")
        form.setValue("websiteUrl", "")
        form.setValue("amount", 0)
        setStep("details")
    }, [form])

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
                        handleOpenChange(false)
                    },
                }
            )
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending
    const popularList = POPULAR_SUBSCRIPTIONS[selectedCategory] || []

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || <Button>Add Subscription</Button>}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                {/* Step: Type selection (subscription vs utility) */}
                {step === "type" && !isEdit && (
                    <>
                        <DialogHeader>
                            <DialogTitle>What would you like to add?</DialogTitle>
                            <DialogDescription>
                                Choose the type of recurring payment to track.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => { setFormType("subscription"); setStep("category") }}
                                className="flex-1 flex flex-col items-center gap-2 py-6 px-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
                            >
                                <CreditCard className="h-8 w-8 text-primary" />
                                <span className="font-semibold">Subscription</span>
                                <span className="text-xs text-muted-foreground text-center">Netflix, Spotify, etc.</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setFormType("utility"); setStep("details") }}
                                className="flex-1 flex flex-col items-center gap-2 py-6 px-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
                            >
                                <Zap className="h-8 w-8 text-amber-500" />
                                <span className="font-semibold">Utility Bill</span>
                                <span className="text-xs text-muted-foreground text-center">Electricity, Water, etc.</span>
                            </button>
                        </div>
                    </>
                )}

                {/* Step: Category selection */}
                {step === "category" && !isEdit && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                <button type="button" onClick={() => setStep("type")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mr-2">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                Select Category
                            </DialogTitle>
                            <DialogDescription>
                                Pick a category to see popular subscriptions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {SUBSCRIPTION_CATEGORIES.map((cat) => {
                                const count = POPULAR_SUBSCRIPTIONS[cat]?.length || 0
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleCategorySelect(cat)}
                                        className="flex items-center justify-between gap-2 py-3 px-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left"
                                    >
                                        <span className="text-sm font-medium">{cat}</span>
                                        {count > 0 && (
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* Step: Pick popular subscription */}
                {step === "pick" && !isEdit && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                <button type="button" onClick={() => setStep("category")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mr-2">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {selectedCategory}
                            </DialogTitle>
                            <DialogDescription>
                                Select a service or add a custom one.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {popularList.map((sub) => (
                                <button
                                    key={sub.name}
                                    type="button"
                                    onClick={() => handlePopularSelect(sub)}
                                    className="flex items-center gap-3 py-3 px-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left"
                                >
                                    <div
                                        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                                        style={{ backgroundColor: sub.color + "15" }}
                                    >
                                        <Image
                                            src={sub.logoUrl}
                                            alt={sub.name}
                                            width={22}
                                            height={22}
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{sub.name}</p>
                                        {sub.defaultAmount > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                ₹{sub.defaultAmount}/{sub.defaultCycle === "ANNUAL" ? "yr" : "mo"}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={handleCustomEntry}
                                className="flex items-center gap-3 py-3 px-3 rounded-lg border border-dashed hover:border-primary hover:bg-primary/5 transition-all text-left"
                            >
                                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                                    <PenLine className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Custom</p>
                                    <p className="text-xs text-muted-foreground">Enter manually</p>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* Step: Details form */}
                {step === "details" && (
                    <>
                        {!isEdit && formType === "utility" ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle>
                                        <button type="button" onClick={() => setStep("type")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mr-2">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        Add Utility Bill
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add a utility bill to track your variable expenses.
                                    </DialogDescription>
                                </DialogHeader>
                                <UtilityBillForm
                                    onSuccess={() => {
                                        handleOpenChange(false)
                                        onSuccess?.()
                                    }}
                                    onCancel={() => handleOpenChange(false)}
                                />
                            </>
                        ) : (
                            <>
                                <DialogHeader>
                                    <DialogTitle>
                                        {!isEdit && (
                                            <button type="button" onClick={() => selectedPopular ? setStep("pick") : setStep("category")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mr-2">
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                        )}
                                        {isEdit ? "Edit Subscription" : selectedPopular ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Image src={selectedPopular.logoUrl} alt="" width={20} height={20} className="inline" unoptimized />
                                                {selectedPopular.name}
                                            </span>
                                        ) : "Add Subscription"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {isEdit
                                            ? "Update your subscription details below."
                                            : selectedPopular
                                                ? "Confirm the details and adjust if needed."
                                                : "Fill in your subscription details."}
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        {/* Show name field — pre-filled if popular was selected */}
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

                                        {/* Category — show as dropdown for edit or custom, read-only badge for popular pick */}
                                        {isEdit ? (
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
                                        ) : (
                                            <div>
                                                <p className="text-sm font-medium mb-1.5">Category</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    {selectedCategory}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isPending || !isFormValid}>
                                                {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </>
                        )}
                    </>
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

function UtilityBillForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
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
            form.reset({
                name: "",
                category: "Electricity",
                description: "",
                billingDay: "1",
                amount: 0,
                currency: "INR",
                notes: "",
            })
            onSuccess()
        } catch (error) {
            toast.error("Failed to add utility bill")
        }
    }

    return (
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
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Adding..." : "Create"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
