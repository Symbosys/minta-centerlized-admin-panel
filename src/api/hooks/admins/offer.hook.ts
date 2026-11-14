import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformQueryKey, usePlatformApiClient } from "../../apiClient";
import { showError, showSuccess } from "../../../utils/message";

// ─── Types ─────────────────────────────────────────────────────────

export type OfferStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "ARCHIVED";

export type OfferType = "AUTOMATIC" | "PROMO_CODE";

export type DiscountType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "WALLET_CASHBACK_PERCENTAGE"
  | "WALLET_CASHBACK_FLAT"
  | "BUY_X_GET_Y";

export type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export interface OfferMetadata {
  id?: string;
  offerId?: string;
  minCartValue: number;
  minCartItems: number;
  applicableDays: DayOfWeek[];
  usageLimitTotal?: number | null;
  usageLimitPerUser: number;
  currentUsageCount?: number;
  isStackable?: boolean;
  termsAndConditions?: string | null;
  customRules?: any;
  firstOrderOnly?: boolean;
  paymentMethods?: string[];
}

export interface OfferCode {
  id?: string;
  offerId?: string;
  code: string;
  isCaseSensitive?: boolean;
  isActive: boolean;
  maxUses?: number | null;
  usedCount?: number;
  perUserLimit?: number | null;
}

export interface TargetProduct {
  id: string;
  name?: string;
  sellingPrice?: any;
  images?: any[];
}

export interface OfferPeriodRule {
  id?: string;
  offerId?: string;
  periodDurationType: string;
  periodDurationValue: number;
  targetOrderCount: number;
}

export interface Offer {
  id: string | number;
  uuid?: string;
  name?: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  description?: string | null;
  type: OfferType;
  discountType: DiscountType;
  discountValue: number | string;
  maxDiscount?: number | null;
  status: OfferStatus;
  startDate: string;
  endDate: string;
  priority?: number;
  displayOrder?: number;
  bannerImage?: any;
  iconImage?: any;
  isPeriodOffer?: boolean;
  periodRule?: OfferPeriodRule | null;
  metadata?: OfferMetadata | null;
  code?: OfferCode | null;
  codes?: OfferCode[];
  productTargets?: { productId: string; product: TargetProduct }[];
  _count?: {
    redemptions?: number;
    reservations?: number;
    productTargets?: number;
    codes?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface OffersListResponse {
  offers: Offer[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface OfferFilterParams {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Hooks ─────────────────────────────────────────────────────────

export const useGetAllOffers = (filters?: OfferFilterParams) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<OffersListResponse>({
    queryKey: platformQueryKey(platform, "all-offers", filters),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<OffersListResponse | Offer[]>>("/admin/offers/all", {
        params: filters || {},
      });
      if (Array.isArray(data.data)) {
        return {
          offers: data.data,
          pagination: {
            page: 1,
            limit: data.data.length,
            totalCount: data.data.length,
            totalPages: 1,
          },
        };
      }
      return data.data;
    },
  });
};

export const useGetOfferById = (id?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery<Offer>({
    queryKey: platformQueryKey(platform, "offer", id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Offer>>(`/admin/offers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateOffer = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Offer>, Error, FormData>({
    mutationFn: async (payload: FormData) => {
      const { data } = await apiClient.post<ApiResponse<Offer>>("/admin/offers/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Offer created successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-offers") });
    },
    onError: (err: any) => showError(err),
  });
};

export const useUpdateOffer = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Offer>, Error, { id: string | number; payload: FormData }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiClient.put<ApiResponse<Offer>>(`/admin/offers/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: (data, variables) => {
      showSuccess(data.message || "Offer updated successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-offers") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "offer", variables.id) });
    },
    onError: (err: any) => showError(err),
  });
};

export const useUpdateOfferStatus = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<any>, Error, { id: string | number; status: OfferStatus }>({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.patch<ApiResponse<any>>(`/admin/offers/${id}/status`, { status });
      return data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Offer status updated");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-offers") });
    },
    onError: (err: any) => showError(err),
  });
};

export const useDeleteOffer = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<any>, Error, string | number>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete<ApiResponse<any>>(`/admin/offers/${id}`);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Offer deleted successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-offers") });
    },
    onError: (err: any) => showError(err),
  });
};

// ─── Product Offer Attachment Hooks ─────────────────────────────────

export const useGetProductOffers = (productId?: string | number) => {
  const { platform, apiClient } = usePlatformApiClient();
  return useQuery({
    queryKey: platformQueryKey(platform, "product-offers", productId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/admin/offers/product/${productId}`);
      return data.data;
    },
    enabled: !!productId,
  });
};

export const useAttachOffersToProduct = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, offerIds }: { productId: string | number; offerIds: (string | number)[] }) => {
      const { data } = await apiClient.post<ApiResponse<any>>(`/admin/offers/product/${productId}/attach`, {
        offerIds,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      showSuccess("Offers attached to product successfully");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "product-offers", variables.productId) });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "products") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-offers") });
    },
    onError: showError,
  });
};

export const useDetachOfferFromProduct = () => {
  const { platform, apiClient } = usePlatformApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, offerId }: { productId: string | number; offerId: string | number }) => {
      const { data } = await apiClient.delete<ApiResponse<any>>(
        `/admin/offers/product/${productId}/detach/${offerId}`
      );
      return data;
    },
    onSuccess: (_, variables) => {
      showSuccess("Offer detached from product");
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "product-offers", variables.productId) });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "products") });
      queryClient.invalidateQueries({ queryKey: platformQueryKey(platform, "all-offers") });
    },
    onError: showError,
  });
};
