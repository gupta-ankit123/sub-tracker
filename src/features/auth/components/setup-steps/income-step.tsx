"use client"

import { useState } from "react"
import { Wallet, IndianRupee, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUpdateIncome } from "@/features/budgets/api/use-update-income"
import { toast } from "sonner"

interface IncomeStepProps {
    onComplete: () => void
    onSkip: () => void
}

const QUICK_AMOUNTS = [25000, 50000, 75000, 100000, 150000]

export function IncomeStep({ onComplete, onSkip }: IncomeStepProps) {
    const [income, setIncome] = useState("")
    const updateIncome = useUpdateIncome()

    const handleSubmit = () => {
        const value = parseFloat(income)
        if (!value || value <= 0) {
            toast.error("Please enter a valid income amount")
            return
        }

        updateIncome.mutate(
            { json: { monthlyIncome: value } },
            {
                onSuccess: () => {
                    toast.success("Monthly income saved!")
                    onComplete()
                },
            }
        )
    }

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `${amount / 100000}L`
        if (amount >= 1000) return `${amount / 1000}K`
        return amount.toString()
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-[#00D4AA]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">What&apos;s your monthly income?</h2>
                        <p className="text-sm text-slate-400">This helps us calculate your safe-to-spend budget</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            type="number"
                            placeholder="Enter monthly income"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            className="pl-12 h-14 text-lg bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl focus:border-[#00D4AA] focus:ring-[#00D4AA]/20"
                        />
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 mb-2">Quick pick</p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_AMOUNTS.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setIncome(amount.toString())}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        income === amount.toString()
                                            ? "bg-[#00D4AA] text-black"
                                            : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50"
                                    }`}
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!income || updateIncome.isPending}
                            className="flex-1 h-12 bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-medium rounded-xl"
                        >
                            {updateIncome.isPending ? "Saving..." : "Save & Continue"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onSkip}
                            className="text-slate-400 hover:text-slate-200"
                        >
                            <SkipForward className="h-4 w-4 mr-1" />
                            Skip
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
