"use client"

import { useState } from "react"
import { Target, SkipForward, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BUDGET_CATEGORIES } from "@/features/budgets/schemas"
import { useCreateBudget } from "@/features/budgets/api/use-create-budget"
import { toast } from "sonner"

interface BudgetStepProps {
    onComplete: () => void
    onSkip: () => void
    isFinishing: boolean
}

const SUGGESTED_BUDGETS = [
    { category: "OTT & Entertainment", limit: 1000 },
    { category: "Food Delivery", limit: 3000 },
    { category: "Groceries", limit: 8000 },
    { category: "Dining Out", limit: 5000 },
    { category: "Shopping", limit: 5000 },
    { category: "Transportation", limit: 3000 },
]

export function BudgetStep({ onComplete, onSkip, isFinishing }: BudgetStepProps) {
    const [category, setCategory] = useState("")
    const [limit, setLimit] = useState("")
    const createBudget = useCreateBudget()

    const getCurrentMonth = () => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    }

    const handleSubmit = () => {
        const value = parseFloat(limit)
        if (!category) {
            toast.error("Please select a category")
            return
        }
        if (!value || value <= 0) {
            toast.error("Please enter a valid budget amount")
            return
        }

        createBudget.mutate(
            {
                json: {
                    category,
                    limit: value,
                    month: getCurrentMonth(),
                },
            },
            {
                onSuccess: () => {
                    toast.success("Budget created!")
                    onComplete()
                },
            }
        )
    }

    const handlePickSuggestion = (suggestion: typeof SUGGESTED_BUDGETS[0]) => {
        setCategory(suggestion.category)
        setLimit(suggestion.limit.toString())
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                        <Target className="h-6 w-6 text-[#00D4AA]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Set your first budget</h2>
                        <p className="text-sm text-slate-400">Pick a category and set a monthly spending limit</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Quick suggestions */}
                    <div>
                        <p className="text-xs text-slate-500 mb-2">Popular budgets</p>
                        <div className="grid grid-cols-2 gap-2">
                            {SUGGESTED_BUDGETS.map((s) => (
                                <button
                                    key={s.category}
                                    onClick={() => handlePickSuggestion(s)}
                                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                        category === s.category
                                            ? "border-[#00D4AA] bg-[#00D4AA]/10"
                                            : "border-slate-700/50 bg-slate-900/30 hover:border-slate-500"
                                    }`}
                                >
                                    <span className="text-sm text-white truncate">{s.category}</span>
                                    <span className="text-xs text-slate-400 shrink-0 ml-2">₹{s.limit.toLocaleString()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-700/50 pt-5 space-y-4">
                        <p className="text-xs text-slate-500">Or choose your own</p>

                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-12 bg-slate-900/50 border-slate-600 text-white rounded-xl focus:border-[#00D4AA] focus:ring-[#00D4AA]/20">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {BUDGET_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="text-white hover:bg-slate-700">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                type="number"
                                placeholder="Monthly limit"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="pl-12 h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl focus:border-[#00D4AA] focus:ring-[#00D4AA]/20"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!category || !limit || createBudget.isPending || isFinishing}
                            className="flex-1 h-12 bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-medium rounded-xl"
                        >
                            {createBudget.isPending ? "Creating..." : "Create Budget & Finish"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onSkip}
                            className="text-slate-400 hover:text-slate-200"
                            disabled={isFinishing}
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
