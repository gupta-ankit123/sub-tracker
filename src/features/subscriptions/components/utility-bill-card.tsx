"use client"

import { useState } from "react"
import { DollarSign, Zap, Droplets, Flame, Wifi, Smartphone, Building, MoreHorizontal, Check, AlertCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useQueryClient } from "@tanstack/react-query"
import { useCreateEstimate } from "../api/use-utility-bills"

interface BillRecord {
    id: string
    billingMonth: string
    amount: number
    unitsConsumed?: number
    billDate?: string
    dueDate?: string
    paidDate?: string
    paymentStatus: string
}

interface BillEstimate {
    id: string
    billingMonth: string
    estimatedAmount: number
    estimationMethod?: string
    confidenceScore?: number
    minAmount?: number
    maxAmount?: number
    actualAmount?: number
    variance?: number
    variancePercentage?: number
}

interface UtilityBill {
    id: string
    name: string
    category: string
    billingDay?: number
    amount?: number
    currency?: string
    billType?: string
    isVariable?: boolean
    status?: string
    paymentStatus?: string
    billRecords?: BillRecord[]
    billEstimates?: BillEstimate[]
}

const categoryIcons: Record<string, React.ReactNode> = {
    "Electricity": <Zap className="h-5 w-5 text-yellow-500" />,
    "Water": <Droplets className="h-5 w-5 text-blue-500" />,
    "Gas": <Flame className="h-5 w-5 text-orange-500" />,
    "Internet": <Wifi className="h-5 w-5 text-purple-500" />,
    "Mobile Postpaid": <Smartphone className="h-5 w-5 text-green-500" />,
    "Mobile Prepaid": <Smartphone className="h-5 w-5 text-green-400" />,
    "Society Maintenance": <Building className="h-5 w-5 text-gray-500" />,
    "Other": <MoreHorizontal className="h-5 w-5 text-gray-500" />,
}

interface UtilityBillCardProps {
    bill: UtilityBill
    onRecordBill?: (data: { amount: number; billingMonth: string }) => void
}

