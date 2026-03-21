"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCarryForward } from "../api/use-carry-forward"

interface CarryForwardDialogProps {
    children: React.ReactNode
    currentMonth: string // YYYY-MM-01
}

function formatMonth(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
}

function getPreviousMonth(dateStr: string): string {
    const d = new Date(dateStr)
    d.setMonth(d.getMonth() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

export function CarryForwardDialog({ children, currentMonth }: CarryForwardDialogProps) {
    const [open, setOpen] = useState(false)
    const { mutate, isPending } = useCarryForward()
    const sourceMonth = getPreviousMonth(currentMonth)

    const handleConfirm = () => {
        mutate(
            { json: { sourceMonth, targetMonth: currentMonth } },
            { onSuccess: () => setOpen(false) }
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Carry Forward Budgets</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Copy all budget limits from <span className="font-medium text-foreground">{formatMonth(sourceMonth)}</span> to <span className="font-medium text-foreground">{formatMonth(currentMonth)}</span>.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Categories that already have budgets in {formatMonth(currentMonth)} will be skipped.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={isPending}>
                            {isPending ? "Copying..." : "Carry Forward"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
