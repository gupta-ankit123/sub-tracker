import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions[":id"]["mark-paid"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions[":id"]["mark-paid"]["$post"]>

export const useMarkAsPaid = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.subscriptions[":id"]["mark-paid"]["$post"]({ json, param })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to mark as paid")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Payment marked as paid!")
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to mark as paid")
        },
    })
    return mutation;
}
