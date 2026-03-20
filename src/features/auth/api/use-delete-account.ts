import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.account["$delete"]>;

export const useDeleteAccount = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.auth.account["$delete"]();
            if (!response.ok) {
                const errorData = (await response.json()) as { error?: string };
                throw new Error(errorData.error || "Failed to delete account");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Account deleted successfully");
            queryClient.clear();
            router.push("/sign-in");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete account");
        },
    });

    return mutation;
};
