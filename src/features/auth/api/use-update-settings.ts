import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.auth.settings["$patch"]>;
type RequestType = InferRequestType<typeof client.api.auth.settings["$patch"]>;

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.settings["$patch"]({ json });
            if (!response.ok) {
                const errorData = (await response.json()) as { error?: string };
                throw new Error(errorData.error || "Failed to update settings");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Settings updated successfully");
            queryClient.invalidateQueries({ queryKey: ["current"] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update settings");
        },
    });

    return mutation;
};
