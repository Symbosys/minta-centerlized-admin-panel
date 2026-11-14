import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export const useCreateBankAccount = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/vendor/bank/create", data);
      return response.data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Bank account created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorBankAccounts") });
    },
    onError: showError,
  });
};

export const useGetAllVendorBankAccounts = (vendorId?: string | number, options?: { enabled?: boolean }) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "vendorBankAccounts", vendorId),
        queryFn: async () => {
            const { data } = await apiClient.get("/vendor/bank/all", {
                params: vendorId ? { vendorId } : undefined,
            });
            return data.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!vendorId,
    });
};

export const useGetBankAccountById = (bankId: string | number) => {
    const { platform, apiClient } = usePlatformApiClient();
    return useQuery({
        queryKey: platformQueryKey(platform, "vendorBankAccount", bankId),
        queryFn: async () => {
            const { data } = await apiClient.get(`/vendor/bank/detail/${bankId}`);
            return data.data;
        },
        enabled: !!bankId,
    });
};

export const useUpdateBankAccount = () => {
    const { platform, apiClient } = usePlatformApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ bankId, data }: { bankId: string | number, data: any }) => {
            const response = await apiClient.put(`/vendor/bank/update/${bankId}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            showSuccess(data.message || "Bank account updated successfully");
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorBankAccounts") });
            queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendorBankAccount", variables.bankId) });
        },
        onError: showError,
    });
};
