import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc"

export const useCreateUtilityBill = () => {
    const mutation = useMutation({
        mutationFn: async (data: {
            name: string
            category: string
            description?: string
            billingDay: number
            amount?: number
            currency?: string
            notes?: string
        }) => {
            const response = await (client.api.subscriptions as any)["utility-bills"].$post({ json: data })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to create utility bill")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Utility bill added successfully")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add utility bill")
        },
    })
    return mutation
}

export const useRecordBill = () => {
    const mutation = useMutation({
        mutationFn: async (data: {
            subscriptionId: string
            billingMonth: string
            amount: number
            unitsConsumed?: number
        }) => {
            const response = await (client.api.subscriptions as any)["utility-bills/record-bill"].$post({ json: data })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to record bill")
            }
            return response.json()
        },
    })
    return mutation
}

export const useCreateEstimate = () => {
    const mutation = useMutation({
        mutationFn: async (data: {
            subscriptionId: string
            billingMonth: string
            estimatedAmount: number
            estimationMethod?: "MANUAL" | "HISTORICAL_AVG" | "WEIGHTED_AVG" | "SEASONAL_AVG"
            minAmount?: number
            maxAmount?: number
            notes?: string
        }) => {
            const response = await (client.api.subscriptions as any)["utility-bills/estimate"].$post({ json: data })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to create estimate")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Estimate created successfully")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create estimate")
        },
    })
    return mutation
}

export const useUtilityBills = () => {
    return useQuery({
        queryKey: ["utility-bills"],
        queryFn: async () => {
            const response = await (client.api.subscriptions as any)["utility-bills"].$get()
            if (!response.ok) {
                throw new Error("Failed to fetch utility bills")
            }
            return response.json()
        },
    })
}
