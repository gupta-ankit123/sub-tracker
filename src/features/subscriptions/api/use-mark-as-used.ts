import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/rpc"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions[":id"]["mark-used"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions[":id"]["mark-used"]["$post"]>

export function useMarkAsUsed() {
  const queryClient = useQueryClient()
  
  return useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await client.api.subscriptions[":id"]["mark-used"]["$post"]({ param })
      if (!response.ok) {
        throw new Error("Failed to mark as used")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Marked as used!")
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark as used")
    },
  })
}
