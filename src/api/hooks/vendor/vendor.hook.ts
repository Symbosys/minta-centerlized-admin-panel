import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

export interface GetVendorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const useGetAllVendors = (params?: GetVendorsParams, enabled = true) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useInfiniteQuery({
    queryKey: platformQueryKey(platform, "vendors", params),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get("/vendor/all", {
        params: { ...params, page: pageParam },
      });
      return data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
  });
};

export const useGetVendorById = (id?: string | number, options?: { enabled?: boolean }) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "vendor", id),
    queryFn: async () => {
      const endpoint = id ? `/vendor/${id}` : "/vendor/me";
      const { data } = await apiClient.get(endpoint);
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

export const useGetVendorOrders = (vendorId?: string | number, options?: { enabled?: boolean }) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "vendorOrders", vendorId),
    queryFn: async () => {
      const { data } = await apiClient.get("/order/vendor/all", {
        params: { vendorId },
      });
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!vendorId,
  });
};

export const useGetVendorReviews = (vendorId?: string | number, options?: { enabled?: boolean }) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "vendorReviews", vendorId),
    queryFn: async () => {
      const { data } = await apiClient.get("/vendor/reviews", {
        params: { vendorId },
      });
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!vendorId,
  });
};

export const useGetVendorPayouts = (vendorId?: string | number, options?: { enabled?: boolean }) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "vendorPayouts", vendorId),
    queryFn: async () => {
      const { data } = await apiClient.get("/vendor/payout/all", {
        params: { vendorId },
      });
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!vendorId,
  });
};

export const useUpdateVendor = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string | number; data: FormData | any }) => {
      const endpoint = id ? `/vendor/${id}` : "/vendor/update";
      const isFormData = data instanceof FormData;
      const headers = isFormData ? { "Content-Type": "multipart/form-data" } : undefined;
      const response = await apiClient.put(endpoint, data, { headers });
      return response.data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Vendor updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendors") });
      if (variables.id) queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendor", variables.id) });
      else queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendor") });
    },
    onError: showError,
  });
};

export interface UpdateVendorStatusPayload {
  status: "APPROVED" | "REJECTED" | "BLOCKED";
  rejectReason?: string;
  blockReason?: string;
}

export const useUpdateVendorStatus = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: UpdateVendorStatusPayload }) => {
      const response = await apiClient.patch(`/vendor/${id}/status`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Vendor status updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendors") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "vendor", variables.id) });
    },
    onError: showError,
  });
};
