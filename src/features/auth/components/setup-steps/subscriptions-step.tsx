"use client"

import { useState } from "react"
import { CreditCard, Check, SkipForward, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { POPULAR_SUBSCRIPTIONS, PopularSubscription } from "@/features/subscriptions/data/popular-subscriptions"
import { useCreateSubscription } from "@/features/subscriptions/api/use-create-subscription"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SubscriptionsStepProps {
    onComplete: () => void
    onSkip: () => void
}

const TOP_CATEGORIES = [
    "OTT & Entertainment",
    "Music Streaming",
    "Productivity",
    "Cloud Storage",
    "Food Delivery",
]

export function SubscriptionsStep({ onComplete, onSkip }: SubscriptionsStepProps) {
    const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set())
    const [addedSubs, setAddedSubs] = useState<Set<string>>(new Set())
    const [isAdding, setIsAdding] = useState(false)
    const createSubscription = useCreateSubscription()

    const toggleSub = (name: string) => {
        if (addedSubs.has(name)) return
        setSelectedSubs((prev) => {
            const next = new Set(prev)
            if (next.has(name)) next.delete(name)
            else next.add(name)
            return next
        })
    }

    const findSub = (name: string): { sub: PopularSubscription; category: string } | null => {
        for (const [category, subs] of Object.entries(POPULAR_SUBSCRIPTIONS)) {
            const sub = subs.find((s) => s.name === name)
            if (sub) return { sub, category }
        }
        return null
    }

    const handleAddSelected = async () => {
        if (selectedSubs.size === 0) {
            toast.error("Select at least one subscription")
            return
        }

        setIsAdding(true)
        const today = new Date().toISOString().split("T")[0]
        let successCount = 0

        for (const name of selectedSubs) {
            const found = findSub(name)
            if (!found) continue

            try {
                await createSubscription.mutateAsync({
                    json: {
                        name: found.sub.name,
                        category: found.category,
                        amount: found.sub.defaultAmount,
                        currency: "INR",
                        billingCycle: found.sub.defaultCycle as "MONTHLY" | "ANNUAL" | "WEEKLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ONE_TIME",
                        firstBillingDate: today,
                        autoRenew: true,
                        reminderDays: 3,
                        usageFrequency: "MONTHLY",
                        logoUrl: found.sub.logoUrl,
                        websiteUrl: found.sub.websiteUrl,
                    },
                })
                setAddedSubs((prev) => new Set(prev).add(name))
                successCount++
            } catch {
                // individual error handled by hook toast
            }
        }

        setIsAdding(false)
        setSelectedSubs(new Set())

        if (successCount > 0) {
            toast.success(`Added ${successCount} subscription${successCount > 1 ? "s" : ""}!`)
            onComplete()
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-[#00D4AA]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Which services do you use?</h2>
                        <p className="text-sm text-slate-400">Tap to select, then add them all at once</p>
                    </div>
                </div>

                <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2">
                    {TOP_CATEGORIES.map((category) => {
                        const subs = POPULAR_SUBSCRIPTIONS[category]
                        if (!subs) return null

                        return (
                            <div key={category}>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    {category}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {subs.map((sub) => {
                                        const isSelected = selectedSubs.has(sub.name)
                                        const isAdded = addedSubs.has(sub.name)

                                        return (
                                            <button
                                                key={sub.name}
                                                onClick={() => toggleSub(sub.name)}
                                                disabled={isAdded}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                                    isAdded
                                                        ? "border-[#00D4AA]/30 bg-[#00D4AA]/5 opacity-60"
                                                        : isSelected
                                                            ? "border-[#00D4AA] bg-[#00D4AA]/10 shadow-md shadow-[#00D4AA]/10"
                                                            : "border-slate-700/50 bg-slate-900/30 hover:border-slate-500"
                                                )}
                                            >
                                                <div
                                                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: `${sub.color}20` }}
                                                >
                                                    <Image
                                                        src={sub.logoUrl}
                                                        alt={sub.name}
                                                        width={20}
                                                        height={20}
                                                        className="rounded"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {sub.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {sub.defaultAmount > 0 ? `₹${sub.defaultAmount}/${sub.defaultCycle === "ANNUAL" ? "yr" : "mo"}` : "Free"}
                                                    </p>
                                                </div>
                                                {(isSelected || isAdded) && (
                                                    <Check className={cn(
                                                        "h-4 w-4 shrink-0",
                                                        isAdded ? "text-[#00D4AA]" : "text-[#00D4AA]"
                                                    )} />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex gap-3 pt-5 border-t border-slate-700/50 mt-5">
                    <Button
                        onClick={handleAddSelected}
                        disabled={selectedSubs.size === 0 || isAdding}
                        className="flex-1 h-12 bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-medium rounded-xl"
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            `Add ${selectedSubs.size || ""} Subscription${selectedSubs.size !== 1 ? "s" : ""} & Continue`
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onSkip}
                        className="text-slate-400 hover:text-slate-200"
                        disabled={isAdding}
                    >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip
                    </Button>
                </div>
            </div>
        </div>
    )
}
