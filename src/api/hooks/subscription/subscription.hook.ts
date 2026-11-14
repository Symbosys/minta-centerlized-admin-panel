import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";

export type SubscriptionType = "DAILY" | "MONTHLY";

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionType;
  price: number | string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    vendorSubscriptions: number;
  };
}

export interface CreateSubscriptionPayload {
  name: string;
  type: SubscriptionType;
  price: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSubscriptionPayload {
  name?: string;
  type?: SubscriptionType;
  price?: number;
  description?: string;
  isActive?: boolean;
}

// ========================================================
// 🎯 Query Hooks
// ========================================================

/**
 * Fetch all subscription plans (Admin)
 */
export const useGetAllSubscriptionPlans = () => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<SubscriptionPlan[]>({
    queryKey: platformQueryKey(platform, "admin-subscription-plans"),
    queryFn: async () => {
      const { data } = await apiClient.get("/subscription/admin");
      return data.data;
    },
  });
};

// ========================================================
// ⚡ Mutation Hooks
// ========================================================

/**
 * Create a new subscription plan
 */
export const useCreateSubscriptionPlan = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSubscriptionPayload) => {
      const { data } = await apiClient.post("/subscription/admin", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-subscription-plans") });
    },
  });
};

/**
 * Update an existing subscription plan
 */
export const useUpdateSubscriptionPlan = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateSubscriptionPayload }) => {
      const { data } = await apiClient.put(`/subscription/admin/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-subscription-plans") });
    },
  });
};

/**
 * Delete or deactivate a subscription plan
 */
export const useDeleteSubscriptionPlan = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/subscription/admin/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-subscription-plans") });
    },
  });
};

// ========================================================
// 🧑‍🍳 Vendor Subscriptions (Audit & Management)
// ========================================================

export interface VendorSubscriptionRecord {
  id: string;
  vendorId: string;
  subscriptionId: string;
  pricePaid: number | string;
  startDate?: string | null;
  endDate?: string | null;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  vendor: {
    id: string;
    shopName?: string | null;
    ownerName?: string | null;
    mobile?: string | null;
    city?: string | null;
    status?: string | null;
    isApproved?: boolean;
  };
  subscription: {
    id: string;
    name: string;
    type: SubscriptionType;
    price: number | string;
    description?: string | null;
    isActive: boolean;
  };
}

export interface VendorSubscriptionsResponse {
  records: VendorSubscriptionRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VendorSubscriptionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  vendorId?: string;
}

/**
 * Fetch all vendor subscriptions (Admin)
 */
export const useGetVendorSubscriptions = (params?: VendorSubscriptionQueryParams) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<VendorSubscriptionsResponse>({
    queryKey: platformQueryKey(platform, "admin-vendor-subscriptions", params),
    queryFn: async () => {
      const { data } = await apiClient.get("/subscription/admin/vendors", { params });
      return data.data;
    },
  });
};

/**
 * Update vendor subscription price or status (Admin)
 */
export const useUpdateVendorSubscriptionPrice = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      pricePaid,
      status,
    }: {
      id: string;
      pricePaid?: number;
      status?: string;
    }) => {
      const { data } = await apiClient.put(`/subscription/admin/vendors/${id}`, {
        pricePaid,
        status,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "admin-vendor-subscriptions") });
    },
  });
};
