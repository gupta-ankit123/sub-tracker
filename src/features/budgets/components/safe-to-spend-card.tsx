"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, IndianRupee } from "lucide-react"
import { useSafeToSpend } from "../api/use-safe-to-spend"
import { IncomeDialog } from "./income-dialog"
import { cn } from "@/lib/utils"

interface SafeToSpendCardProps {
    month?: string
}

export function SafeToSpendCard({ month }: SafeToSpendCardProps) {
    const { data, isLoading } = useSafeToSpend(month)
    const sts = data?.data

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="h-24 bg-gray-200 rounded animate-pulse" />
                </CardContent>
            </Card>
        )
    }

    if (!sts || sts.monthlyIncome === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <IndianRupee className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium mb-1">Set your income to track safe-to-spend</p>
                    <p className="text-sm text-muted-foreground mb-3">We'll calculate how much you can safely spend each month.</p>
                    <IncomeDialog>
                        <Button>Set Monthly Income</Button>
                    </IncomeDialog>
                </CardContent>
            </Card>
        )
    }

    const ratio = sts.monthlyIncome > 0 ? sts.safeToSpend / sts.monthlyIncome : 0
    const color = ratio > 0.2 ? "text-green-600" : ratio > 0.1 ? "text-yellow-600" : "text-red-600"
    const bg = ratio > 0.2 ? "bg-green-50" : ratio > 0.1 ? "bg-yellow-50" : "bg-red-50"

    return (
        <Card className={cn(bg)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Safe to Spend
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn("text-4xl font-bold mb-3", color)}>
                    {sts.safeToSpend >= 0 ? "₹" : "-₹"}{Math.abs(sts.safeToSpend).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Monthly Income</span>
                        <span className="font-medium text-foreground">₹{sts.monthlyIncome.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fixed Bills (Subscriptions)</span>
                        <span className="font-medium text-foreground">-₹{sts.fixedBills.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Budget Allocations</span>
                        <span className="font-medium text-foreground">-₹{sts.budgetAllocations.toLocaleString("en-IN")}</span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-end">
                    <IncomeDialog currentIncome={sts.monthlyIncome}>
                        <Button variant="outline" size="sm">Edit Income</Button>
                    </IncomeDialog>
                </div>
            </CardContent>
        </Card>
    )
}