export function UtilityBillCard({ bill, onRecordBill }: UtilityBillCardProps) {
    const [recordDialogOpen, setRecordDialogOpen] = useState(false)
    const [estimateDialogOpen, setEstimateDialogOpen] = useState(false)
    const [recordAmount, setRecordAmount] = useState("")
    const [estimateAmount, setEstimateAmount] = useState("")
    const [minAmount, setMinAmount] = useState("")
    const [maxAmount, setMaxAmount] = useState("")
    const [estimationMethod, setEstimationMethod] = useState<"MANUAL" | "HISTORICAL_AVG" | "WEIGHTED_AVG">("MANUAL")
    const queryClient = useQueryClient()
    const createEstimateMutation = useCreateEstimate()

    const latestRecord = bill.billRecords?.[0]
    const latestEstimate = bill.billEstimates?.[0]

    const currentMonth = new Date()
    const billingDueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), bill.billingDay)
    if (billingDueDate < currentMonth) {
        billingDueDate.setMonth(billingDueDate.getMonth() + 1)
    }

    const getVarianceClass = (variance?: number) => {
        if (!variance) return ""
        if (variance > 0) return "text-red-600"
        if (variance < 0) return "text-green-600"
        return ""
    }

    const handleRecordBill = () => {
        if (recordAmount && onRecordBill) {
            const month = currentMonth.getFullYear() + "-" + 
                String(currentMonth.getMonth() + 1).padStart(2, "0") + "-01"
            onRecordBill({
                amount: parseFloat(recordAmount),
                billingMonth: month
            })
            setRecordDialogOpen(false)
            setRecordAmount("")
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
        }
    }

    const handleCreateEstimate = async () => {
        if (!estimateAmount) return
        
        const month = currentMonth.getFullYear() + "-" + 
            String(currentMonth.getMonth() + 1).padStart(2, "0") + "-01"
        
        try {
            await createEstimateMutation.mutateAsync({
                subscriptionId: bill.id,
                billingMonth: month,
                estimatedAmount: parseFloat(estimateAmount),
                estimationMethod,
                minAmount: minAmount ? parseFloat(minAmount) : undefined,
                maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
            })
            setEstimateDialogOpen(false)
            setEstimateAmount("")
            setMinAmount("")
            setMaxAmount("")
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
        } catch (error) {
            // Error handled in mutation
        }
    }

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                {categoryIcons[bill.category] || categoryIcons["Other"]}
                            </div>
                            <div>
                                <h3 className="font-semibold">{bill.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Due: {billingDueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            {latestEstimate ? (
                                <>
                                    <p className="font-bold text-lg">
                                        ₹{Number(latestEstimate.estimatedAmount).toFixed(0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Estimated</p>
                                </>
                            ) : latestRecord ? (
                                <>
                                    <p className="font-bold text-lg">
                                        ₹{Number(latestRecord.amount).toFixed(0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Last Bill</p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No data</p>
                            )}
                        </div>
                    </div>

                    {latestEstimate && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Range: ₹{Number(latestEstimate.minAmount || 0).toFixed(0)} - ₹{Number(latestEstimate.maxAmount || 0).toFixed(0)}
                                </span>
                                {latestEstimate.confidenceScore && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                                        {Math.round(Number(latestEstimate.confidenceScore) * 100)}% confidence
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {latestEstimate?.variance !== null && latestEstimate?.variance !== undefined && (
                        <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 ${
                            Number(latestEstimate.variance) > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                        }`}>
                            {Number(latestEstimate.variance) > 0 ? (
                                <AlertCircle className="h-4 w-4" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                                {Number(latestEstimate.variance) > 0 ? "+" : ""}₹{Number(latestEstimate.variance).toFixed(0)} 
                                ({latestEstimate.variancePercentage?.toFixed(1)}%) vs estimate
                            </span>
                        </div>
                    )}

                    <div className="mt-3 flex gap-2">
                        <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setRecordDialogOpen(true)}
                        >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Record Bill
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEstimateDialogOpen(true)}
                        >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Estimate
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Bill for {bill.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div>
                            <label className="text-sm font-medium">Bill Amount (₹)</label>
                            <Input 
                                type="number" 
                                placeholder="0.00"
                                value={recordAmount}
                                onChange={(e) => setRecordAmount(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        {latestEstimate && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-sm text-muted-foreground">Estimated: ₹{Number(latestEstimate.estimatedAmount).toFixed(0)}</p>
                                {recordAmount && (
                                    <p className={`text-sm font-medium mt-1 ${
                                        parseFloat(recordAmount) > Number(latestEstimate.estimatedAmount) ? "text-red-600" : "text-green-600"
                                    }`}>
                                        Variance: {parseFloat(recordAmount) > Number(latestEstimate.estimatedAmount) ? "+" : ""}
                                        ₹{(parseFloat(recordAmount) - Number(latestEstimate.estimatedAmount)).toFixed(0)}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setRecordDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleRecordBill} disabled={!recordAmount}>
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={estimateDialogOpen} onOpenChange={setEstimateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Estimate for {bill.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div>
                            <label className="text-sm font-medium">Estimated Amount (₹)</label>
                            <Input 
                                type="number" 
                                placeholder="0.00"
                                value={estimateAmount}
                                onChange={(e) => setEstimateAmount(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Min Amount (₹)</label>
                                <Input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Max Amount (₹)</label>
                                <Input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Estimation Method</label>
                            <div className="flex gap-2 mt-2">
                                <Button 
                                    size="sm" 
                                    variant={estimationMethod === "MANUAL" ? "primary" : "outline"}
                                    onClick={() => setEstimationMethod("MANUAL")}
                                >
                                    Manual
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={estimationMethod === "HISTORICAL_AVG" ? "primary" : "outline"}
                                    onClick={() => setEstimationMethod("HISTORICAL_AVG")}
                                >
                                    Historical Avg
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={estimationMethod === "WEIGHTED_AVG" ? "primary" : "outline"}
                                    onClick={() => setEstimationMethod("WEIGHTED_AVG")}
                                >
                                    Weighted Avg
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setEstimateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreateEstimate} 
                                disabled={!estimateAmount || createEstimateMutation.isPending}
                            >
                                {createEstimateMutation.isPending ? "Saving..." : "Save Estimate"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
