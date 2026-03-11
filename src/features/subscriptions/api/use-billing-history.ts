import { toast } from "sonner"
import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"

import { InferResponseType } from "hono"

type ResponseType = InferResponseType<typeof client.api.subscriptions["billing-history"]["$get"]>

export const useBillingHistory = () => {
    const query = useQuery<ResponseType>({
        queryKey: ["billing-history"],
        queryFn: async () => {
            const response = await client.api.subscriptions["billing-history"]["$get"]();
            if (!response.ok) {
                throw new Error("Failed to fetch billing history")
            }
            return await response.json()
        },
    })
    return query;
}
