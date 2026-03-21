"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BUDGET_CATEGORIES } from "../schemas"
import { useCreateBudget } from "../api/use-create-budget"
import { useUpdateBudget } from "../api/use-update-budget"

interface BudgetFormDialogProps {
    children: React.ReactNode
    month: string
    editData?: { id: string; category: string; limit: number }
}

export function BudgetFormDialog({ children, month, editData }: BudgetFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState(editData?.category || "")
    const [limit, setLimit] = useState(editData?.limit?.toString() || "")
    const createBudget = useCreateBudget()
    const updateBudget = useUpdateBudget()
    const isPending = createBudget.isPending || updateBudget.isPending

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const limitValue = parseFloat(limit)
        if (isNaN(limitValue) || limitValue <= 0) return

        if (editData) {
            updateBudget.mutate(
                { param: { id: editData.id }, json: { limit: limitValue } },
                { onSuccess: () => setOpen(false) }
            )
        } else {
            if (!category) return
            createBudget.mutate(
                { json: { category, limit: limitValue, month } },
                { onSuccess: () => { setOpen(false); setCategory(""); setLimit("") } }
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v)
            if (v && editData) { setCategory(editData.category); setLimit(editData.limit.toString()) }
            if (v && !editData) { setCategory(""); setLimit("") }
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editData ? "Edit Budget" : "Add Budget"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Category</Label>
                        {editData ? (
                            <Input value={editData.category} disabled />
                        ) : (
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    {BUDGET_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div>
                        <Label>Monthly Limit (INR)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 10000"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : editData ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
