import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useBulkMarkAsPaid = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await client.api.subscriptions.bulk["mark-paid"]["$post"]({
                json: { ids }
            })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to bulk mark as paid")
            }

            return await response.json()
        },
        onSuccess: (data) => {
            const count = (data as { data: { count: number } }).data.count
            toast.success(`${count} subscription${count > 1 ? "s" : ""} marked as paid`)
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to bulk mark as paid")
        },
    })
}

export const useBulkDelete = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await client.api.subscriptions.bulk.delete["$post"]({
                json: { ids }
            })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to bulk delete")
            }

            return await response.json()
        },
        onSuccess: (data) => {
            const count = (data as { data: { count: number } }).data.count
            toast.success(`${count} subscription${count > 1 ? "s" : ""} deleted`)
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to bulk delete")
        },
    })
}

export const useBulkCategoryChange = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ ids, category }: { ids: string[]; category: string }) => {
            const response = await client.api.subscriptions.bulk.category["$patch"]({
                json: { ids, category }
            })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to change category")
            }

            return await response.json()
        },
        onSuccess: (data) => {
            const count = (data as { data: { count: number } }).data.count
            toast.success(`Category updated for ${count} subscription${count > 1 ? "s" : ""}`)
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to change category")
        },
    })
}
