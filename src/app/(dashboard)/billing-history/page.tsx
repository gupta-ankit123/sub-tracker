"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { CreditCard, CheckCircle, Clock, Filter } from "lucide-react"
import { useState } from "react"
import { useMarkAsPaid } from "@/features/subscriptions/api/use-mark-as-paid"
import { useSkipPayment } from "@/features/subscriptions/api/use-skip-payment"
import { Check, SkipForward } from "lucide-react"

interface Subscription {
    id: string
    name: string
    amount: string | number
    currency: string
    billingCycle: string
    category: string
    status: string
    nextBillingDate: string
    logoUrl: string | null
    websiteUrl: string | null
    description: string | null
    autoRenew: boolean
    notes: string | null
    reminderDays: number
    lastPaidDate: string | null
    paymentStatus: string
    paymentMethod: string | null
}

export default function BillingHistoryPage() {
    const { data, isLoading } = useSubscriptions()
    const markAsPaidMutation = useMarkAsPaid()
    const skipPaymentMutation = useSkipPayment()
    const [filter, setFilter] = useState<string>("all")

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>
    }

    const subscriptions: Subscription[] = data?.data || []

    const filteredSubscriptions = filter === "all" 
        ? subscriptions 
        : subscriptions.filter(item => item.paymentStatus === filter)

    const totalPaid = subscriptions
        .filter(item => item.paymentStatus === "SUCCESS")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalPending = subscriptions
        .filter(item => item.paymentStatus === "PENDING")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalOverdue = subscriptions
        .filter(item => item.paymentStatus === "OVERDUE" || item.paymentStatus === "FAILED")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS": return <CheckCircle className="h-4 w-4 text-green-500" />
            case "FAILED": return <Clock className="h-4 w-4 text-red-500" />
            case "OVERDUE": return <Clock className="h-4 w-4 text-red-500" />
            case "PENDING": return <Clock className="h-4 w-4 text-yellow-500" />
            case "SKIPPED": return <SkipForward className="h-4 w-4 text-gray-500" />
            default: return <Clock className="h-4 w-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-green-100 text-green-700"
            case "FAILED": return "bg-red-100 text-red-700"
            case "OVERDUE": return "bg-red-100 text-red-700"
            case "PENDING": return "bg-yellow-100 text-yellow-700"
            case "SKIPPED": return "bg-gray-100 text-gray-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    if (subscriptions.length === 0) {
        return (
            <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Billing History</h1>
                        <p className="text-muted-foreground mt-1">Track your payments.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold">No subscriptions yet</h3>
                            <p className="text-muted-foreground">Add subscriptions to track billing.</p>
                        </div>
                        <SubscriptionFormDialog>
                            <Button>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Add Subscription
                            </Button>
                        </SubscriptionFormDialog>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Billing History</h1>
                    <p className="text-muted-foreground mt-1">Track your payments and billing status.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalPaid.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                {subscriptions.filter(h => h.paymentStatus === "SUCCESS").length} payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalPending.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                {subscriptions.filter(h => h.paymentStatus === "PENDING").length} payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <Clock className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalOverdue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                {subscriptions.filter(h => h.paymentStatus === "OVERDUE" || h.paymentStatus === "FAILED").length} payments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Payment Status</CardTitle>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="text-sm border rounded-md px-2 py-1"
                            >
                                <option value="all">All</option>
                                <option value="SUCCESS">Paid</option>
                                <option value="PENDING">Pending</option>
                                <option value="OVERDUE">Overdue</option>
                                <option value="SKIPPED">Skipped</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {filteredSubscriptions.length === 0 ? (
                                <div className="text-center py-8">
                                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No subscriptions found.</p>
                                </div>
                            ) : (
                                filteredSubscriptions.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.logoUrl ? (
                                                <img 
                                                    src={item.logoUrl} 
                                                    alt={item.name}
                                                    className="w-10 h-10 rounded"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-lg font-bold">
                                                    {item.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Due: {new Date(item.nextBillingDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold">
                                                    {item.currency} {Number(item.amount).toFixed(2)}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.paymentStatus)}`}>
                                                {getStatusIcon(item.paymentStatus)}
                                                {item.paymentStatus}
                                            </span>
                                            {item.paymentStatus === "PENDING" || item.paymentStatus === "OVERDUE" ? (
                                                <div className="flex gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => markAsPaidMutation.mutate({ 
                                                            json: { paymentMethod: 'upi' }, 
                                                            param: { id: item.id } 
                                                        })}
                                                        disabled={markAsPaidMutation.isPending}
                                                    >
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Paid
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => skipPaymentMutation.mutate({ param: { id: item.id } })}
                                                        disabled={skipPaymentMutation.isPending}
                                                    >
                                                        <SkipForward className="h-3 w-3 mr-1" />
                                                        Skip
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
