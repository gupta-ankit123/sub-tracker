"use client"

import { useUtilityBills, useRecordBill } from "@/features/subscriptions/api/use-utility-bills"
import { UtilityBillFormDialog } from "@/features/subscriptions/components/utility-bill-form-dialog"
import { UtilityBillCard } from "@/features/subscriptions/components/utility-bill-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Droplets, Flame, Wifi, Smartphone, Building, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface UtilityBill {
    id: string
    name: string
    category: string
    billingDay: number | null
    amount: string | number
    currency: string
    billType: string
    isVariable: boolean
    status: string
    paymentStatus: string
    billRecords: { id: string; billingMonth: string; amount: string | number; paymentStatus: string }[]
    billEstimates: { id: string; billingMonth: string; estimatedAmount: string | number; confidenceScore: string | number | null }[]
}

export default function UtilityBillsPage() {
    const { data, isLoading, error } = useUtilityBills()
    const recordBillMutation = useRecordBill()
    const queryClient = useQueryClient()

    const utilityBills: UtilityBill[] = data?.data || []

    const handleRecordBill = async (billId: string, recordData: { amount: number; billingMonth: string }) => {
        try {
            await recordBillMutation.mutateAsync({
                subscriptionId: billId,
                billingMonth: recordData.billingMonth,
                amount: recordData.amount,
            })
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
            toast.success("Bill recorded successfully!")
        } catch (error) {
            toast.error("Failed to record bill")
        }
    }

    const totalEstimated = utilityBills.reduce((sum: number, bill: UtilityBill) => {
        const latestEstimate = bill.billEstimates?.[0]
        return sum + (latestEstimate ? Number(latestEstimate.estimatedAmount) : 0)
    }, 0)

    const categoryGroups = utilityBills.reduce((acc, bill: UtilityBill) => {
        if (!acc[bill.category]) {
            acc[bill.category] = []
        }
        acc[bill.category].push(bill)
        return acc
    }, {} as Record<string, UtilityBill[]>)

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Failed to load utility bills</h3>
                    <p className="text-muted-foreground">Please try again later</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="h-4 w-64 mt-2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                    <div className="flex-1">
                                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        <div className="h-4 w-24 mt-1 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-6 w-20 mt-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="h-10 w-full mt-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Utility Bills</h1>
                    <p className="text-muted-foreground">Track your variable expenses</p>
                </div>
                <UtilityBillFormDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["utility-bills"] })}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Utility Bill
                    </Button>
                </UtilityBillFormDialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Utility Bills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{utilityBills.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Estimated Monthly
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalEstimated.toFixed(0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            This Month's Bills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {utilityBills.filter(b => {
                                if (b.billingDay == null) return false
                                const dueDay = new Date()
                                dueDay.setDate(b.billingDay)
                                return dueDay.getMonth() === new Date().getMonth()
                            }).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {utilityBills.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Utility Bills Yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Start tracking your electricity, water, gas and other utility bills
                        </p>
                        <UtilityBillFormDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["utility-bills"] })}>
                            <Button>Add Your First Utility Bill</Button>
                        </UtilityBillFormDialog>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(categoryGroups).map(([category, bills]) => (
                        <div key={category}>
                            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                {category === "Electricity" && <Zap className="h-5 w-5 text-yellow-500" />}
                                {category === "Water" && <Droplets className="h-5 w-5 text-blue-500" />}
                                {category === "Gas" && <Flame className="h-5 w-5 text-orange-500" />}
                                {category === "Internet" && <Wifi className="h-5 w-5 text-purple-500" />}
                                {category === "Mobile Postpaid" && <Smartphone className="h-5 w-5 text-green-500" />}
                                {category === "Mobile Prepaid" && <Smartphone className="h-5 w-5 text-green-400" />}
                                {category === "Society Maintenance" && <Building className="h-5 w-5 text-gray-500" />}
                                {category}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {bills.map((bill) => (
                                    <UtilityBillCard 
                                        key={bill.id} 
                                        bill={bill} 
                                        onRecordBill={(data) => handleRecordBill(bill.id, data)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
