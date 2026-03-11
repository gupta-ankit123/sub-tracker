import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions[":id"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions[":id"]["$patch"]>

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.subscriptions[":id"]["$patch"]({ json, param })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to update subscription")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Subscription updated successfully")
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update subscription")
        },
    })
    return mutation;
}
