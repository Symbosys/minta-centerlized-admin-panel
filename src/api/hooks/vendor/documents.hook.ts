import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export const useVerifyVendorDocument = () => {
    const { platform, apiClient } = usePlatformApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post("/vendor/document/verify", data);
            return response.data;
        },
        onSuccess: (data) => {
            showSuccess(data.message || "Document verified/updated successfully");
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorDocument") });
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendors") });
        },
        onError: showError,
    });
};

export const useGetVendorDocument = (vendorId?: string | number, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "vendorDocument", vendorId),
        queryFn: async () => {
            const { data } = await apiClient.get(`/vendor/document/${vendorId}`);
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!vendorId,
    });
};
