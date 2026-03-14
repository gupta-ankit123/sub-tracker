"use client"

import { useSubscriptions } from "@/features/subscriptions/api/use-subscriptions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionFormDialog } from "@/features/subscriptions/components/subscription-form-dialog"
import { Plus, Calendar, Clock, AlertCircle } from "lucide-react"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval, isBefore, addDays } from "date-fns"

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
}

export default function UpcomingPage() {
    const { data, isLoading } = useSubscriptions()

    if (isLoading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>
    }

    const subscriptions: Subscription[] = data?.data || []
    const now = new Date()
    
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const next30Days = addDays(now, 30)

    const overdue = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isBefore(billingDate, now)
    })

    const dueThisWeek = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: weekStart, end: weekEnd })
    })

    const dueThisMonth = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: monthStart, end: monthEnd })
    })

    const dueNext30Days = subscriptions.filter(sub => {
        if (sub.status !== "ACTIVE") return false
        const billingDate = parseISO(sub.nextBillingDate)
        return isWithinInterval(billingDate, { start: now, end: next30Days })
    })

    const totalDueThisWeek = dueThisWeek.reduce((sum, sub) => sum + Number(sub.amount), 0)
    const totalDueThisMonth = dueThisMonth.reduce((sum, sub) => sum + Number(sub.amount), 0)
    const totalOverdue = overdue.reduce((sum, sub) => sum + Number(sub.amount), 0)

    if (subscriptions.length === 0) {
        return (
            <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Upcoming Bills</h1>
                        <p className="text-muted-foreground mt-1">Track your upcoming payments.</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold">No subscriptions yet</h3>
                            <p className="text-muted-foreground">Add subscriptions to track upcoming bills.</p>
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

    const renderBillCard = (title: string, bills: Subscription[], total: number, icon: React.ReactNode, color: string) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
                    {bills.length} {bills.length === 1 ? 'bill' : 'bills'}
                </span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{total.toFixed(2)}</div>
                {bills.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {bills.slice(0, 5).map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    {sub.logoUrl ? (
                                        <img src={sub.logoUrl} alt={sub.name} className="w-6 h-6 rounded" />
                                    ) : (
                                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold">
                                            {sub.name.charAt(0)}
                                        </div>
                                    )}
                                    <span>{sub.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium">₹{Number(sub.amount).toFixed(2)}</span>
                                    <span className="text-muted-foreground ml-2 text-xs">
                                        {new Date(sub.nextBillingDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Upcoming Bills</h1>
                        <p className="text-muted-foreground mt-1">Track your upcoming payments.</p>
                    </div>
                    <SubscriptionFormDialog>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subscription
                        </Button>
                    </SubscriptionFormDialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-6">
                    {renderBillCard(
                        "Overdue", 
                        overdue, 
                        totalOverdue, 
                        <AlertCircle className="h-4 w-4 text-red-500" />,
                        "bg-red-100 text-red-700"
                    )}
                    {renderBillCard(
                        "Due This Week", 
                        dueThisWeek, 
                        totalDueThisWeek, 
                        <Clock className="h-4 w-4 text-orange-500" />,
                        "bg-orange-100 text-orange-700"
                    )}
                    {renderBillCard(
                        "Due This Month", 
                        dueThisMonth, 
                        totalDueThisMonth, 
                        <Calendar className="h-4 w-4 text-blue-500" />,
                        "bg-blue-100 text-blue-700"
                    )}
                    {renderBillCard(
                        "Next 30 Days", 
                        dueNext30Days, 
                        dueNext30Days.reduce((sum, sub) => sum + Number(sub.amount), 0), 
                        <Calendar className="h-4 w-4 text-green-500" />,
                        "bg-green-100 text-green-700"
                    )}
                </div>

                {overdue.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Overdue Bills
                        </h2>
                        <div className="space-y-2">
                            {overdue.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {sub.logoUrl ? (
                                            <img src={sub.logoUrl} alt={sub.name} className="w-10 h-10 rounded" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-lg font-bold text-red-600">
                                                {sub.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold">{sub.name}</p>
                                            <p className="text-sm text-red-600">
                                                Was due: {new Date(sub.nextBillingDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-red-600">₹{Number(sub.amount).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
