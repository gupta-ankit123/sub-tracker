import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.budgets["carry-forward"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.budgets["carry-forward"]["$post"]>

export const useCarryForward = () => {
    const queryClient = useQueryClient()
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.budgets["carry-forward"]["$post"]({ json })
            if (!response.ok) {
                const err = await response.json() as { error?: string }
                throw new Error(err.error || "Failed to carry forward")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Budgets carried forward")
            queryClient.invalidateQueries({ queryKey: ["budgets"] })
        },
        onError: (error) => toast.error(error.message),
    })
}
