import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/rpc"

import { InferRequestType, InferResponseType } from "hono"

type RequestType = InferRequestType<typeof client.api.subscriptions[":id"]["usage-frequency"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.subscriptions[":id"]["usage-frequency"]["$patch"]>

export function useUpdateUsageFrequency() {
  const queryClient = useQueryClient()
  
  return useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.subscriptions[":id"]["usage-frequency"]["$patch"]({ param, json })
      if (!response.ok) {
        throw new Error("Failed to update usage frequency")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Usage frequency updated!")
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update usage frequency")
    },
  })
}
