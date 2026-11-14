import { useQuery } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";

export interface GetAdminOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  dateFilter?: string;
  sortOrder?: "asc" | "desc";
}

export const useGetAllOrdersAdmin = (params?: GetAdminOrdersParams) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "admin-orders", params),
    queryFn: async () => {
      const { data } = await apiClient.get("/order/admin/all", {
        params,
      });
      return data.data;
    },
  });
};

export const useGetOrderDetailsAdmin = (
  orderId?: string | number,
  options?: { enabled?: boolean }
) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "admin-order-details", orderId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/order/details`, {
        params: { id: orderId },
      });
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!orderId,
  });
};

export const useGetVendorBroadcastsAdmin = (
  orderId?: string | number,
  options?: { enabled?: boolean }
) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "admin-vendor-broadcasts", orderId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/order/admin/vendor-broadcasts`, {
        params: { orderId },
      });
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!orderId,
  });
};

export const useGetDeliveryBroadcastsAdmin = (
  orderId?: string | number,
  options?: { enabled?: boolean }
) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "admin-delivery-broadcasts", orderId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/order/admin/delivery-broadcasts`, {
        params: { orderId },
      });
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!orderId,
  });
};

