import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc"

export const useCreateUtilityBill = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (data: {
            name: string
            category: "Electricity" | "Water" | "Gas" | "Internet" | "Mobile Postpaid" | "Society Maintenance" | "Other"
            description?: string
            billingDay: number
            amount?: number
            currency?: string
            notes?: string
        }) => {
            const response = await client.api.subscriptions["utility-bills"].$post({ json: data })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to create utility bill")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Utility bill added successfully")
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add utility bill")
        },
    })
    return mutation
}

export const useRecordBill = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (data: {
            subscriptionId: string
            billingMonth: string
            amount: number
            unitsConsumed?: number
        }) => {
            const response = await client.api.subscriptions["utility-bills"]["record-bill"].$post({ json: data })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to record bill")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Bill recorded successfully")
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to record bill")
        },
    })
    return mutation
}

export const useCreateEstimate = () => {
    const queryClient = useQueryClient()
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
            const response = await client.api.subscriptions["utility-bills"]["estimate"].$post({ json: data })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to create estimate")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Estimate created successfully")
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
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
            const response = await client.api.subscriptions["utility-bills"].$get()
            if (!response.ok) {
                throw new Error("Failed to fetch utility bills")
            }
            return response.json()
        },
    })
}

export const useBillHistory = (subscriptionId: string) => {
    return useQuery({
        queryKey: ["bill-history", subscriptionId],
        queryFn: async () => {
            const response = await client.api.subscriptions["utility-bills"][":id"]["history"].$get({
                param: { id: subscriptionId }
            })
            if (!response.ok) {
                throw new Error("Failed to fetch bill history")
            }
            return response.json()
        },
        enabled: !!subscriptionId,
    })
}

export const useEstimationAccuracy = (subscriptionId: string) => {
    return useQuery({
        queryKey: ["estimation-accuracy", subscriptionId],
        queryFn: async () => {
            const response = await client.api.subscriptions["utility-bills"][":id"]["accuracy"].$get({
                param: { id: subscriptionId }
            })
            if (!response.ok) {
                throw new Error("Failed to fetch estimation accuracy")
            }
            return response.json()
        },
        enabled: !!subscriptionId,
    })
}

export const useMarkBillRecordPaid = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (recordId: string) => {
            const response = await client.api.subscriptions["utility-bills"]["records"][":id"]["mark-paid"].$patch({
                param: { id: recordId }
            })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to mark as paid")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Bill marked as paid")
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
            queryClient.invalidateQueries({ queryKey: ["bill-history"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to mark as paid")
        },
    })
    return mutation
}

export const useMarkUtilityBillPaid = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async (subscriptionId: string) => {
            const response = await client.api.subscriptions["utility-bills"][":id"]["mark-paid"].$post({
                param: { id: subscriptionId }
            })
            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to mark as paid")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Bill marked as paid")
            queryClient.invalidateQueries({ queryKey: ["utility-bills"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to mark as paid")
        },
    })
    return mutation
}
