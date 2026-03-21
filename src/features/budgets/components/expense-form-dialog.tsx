"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateExpense } from "../api/use-create-expense"

interface ExpenseFormDialogProps {
    children: React.ReactNode
    budgetId: string
    category: string
}

export function ExpenseFormDialog({ children, budgetId, category }: ExpenseFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [notes, setNotes] = useState("")
    const { mutate, isPending } = useCreateExpense()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const amountValue = parseFloat(amount)
        if (!description.trim() || isNaN(amountValue) || amountValue <= 0) return

        mutate(
            { json: { budgetId, description: description.trim(), amount: amountValue, date, notes: notes || undefined } },
            { onSuccess: () => { setOpen(false); setDescription(""); setAmount(""); setNotes("") } }
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v)
            if (v) { setDescription(""); setAmount(""); setDate(new Date().toISOString().split("T")[0]); setNotes("") }
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Expense - {category}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Description</Label>
                        <Input
                            placeholder="e.g. Weekly groceries"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Amount (INR)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 3000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Notes (optional)</Label>
                        <Textarea
                            placeholder="Any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Log Expense"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
