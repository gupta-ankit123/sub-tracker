"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateIncome } from "../api/use-update-income"

interface IncomeDialogProps {
    children: React.ReactNode
    currentIncome?: number
}

export function IncomeDialog({ children, currentIncome }: IncomeDialogProps) {
    const [open, setOpen] = useState(false)
    const [income, setIncome] = useState(currentIncome?.toString() || "")
    const { mutate, isPending } = useUpdateIncome()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const value = parseFloat(income)
        if (isNaN(value) || value <= 0) return
        mutate({ json: { monthlyIncome: value } }, {
            onSuccess: () => setOpen(false),
        })
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setIncome(currentIncome?.toString() || "") }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Monthly Income</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="income">Monthly Income (INR)</Label>
                        <Input
                            id="income"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 80000"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
