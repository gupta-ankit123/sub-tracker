"use client"

import { useBillingHistory } from "@/features/subscriptions/api/use-billing-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { Plus, CreditCard, CheckCircle, XCircle, Clock, Filter } from "lucide-react"
import { useState } from "react"

interface BillingRecord {
    id: string
    subscriptionId: string
    amount: string
    currency: string
    billingDate: string
    paymentStatus: string
    paymentMethod: string | null
    transactionId: string | null
    notes: string | null
    createdAt: string
    subscription?: {
        id: string
        name: string
        logoUrl: string | null
    }
}

export default function BillingHistoryPage() {
    const { data, isLoading } = useBillingHistory()
    const [filter, setFilter] = useState<string>("all")

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>
    }

    const history: BillingRecord[] = data?.data || []

    const filteredHistory = filter === "all" 
        ? history 
        : history.filter(item => item.paymentStatus === filter)

    const totalPaid = history
        .filter(item => item.paymentStatus === "SUCCESS")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalPending = history
        .filter(item => item.paymentStatus === "PENDING")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalFailed = history
        .filter(item => item.paymentStatus === "FAILED")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case "FAILED":
                return <XCircle className="h-4 w-4 text-red-500" />
            case "PENDING":
                return <Clock className="h-4 w-4 text-yellow-500" />
            default:
                return <Clock className="h-4 w-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return "bg-green-100 text-green-700"
            case "FAILED":
                return "bg-red-100 text-red-700"
            case "PENDING":
                return "bg-yellow-100 text-yellow-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    if (history.length === 0) {
        return (
            <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Billing History</h1>
                        <p className="text-muted-foreground mt-1">View your payment history.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold">No billing history yet</h3>
                            <p className="text-muted-foreground">Add subscriptions to track your billing history.</p>
                        </div>
                        <SubscriptionFormDialog>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Billing History</h1>
                        <p className="text-muted-foreground mt-1">View your payment history.</p>
                    </div>
                    <SubscriptionFormDialog>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subscription
                        </Button>
                    </SubscriptionFormDialog>
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
                                {history.filter(h => h.paymentStatus === "SUCCESS").length} transactions
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
                                {history.filter(h => h.paymentStatus === "PENDING").length} transactions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalFailed.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                {history.filter(h => h.paymentStatus === "FAILED").length} transactions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Transactions</CardTitle>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="text-sm border rounded-md px-2 py-1"
                            >
                                <option value="all">All</option>
                                <option value="SUCCESS">Success</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {filteredHistory.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No transactions found</p>
                            ) : (
                                filteredHistory.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.subscription?.logoUrl ? (
                                                <img 
                                                    src={item.subscription.logoUrl} 
                                                    alt={item.subscription.name}
                                                    className="w-10 h-10 rounded"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-lg font-bold">
                                                    {item.subscription?.name?.charAt(0) || "?"}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{item.subscription?.name || "Unknown"}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(item.billingDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold">
                                                    {item.currency} {Number(item.amount).toFixed(2)}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(item.paymentStatus)}`}>
                                                {getStatusIcon(item.paymentStatus)}
                                                {item.paymentStatus}
                                            </span>
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
