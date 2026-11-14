import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";
import { AxiosError } from "axios";

export const useCreateAddress = () => {
    const { platform, apiClient } = usePlatformApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (addressData: any) => {
            const { data } = await apiClient.post("/user/address/create", addressData);
            return data;
        },
        onSuccess: (data) => {
            showSuccess(data.message || "Address created successfully");
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "userAddresses") });
        },
        onError: (error: AxiosError | Error) => {
            showError(error);
        },
    });
};

export const useGetAllAddresses = (userId?: string | number, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "userAddresses", userId),
        queryFn: async () => {
            const { data } = await apiClient.get("/user/address/all", {
                params: userId ? { userId } : undefined,
            });
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!userId,
    });
};

export const useGetAddressById = (id: string | number) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "userAddress", id),
        queryFn: async () => {
            const { data } = await apiClient.get(`/user/address/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
};

export const useUpdateAddress = () => {
    const { platform, apiClient } = usePlatformApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, addressData }: { id: string | number; addressData: any }) => {
            const { data } = await apiClient.put(`/user/address/${id}`, addressData);
            return data;
        },
        onSuccess: (data, variables) => {
            showSuccess(data.message || "Address updated successfully");
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "userAddresses") });
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "userAddress", variables.id) });
        },
        onError: (error: AxiosError | Error) => {
            showError(error);
        },
    });
};

export const useDeleteAddress = () => {
    const { platform, apiClient } = usePlatformApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            const { data } = await apiClient.delete(`/user/address/${id}`);
            return data;
        },
        onSuccess: (data) => {
            showSuccess(data.message || "Address deleted successfully");
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "userAddresses") });
        },
        onError: (error: AxiosError | Error) => {
            showError(error);
        },
    });
};
