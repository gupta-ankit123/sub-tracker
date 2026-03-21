"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, CreditCard } from "lucide-react"
import { useBudgetExpenses } from "../api/use-budget-expenses"
import { useDeleteExpense } from "../api/use-delete-expense"

interface ExpenseListProps {
    budgetId: string
}

export function ExpenseList({ budgetId }: ExpenseListProps) {
    const { data, isLoading } = useBudgetExpenses(budgetId)
    const deleteExpense = useDeleteExpense()
    const expenses = data?.data || []

    if (isLoading) return <div className="text-sm text-muted-foreground p-2">Loading...</div>
    if (expenses.length === 0) return <div className="text-sm text-muted-foreground p-2">No expenses yet.</div>

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-10"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {expenses.map((expense) => {
                    const isSub = "isSubscription" in expense && expense.isSubscription
                    return (
                        <TableRow key={expense.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {isSub && <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                                    <span className="font-medium">{expense.description}</span>
                                    {isSub && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Subscription</Badge>}
                                </div>
                                {isSub && "notes" in expense && expense.notes && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{expense.notes}</p>
                                )}
                            </TableCell>
                            <TableCell>{new Date(expense.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</TableCell>
                            <TableCell className="text-right">₹{Number(expense.amount).toLocaleString("en-IN")}</TableCell>
                            <TableCell>
                                {!isSub && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={deleteExpense.isPending}
                                        onClick={() => deleteExpense.mutate({ param: { id: expense.id } })}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
