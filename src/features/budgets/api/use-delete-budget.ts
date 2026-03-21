import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.budgets[":id"]["$delete"]>
type ResponseType = InferResponseType<typeof client.api.budgets[":id"]["$delete"]>

export const useDeleteBudget = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.budgets[":id"]["$delete"]({ param })
            if (!response.ok) {
                const err = await response.json() as { error?: string }
                throw new Error(err.error || "Failed to delete budget")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Budget deleted")
            queryClient.invalidateQueries({ queryKey: ["budgets"] })
            queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] })
        },
        onError: (error) => toast.error(error.message),
    })
}
