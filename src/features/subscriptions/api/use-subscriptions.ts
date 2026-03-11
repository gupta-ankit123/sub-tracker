import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { InferRequestType, InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.subscriptions["$get"]>

export const useSubscriptions = () => {
    const query = useQuery<ResponseType>({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            const response = await client.api.subscriptions["$get"]();
            if (!response.ok) {
                throw new Error("Failed to fetch subscriptions")
            }
            return await response.json()
        },
    })
    return query;
}
