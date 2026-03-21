"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExpenseFormDialog } from "./expense-form-dialog"
import { ExpenseList } from "./expense-list"
import { BudgetFormDialog } from "./budget-form-dialog"
import { useDeleteBudget } from "../api/use-delete-budget"

interface BudgetCategoryCardProps {
    id: string
    category: string
    limit: number
    spent: number
    month: string
}

export function BudgetCategoryCard({ id, category, limit, spent, month }: BudgetCategoryCardProps) {
    const [expanded, setExpanded] = useState(false)
    const deleteBudget = useDeleteBudget()

    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
    const progressColor = percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-yellow-500" : "bg-green-500"
    const remaining = limit - spent

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{category}</CardTitle>
                    <div className="flex items-center gap-1">
                        <BudgetFormDialog month={month} editData={{ id, category, limit }}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        </BudgetFormDialog>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={deleteBudget.isPending}
                            onClick={() => deleteBudget.mutate({ param: { id } })}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="relative">
                    <Progress value={percentage} className="h-3" />
                    <div
                        className={cn("absolute inset-0 h-3 rounded-full transition-all", progressColor)}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-sm">
                    <span>
                        ₹{spent.toLocaleString("en-IN")} / ₹{limit.toLocaleString("en-IN")}
                    </span>
                    <span className={cn(
                        "font-medium",
                        remaining >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        {remaining >= 0 ? `₹${remaining.toLocaleString("en-IN")} left` : `₹${Math.abs(remaining).toLocaleString("en-IN")} over`}
                    </span>
                </div>
                <div className="flex gap-2">
                    <ExpenseFormDialog budgetId={id} category={category}>
                        <Button variant="outline" size="sm" className="flex-1">
                            <Plus className="h-3.5 w-3.5 mr-1" />Log Expense
                        </Button>
                    </ExpenseFormDialog>
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                {expanded && (
                    <div className="pt-2 border-t">
                        <ExpenseList budgetId={id} />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
