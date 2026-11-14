import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export const useUpdateVendorInventory = () => {
    const { platform, apiClient } = usePlatformApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ vendorId, data }: { vendorId?: string | number; data: any }) => {
            const endpoint = vendorId ? `/vendor/inventory/update?id=${vendorId}` : "/vendor/inventory/update";
            const response = await apiClient.post(endpoint, data);
            return response.data;
        },
        onSuccess: (data) => {
            showSuccess(data.message || "Inventory updated successfully");
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorCategories") });
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorProducts") });
        },
        onError: showError,
    });
};

export const useGetVendorCategories = (vendorId?: string | number, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "vendorCategories", vendorId),
        queryFn: async () => {
            const endpoint = vendorId ? `/vendor/inventory/categories?vendorId=${vendorId}` : "/vendor/inventory/categories";
            const { data } = await apiClient.get(endpoint);
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!vendorId,
    });
};

export const useGetVendorProducts = (vendorId?: string | number, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "vendorProducts", vendorId),
        queryFn: async () => {
            const endpoint = vendorId ? `/vendor/inventory/products?vendorId=${vendorId}` : "/vendor/inventory/products";
            const { data } = await apiClient.get(endpoint);
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!vendorId,
    });
};
