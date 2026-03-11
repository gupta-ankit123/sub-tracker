import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions[":id"]["$delete"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions[":id"]["$delete"]>

export const useDeleteSubscription = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const response = await client.api.subscriptions[":id"]["$delete"]({ param })

            if (!response.ok) {
                const errorData = await response.json() as { error?: string }
                throw new Error(errorData.error || "Failed to delete subscription")
            }

            return await response.json()
        },
        onSuccess: () => {
            toast.success("Subscription deleted successfully")
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete subscription")
        },
    })
    return mutation;
}
