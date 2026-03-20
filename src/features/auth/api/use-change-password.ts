import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.auth["change-password"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.auth["change-password"]["$patch"]>;

export const useChangePassword = () => {
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth["change-password"]["$patch"]({ json });
            if (!response.ok) {
                const errorData = (await response.json()) as { error?: string };
                throw new Error(errorData.error || "Failed to change password");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Password changed successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to change password");
        },
    });

    return mutation;
};
