"use client"

import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { Plus } from "lucide-react"

export function QuickAddFab() {
    return (
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
            <SubscriptionFormDialog>
                <button
                    aria-label="Quick add subscription or bill"
                    className="group flex items-center justify-center w-14 h-14 rounded-full bg-[#00D4AA] text-[#005643] shadow-[0_8px_30px_rgba(0,212,170,0.4)] hover:shadow-[0_12px_40px_rgba(0,212,170,0.5)] hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="h-6 w-6 stroke-[2.5] transition-transform group-hover:rotate-90" />
                </button>
            </SubscriptionFormDialog>
        </div>
    )
}
